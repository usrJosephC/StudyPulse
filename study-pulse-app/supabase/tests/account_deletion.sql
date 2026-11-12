begin;
select plan(11);

create temp table _deletion_users (target_id uuid not null, other_id uuid not null);
insert into _deletion_users values (extensions.gen_random_uuid(), extensions.gen_random_uuid());
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select target_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'delete-target@example.test', 'x', '{}'::jsonb, '{"name":"Delete Target"}'::jsonb, now(), now(), now() from _deletion_users
union all
select other_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'delete-other@example.test', 'x', '{}'::jsonb, '{"name":"Delete Other"}'::jsonb, now(), now(), now() from _deletion_users;

insert into public.points_events (user_id, source, ref_id, points)
select target_id, 'check_in', 900001, 10 from _deletion_users;
insert into public.points_reversals (user_id, original_event_id, points)
select target_id, e.id, 10 from public.points_events e join _deletion_users u on e.user_id = u.target_id;
insert into public.daily_tasks (user_id, title)
select target_id, 'task to delete' from _deletion_users;
insert into public.goals (user_id, title)
select target_id, 'goal to delete' from _deletion_users;
insert into public.check_ins (user_id, check_date, minutes)
select target_id, current_date, 20 from _deletion_users;
insert into public.weekly_resets (user_id, week_start)
select target_id, date_trunc('week', current_date)::date from _deletion_users;
insert into public.squads (name, created_by)
select 'Deletion test squad', target_id from _deletion_users;
insert into public.squad_activity (squad_id, user_id, action)
select s.id, u.target_id, 'test' from public.squads s join _deletion_users u on s.created_by = u.target_id;

delete from auth.users where id = (select target_id from _deletion_users);

select ok(not exists(select 1 from public.profiles where id=(select target_id from _deletion_users)), 'auth user removal deletes profile');
select ok(not exists(select 1 from public.daily_tasks where user_id=(select target_id from _deletion_users)), 'user tasks cascade');
select ok(not exists(select 1 from public.points_events where user_id=(select target_id from _deletion_users)), 'user points cascade');
select ok(not exists(select 1 from public.points_reversals where user_id=(select target_id from _deletion_users)), 'user reversals cascade without FK restriction');
select ok(not exists(select 1 from public.goals where user_id=(select target_id from _deletion_users)), 'goals cascade');
select ok(not exists(select 1 from public.check_ins where user_id=(select target_id from _deletion_users)), 'check-ins cascade');
select ok(not exists(select 1 from public.user_badges where user_id=(select target_id from _deletion_users)), 'user badges cascade');
select ok(not exists(select 1 from public.streak_history where user_id=(select target_id from _deletion_users)), 'streak history cascades');
select ok(not exists(select 1 from public.weekly_resets where user_id=(select target_id from _deletion_users)), 'weekly reset data cascades');
select ok(not exists(select 1 from public.squads where created_by=(select target_id from _deletion_users)), 'squads owned by the deleted user cascade');
select ok(exists(select 1 from public.profiles where id=(select other_id from _deletion_users)), 'other accounts remain intact');

select * from finish();
rollback;
