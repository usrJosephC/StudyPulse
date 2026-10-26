-- Sprint 2/3: goal lifecycle, reversible points, streak history, badges and
-- weekly reset state. All additions are backwards-compatible with existing RPCs.

alter table public.goals add column if not exists archived_at timestamptz;
create index if not exists goals_user_archived_idx on public.goals(user_id, archived_at);

create table if not exists public.points_reversals (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_event_id bigint not null references public.points_events(id) on delete restrict,
  points integer not null check (points > 0),
  reason text not null default 'reversal',
  created_at timestamptz not null default now(),
  unique(user_id, original_event_id)
);
create index if not exists points_reversals_user_idx on public.points_reversals(user_id, created_at desc);

create table if not exists public.streak_history (
  user_id uuid not null references public.profiles(id) on delete cascade,
  streak_date date not null,
  streak integer not null check (streak >= 0),
  is_record boolean not null default false,
  was_broken boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(user_id, streak_date)
);
create index if not exists streak_history_user_record_idx on public.streak_history(user_id, is_record desc, streak desc);

create table if not exists public.badges (
  code text primary key,
  name text not null,
  description text not null,
  requirement integer not null check (requirement > 0)
);
insert into public.badges(code,name,description,requirement) values
 ('streak_7','Sequência de 7','Complete 7 dias consecutivos',7),
 ('streak_30','Sequência de 30','Complete 30 dias consecutivos',30),
 ('points_100','Primeiros 100','Acumule 100 pontos',100)
on conflict (code) do nothing;
create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_code text not null references public.badges(code) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key(user_id, badge_code)
);

create table if not exists public.weekly_resets (
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  reset_at timestamptz not null default now(),
  primary key(user_id, week_start)
);

create or replace function public.record_check_in_progression() returns trigger
language plpgsql security definer set search_path=pg_catalog,public as $$
declare current_streak integer; previous_streak integer:=0; prior_record integer:=0;
begin
 current_streak:=public.fn_streak(new.user_id);
 select streak into previous_streak from public.streak_history where user_id=new.user_id and streak_date=new.check_date-1;
 select coalesce(max(streak),0) into prior_record from public.streak_history where user_id=new.user_id;
 insert into public.streak_history(user_id,streak_date,streak,is_record,was_broken)
 values(new.user_id,new.check_date,current_streak,current_streak>prior_record,current_streak=1 and coalesce(previous_streak,0)>0)
 on conflict (user_id,streak_date) do update set streak=excluded.streak,is_record=excluded.is_record,was_broken=excluded.was_broken;
 insert into public.user_badges(user_id,badge_code) select new.user_id,b.code from public.badges b where (b.code='streak_7' and current_streak>=7) or (b.code='streak_30' and current_streak>=30) or (b.code='points_100' and (select coalesce(sum(points),0) from public.points_events where user_id=new.user_id)>=100) on conflict do nothing;
 return new;
end; $$;
drop trigger if exists check_ins_progression on public.check_ins;
create trigger check_ins_progression after insert on public.check_ins for each row execute function public.record_check_in_progression();

create or replace function public.rpc_update_goal(goal_id bigint, goal_title text, goal_category text default null, goal_due_date date default null, goal_icon text default null)
returns public.goals language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid := auth.uid(); result public.goals;
begin
 if uid is null then raise exception using errcode='28000', message='Sessão inválida'; end if;
 if goal_title is null or char_length(btrim(goal_title)) not between 1 and 160 then raise exception using errcode='22023', message='Título inválido'; end if;
 update public.goals set title=btrim(goal_title), category=coalesce(nullif(btrim(goal_category),''),category), due_date=goal_due_date, icon=goal_icon
 where id=goal_id and user_id=uid and archived_at is null returning * into result;
 if not found then raise exception using errcode='42501', message='Meta não encontrada'; end if;
 return result;
end; $$;

create or replace function public.rpc_archive_goal(goal_id bigint, archived boolean default true) returns boolean
language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid:=auth.uid(); changed boolean;
begin
 if uid is null then raise exception using errcode='28000'; end if;
 update public.goals set archived_at=case when archived then coalesce(archived_at,now()) else null end
 where id=goal_id and user_id=uid returning true into changed;
 if not found then raise exception using errcode='42501',message='Meta não encontrada'; end if;
 return changed;
end; $$;

create or replace function public.rpc_reverse_points(event_id bigint, reversal_reason text default 'reversal') returns integer
language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid:=auth.uid(); amount integer;
begin
 if uid is null then raise exception using errcode='28000'; end if;
 select points into amount from public.points_events where id=event_id and user_id=uid;
 if amount is null then raise exception using errcode='42501',message='Evento não encontrado'; end if;
 insert into public.points_reversals(user_id,original_event_id,points,reason) values(uid,event_id,amount,coalesce(nullif(btrim(reversal_reason),''),'reversal')) on conflict (user_id,original_event_id) do nothing;
 return case when found then amount else 0 end;
end; $$;

create or replace function public.rpc_reset_weekly() returns boolean
language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid:=auth.uid(); monday date:=date_trunc('week',(timezone('America/Sao_Paulo',now()))::date)::date;
begin
 if uid is null then raise exception using errcode='28000'; end if;
 insert into public.weekly_resets(user_id,week_start) values(uid,monday) on conflict do nothing;
 return found;
end; $$;

create or replace view public.v_user_points with(security_invoker=true) as
 select p.id user_id, coalesce(sum(e.points),0)::bigint-coalesce((select sum(r.points) from public.points_reversals r where r.user_id=p.id),0)::bigint total,
 coalesce(sum(e.points) filter(where e.event_date>=date_trunc('week',(timezone('America/Sao_Paulo',now()))::date)::date),0)::bigint-coalesce((select sum(r.points) from public.points_reversals r where r.user_id=p.id and r.created_at::date>=date_trunc('week',(timezone('America/Sao_Paulo',now()))::date)::date),0)::bigint weekly
 from public.profiles p left join public.points_events e on e.user_id=p.id group by p.id;

alter table public.points_reversals enable row level security;
alter table public.streak_history enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.weekly_resets enable row level security;
create policy points_reversals_own on public.points_reversals for select to authenticated using(user_id=auth.uid());
create policy streak_history_own on public.streak_history for select to authenticated using(user_id=auth.uid());
create policy badges_read on public.badges for select to authenticated using(true);
create policy user_badges_own on public.user_badges for select to authenticated using(user_id=auth.uid());
create policy weekly_resets_own on public.weekly_resets for select to authenticated using(user_id=auth.uid());
revoke all on public.points_reversals,public.streak_history,public.badges,public.user_badges,public.weekly_resets from anon,public;
grant select on public.points_reversals,public.streak_history,public.badges,public.user_badges,public.weekly_resets to authenticated;
revoke all on function public.rpc_update_goal(bigint,text,text,date,text),public.rpc_archive_goal(bigint,boolean),public.rpc_reverse_points(bigint,text),public.rpc_reset_weekly() from public,anon;
grant execute on function public.rpc_update_goal(bigint,text,text,date,text),public.rpc_archive_goal(bigint,boolean),public.rpc_reverse_points(bigint,text),public.rpc_reset_weekly() to authenticated;
revoke all on function public.record_check_in_progression() from public,anon,authenticated;
