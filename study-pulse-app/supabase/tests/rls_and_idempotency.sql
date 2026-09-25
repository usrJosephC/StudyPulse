begin;

select plan(11);

-- Usuários efêmeros: o rollback final remove Auth e os perfis criados pelo trigger.
create temp table _test_users (u1 uuid not null, u2 uuid not null);
insert into _test_users values (extensions.gen_random_uuid(), extensions.gen_random_uuid());

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tap-user-1@example.test', 'not-a-real-password', '{}', '{"name":"Tap User 1"}', now(), now(), now() from _test_users;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tap-user-2@example.test', 'not-a-real-password', '{}', '{"name":"Tap User 2"}', now(), now(), now() from _test_users;

select ok((select count(*) = 2 from public.profiles p join _test_users t on p.id in (t.u1, t.u2)), 'trigger cria os dois profiles a partir de auth.users');

grant select on _test_users to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select u1::text from _test_users), true);

create temp table _rpc_result (payload jsonb);
insert into _rpc_result select public.rpc_check_in(25);
select ok((select payload->>'checkInId' is not null from _rpc_result), 'primeiro check-in retorna id');
select is((select (payload->>'pointsAwarded')::integer from _rpc_result), 10, 'primeiro check-in concede 10 pontos');
select throws_ok($$select public.rpc_check_in(25)$$, '23505', 'Check-in de hoje já realizado', 'segundo check-in no mesmo dia falha como conflito');
select is((select count(*)::integer from public.points_events where user_id = (select u1 from _test_users) and source = 'check_in'), 1, 'retry não duplica o evento de pontos');

select set_config('request.jwt.claim.sub', (select u2::text from _test_users), true);
select is_empty($$select 1 from public.check_ins where user_id = (select u1 from _test_users)$$, 'usuário 2 não lê check-ins do usuário 1');
select is_empty($$select 1 from public.points_events where user_id = (select u1 from _test_users)$$, 'usuário 2 não lê pontos do usuário 1');
select ok(not has_table_privilege('authenticated', 'public.points_events', 'INSERT'), 'cliente não possui INSERT no ledger');
select ok(not has_column_privilege('authenticated', 'public.daily_tasks', 'done', 'UPDATE'), 'cliente não possui UPDATE em done');
select ok(not has_column_privilege('authenticated', 'public.goals', 'progress', 'UPDATE'), 'cliente não possui UPDATE em progress');

select ok(not has_column_privilege('authenticated', 'public.profiles', 'badge', 'UPDATE'), 'cliente nao pode alterar a propria conquista');

select * from finish();
rollback;
