-- Sprint 2 final: persisted achievement catalog and server-owned awards.
-- The UI already contains the stable codes and translated copy; this migration
-- makes the catalog authoritative and awards badges from persisted events.

alter table public.badges
  add column if not exists sort_order integer,
  add column if not exists icon text,
  add column if not exists color text;

do $$
declare
  unsupported_codes text[];
begin
  select array_agg(code order by code)
    into unsupported_codes
    from public.badges
   where code not in (
     'first_step', 'week_warrior', 'study_century', 'point_collector',
     'task_starter', 'goal_getter', 'goal_complete', 'focus_hour',
     'squad_player', 'consistent', 'streak_7', 'streak_30', 'points_100'
   );

  if unsupported_codes is not null then
    raise exception 'Migration 007 found unmapped badge codes: %', array_to_string(unsupported_codes, ', ');
  end if;
end;
$$;

insert into public.badges (code, name, description, requirement, sort_order, icon, color) values
  ('first_step', 'Primeiro Passo', 'Faça seu primeiro check-in.', 1, 1, 'footsteps', '#2563EB'),
  ('week_warrior', 'Guerreiro da Semana', 'Alcance uma sequência de 7 dias.', 7, 2, 'flame', '#EA580C'),
  ('study_century', 'Centena de Estudos', 'Ganhe 100 pontos.', 100, 3, 'radio-button-on', '#16A34A'),
  ('point_collector', 'Colecionador de Pontos', 'Ganhe 500 pontos.', 500, 4, 'trophy', '#CA8A04'),
  ('task_starter', 'Início das Tarefas', 'Conclua 10 tarefas.', 10, 5, 'checkmark-circle', '#7C3AED'),
  ('goal_getter', 'Caçador de Metas', 'Alcance 3 metas.', 3, 6, 'flag', '#DB2777'),
  ('goal_complete', 'Meta Concluída', 'Conclua sua primeira meta.', 1, 7, 'medal', '#0891B2'),
  ('focus_hour', 'Hora de Foco', 'Estude por 600 minutos.', 600, 8, 'time', '#0D9488'),
  ('squad_player', 'Jogador de Equipe', 'Entre em um grupo de estudos.', 1, 9, 'people', '#4F46E5'),
  ('consistent', 'Consistente', 'Faça check-in em 14 dias diferentes.', 14, 10, 'calendar', '#65A30D')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  requirement = excluded.requirement,
  sort_order = excluded.sort_order,
  icon = excluded.icon,
  color = excluded.color;

-- Keep existing awards where their old meaning is covered by the new catalog.
insert into public.user_badges as existing (user_id, badge_code, awarded_at)
select user_id,
       case badge_code
         when 'streak_7' then 'week_warrior'
         when 'streak_30' then 'consistent'
         when 'points_100' then 'study_century'
       end,
       awarded_at
from public.user_badges
where badge_code in ('streak_7', 'streak_30', 'points_100')
on conflict (user_id, badge_code) do update
set awarded_at = least(existing.awarded_at, excluded.awarded_at);

delete from public.user_badges
where badge_code not in (
  'first_step', 'week_warrior', 'study_century', 'point_collector',
  'task_starter', 'goal_getter', 'goal_complete', 'focus_hour',
  'squad_player', 'consistent'
);
delete from public.badges
where code not in (
  'first_step', 'week_warrior', 'study_century', 'point_collector',
  'task_starter', 'goal_getter', 'goal_complete', 'focus_hour',
  'squad_player', 'consistent'
);

alter table public.badges
  alter column sort_order set not null,
  alter column icon set not null,
  alter column color set not null;

create unique index if not exists badges_sort_order_unique_idx on public.badges (sort_order);
create unique index if not exists badges_icon_unique_idx on public.badges (icon);
create unique index if not exists badges_color_unique_idx on public.badges (color);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.badges'::regclass
      and conname = 'badges_visual_fields_check'
  ) then
    alter table public.badges
      add constraint badges_visual_fields_check
      check (
        sort_order > 0
        and length(btrim(icon)) > 0
        and color ~ '^#[0-9A-Fa-f]{6}$'
      );
  end if;
end;
$$;

create or replace function public.record_check_in_progression()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_streak integer;
  previous_streak integer := 0;
  prior_record integer := 0;
begin
  current_streak := public.fn_streak(new.user_id);
  select streak into previous_streak
    from public.streak_history
   where user_id = new.user_id and streak_date = new.check_date - 1;
  select coalesce(max(streak), 0) into prior_record
    from public.streak_history
   where user_id = new.user_id;

  insert into public.streak_history (user_id, streak_date, streak, is_record, was_broken)
  values (
    new.user_id,
    new.check_date,
    current_streak,
    current_streak > prior_record,
    current_streak = 1 and coalesce(previous_streak, 0) > 0
  )
  on conflict (user_id, streak_date) do update
    set streak = excluded.streak,
        is_record = excluded.is_record,
        was_broken = excluded.was_broken;

  return new;
end;
$$;

create or replace function public.evaluate_user_badges(target_user uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_streak integer := 0;
  checkin_count bigint := 0;
  study_minutes bigint := 0;
  earned_points bigint := 0;
  completed_tasks bigint := 0;
  completed_goals bigint := 0;
  is_squad_member boolean := false;
begin
  if target_user is null or not exists (
    select 1 from public.profiles where id = target_user
  ) then
    return;
  end if;

  current_streak := public.fn_streak(target_user);

  select count(distinct check_date), coalesce(sum(minutes), 0)
    into checkin_count, study_minutes
    from public.check_ins
   where user_id = target_user;

  select greatest(
    0,
    coalesce((select sum(points) from public.points_events where user_id = target_user), 0)
      - coalesce((select sum(points) from public.points_reversals where user_id = target_user), 0)
  )
    into earned_points;

  select count(*) into completed_tasks
    from public.daily_tasks
   where user_id = target_user and done;

  select count(*) into completed_goals
    from public.goals
   where user_id = target_user and completed_at is not null;

  select exists(select 1 from public.squad_members where user_id = target_user)
    into is_squad_member;

  insert into public.user_badges (user_id, badge_code)
  select target_user, b.code
    from public.badges b
   where (b.code = 'first_step' and checkin_count >= b.requirement)
      or (b.code = 'week_warrior' and current_streak >= b.requirement)
      or (b.code in ('study_century', 'point_collector') and earned_points >= b.requirement)
      or (b.code = 'task_starter' and completed_tasks >= b.requirement)
      or (b.code in ('goal_getter', 'goal_complete') and completed_goals >= b.requirement)
      or (b.code = 'focus_hour' and study_minutes >= b.requirement)
      or (b.code = 'squad_player' and is_squad_member)
      or (b.code = 'consistent' and checkin_count >= b.requirement)
  on conflict (user_id, badge_code) do nothing;
end;
$$;

create or replace function public.award_badges_after_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.evaluate_user_badges(new.user_id);
  return new;
end;
$$;

drop trigger if exists check_ins_award_badges on public.check_ins;
create trigger check_ins_award_badges
  after insert on public.check_ins
  for each row execute function public.award_badges_after_event();

drop trigger if exists points_events_award_badges on public.points_events;
create trigger points_events_award_badges
  after insert on public.points_events
  for each row execute function public.award_badges_after_event();

drop trigger if exists daily_tasks_award_badges on public.daily_tasks;
create trigger daily_tasks_award_badges
  after update of done on public.daily_tasks
  for each row
  when (new.done is true and old.done is distinct from true)
  execute function public.award_badges_after_event();

drop trigger if exists goals_award_badges on public.goals;
create trigger goals_award_badges
  after update of completed_at on public.goals
  for each row
  when (new.completed_at is not null and old.completed_at is null)
  execute function public.award_badges_after_event();

drop trigger if exists squad_members_award_badges on public.squad_members;
create trigger squad_members_award_badges
  after insert on public.squad_members
  for each row execute function public.award_badges_after_event();

-- Idempotent backfill covers users and events that predate this migration.
do $$
declare
  profile_row record;
begin
  for profile_row in select id from public.profiles loop
    perform public.evaluate_user_badges(profile_row.id);
  end loop;
end;
$$;

revoke all on function public.evaluate_user_badges(uuid) from public, anon, authenticated;
revoke all on function public.award_badges_after_event() from public, anon, authenticated;
revoke all on public.badges, public.user_badges from anon, public, authenticated;
grant select on public.badges, public.user_badges to authenticated;
