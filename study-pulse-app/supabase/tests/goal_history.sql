begin;
select plan(10);

create temp table _goal_history_user (id uuid not null);
insert into _goal_history_user values (extensions.gen_random_uuid());
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'goal-history@example.test', 'not-a-real-password', '{}', '{"name":"Goal History"}', now(), now(), now() from _goal_history_user;
create temp table _goal_history_goal (id bigint not null);
grant select, insert on _goal_history_user, _goal_history_goal to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select id::text from _goal_history_user), true);
with created as (
  insert into public.goals(user_id, title) values ((select id from _goal_history_user), 'Goal history') returning id
) insert into _goal_history_goal select id from created;

select ok((select archived_at is null and completed_at is null from public.goals where id = (select id from _goal_history_goal)), 'goal starts active');
select is(public.rpc_archive_goal((select id from _goal_history_goal), true), true, 'archiving updates the goal');
select is((select count(*)::integer from public.goals where id = (select id from _goal_history_goal) and (archived_at is not null or completed_at is not null)), 1, 'archived goal is in history');
select is(public.rpc_archive_goal((select id from _goal_history_goal), false), true, 'restore clears archived state');
select is((select count(*)::integer from public.goals where id = (select id from _goal_history_goal) and completed_at is null and archived_at is null), 1, 'restored goal returns to active list');
select is(public.rpc_complete_goal((select id from _goal_history_goal)), 30, 'completion awards points once');
select is(public.rpc_complete_goal((select id from _goal_history_goal)), 0, 'repeating completion is idempotent');
select ok((select completed_at is not null and progress = 1 from public.goals where id = (select id from _goal_history_goal)), 'completion is persisted');
select is((select count(*)::integer from public.goals where id = (select id from _goal_history_goal) and (archived_at is not null or completed_at is not null)), 1, 'completed goal appears once in history');
select is((select count(*)::integer from public.points_events where user_id = (select id from _goal_history_user) and source = 'goal_done' and ref_id = (select id from _goal_history_goal)), 1, 'repeated completion does not duplicate points');

select * from finish();
rollback;
