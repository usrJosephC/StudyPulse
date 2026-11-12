begin;
select plan(33);

select is((select count(*)::integer from public.badges), 10, 'catálogo tem exatamente dez conquistas');
select is((select string_agg(code, ',' order by sort_order) from public.badges),
  'first_step,week_warrior,study_century,point_collector,task_starter,goal_getter,goal_complete,focus_hour,squad_player,consistent',
  'catálogo contém os dez códigos estáveis na ordem prevista');
select is((select count(distinct icon)::integer from public.badges), 10, 'cada conquista tem ícone exclusivo');
select is((select count(distinct color)::integer from public.badges), 10, 'cada conquista tem cor exclusiva');
select ok((select bool_and(requirement > 0 and sort_order > 0 and color ~ '^#[0-9A-Fa-f]{6}$' and length(btrim(icon)) > 0) from public.badges), 'requisitos e dados visuais são válidos');
select ok(has_table_privilege('authenticated', 'public.badges', 'SELECT'), 'usuário autenticado pode ler o catálogo');
select ok(not has_table_privilege('authenticated', 'public.user_badges', 'INSERT'), 'cliente não pode inserir conquistas');
select ok(not has_function_privilege('authenticated', 'public.evaluate_user_badges(uuid)', 'EXECUTE'), 'cliente não pode chamar a avaliação de conquistas');
select ok(not has_function_privilege('authenticated', 'public.award_badges_after_event()', 'EXECUTE'), 'cliente não pode executar o trigger de conquistas');

create temp table _achievement_users (owner_id uuid not null, other_id uuid not null);
insert into _achievement_users values (extensions.gen_random_uuid(), extensions.gen_random_uuid());
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select owner_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'achievement-owner@example.test', 'x', '{}'::jsonb, '{"name":"Achievement Owner"}'::jsonb, now(), now(), now()
from _achievement_users
union all
select other_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'achievement-other@example.test', 'x', '{}'::jsonb, '{"name":"Achievement Other"}'::jsonb, now(), now(), now()
from _achievement_users;

select is((select count(*)::integer from public.user_badges where user_id = (select owner_id from _achievement_users)), 0, 'usuário novo começa sem conquistas');

insert into public.check_ins (user_id, check_date, minutes)
select (select owner_id from _achievement_users),
       (timezone('America/Sao_Paulo', now()))::date + day_offset,
       50
from generate_series(-5, 0) as day_offset
order by day_offset;

select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'week_warrior'), 'seis dias ainda não desbloqueiam week_warrior');
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'consistent'), 'seis dias ainda não desbloqueiam consistent');
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'focus_hour'), '300 minutos ainda não desbloqueiam focus_hour');

insert into public.check_ins (user_id, check_date, minutes)
select (select owner_id from _achievement_users),
       (timezone('America/Sao_Paulo', now()))::date + day_offset,
       42
from generate_series(-12, -6) as day_offset
order by day_offset;
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'consistent'), 'treze check-ins ainda não desbloqueiam consistent');
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'focus_hour'), '594 minutos ainda não desbloqueiam focus_hour');

insert into public.check_ins (user_id, check_date, minutes)
values ((select owner_id from _achievement_users), (timezone('America/Sao_Paulo', now()))::date - 13, 5);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'first_step'), 'primeiro check-in desbloqueia first_step');
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'week_warrior'), 'sete dias consecutivos desbloqueiam week_warrior');
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'consistent'), 'quatorze dias distintos desbloqueiam consistent');
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'focus_hour'), '599 minutos ainda não desbloqueiam focus_hour');
insert into public.check_ins (user_id, check_date, minutes)
values ((select owner_id from _achievement_users), (timezone('America/Sao_Paulo', now()))::date - 14, 1);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'focus_hour'), '600 minutos desbloqueiam focus_hour');

insert into public.points_events (user_id, source, ref_id, points)
values ((select owner_id from _achievement_users), 'check_in', 900001, 99);
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'study_century'), '99 pontos ainda não desbloqueiam study_century');
insert into public.points_events (user_id, source, ref_id, points)
values ((select owner_id from _achievement_users), 'check_in', 900003, 1);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'study_century'), 'cem pontos desbloqueiam study_century');

insert into public.points_events (user_id, source, ref_id, points)
values ((select owner_id from _achievement_users), 'streak_bonus', 900002, 399);
select ok(not exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'point_collector'), '499 pontos ainda não desbloqueiam point_collector');
insert into public.points_events (user_id, source, ref_id, points)
values ((select owner_id from _achievement_users), 'streak_bonus', 900004, 1);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'point_collector'), 'quinhentos pontos desbloqueiam point_collector');

insert into public.daily_tasks (user_id, title)
select (select owner_id from _achievement_users), 'Achievement task ' || task_number
from generate_series(1, 10) as task_number;
update public.daily_tasks set done = true, done_at = now()
where user_id = (select owner_id from _achievement_users);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'task_starter'), 'dez tarefas concluídas desbloqueiam task_starter');

insert into public.goals (user_id, category, title)
select (select owner_id from _achievement_users), 'test', 'Achievement goal ' || goal_number
from generate_series(1, 3) as goal_number;
update public.goals set progress = 1, completed_at = now()
where user_id = (select owner_id from _achievement_users);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'goal_complete'), 'uma meta concluída desbloqueia goal_complete');
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'goal_getter'), 'três metas concluídas desbloqueiam goal_getter');

insert into public.squads (name, created_by)
values ('Achievement squad', (select owner_id from _achievement_users));
insert into public.squad_members (squad_id, user_id)
select id, (select owner_id from _achievement_users)
from public.squads where created_by = (select owner_id from _achievement_users);
select ok(exists(select 1 from public.user_badges where user_id = (select owner_id from _achievement_users) and badge_code = 'squad_player'), 'entrar em um grupo desbloqueia squad_player');

select is((select count(*)::integer from public.user_badges where user_id = (select owner_id from _achievement_users)), 10, 'eventos de teste desbloqueiam o catálogo completo');
select public.evaluate_user_badges((select owner_id from _achievement_users));
select public.evaluate_user_badges((select owner_id from _achievement_users));
select is((select count(*)::integer from public.user_badges where user_id = (select owner_id from _achievement_users)), 10, 'avaliação repetida não duplica conquistas');

create temp table _reversal_event (event_id bigint not null);
with created_event as (
  insert into public.points_events (user_id, source, ref_id, points)
  values ((select other_id from _achievement_users), 'check_in', 900005, 99)
  returning id
)
insert into _reversal_event select id from created_event;
insert into public.points_reversals (user_id, original_event_id, points, reason)
values (
  (select other_id from _achievement_users),
  (select event_id from _reversal_event),
  1,
  'achievement threshold test'
);
select public.evaluate_user_badges((select other_id from _achievement_users));
select ok(not exists(select 1 from public.user_badges where user_id = (select other_id from _achievement_users) and badge_code = 'study_century'), 'pontos revertidos não contam para o limite');
insert into public.points_events (user_id, source, ref_id, points)
values ((select other_id from _achievement_users), 'task_done', 900006, 2);
select ok(exists(select 1 from public.user_badges where user_id = (select other_id from _achievement_users) and badge_code = 'study_century'), 'pontos líquidos desbloqueiam ao alcançar 100');

grant select on _achievement_users to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select other_id::text from _achievement_users), true);
select is_empty(
  $$select 1 from public.user_badges where user_id = (select owner_id from _achievement_users)$$,
  'usuário não lê conquistas de outra conta'
);

select * from finish();
rollback;
