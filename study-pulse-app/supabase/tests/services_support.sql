begin;
select plan(19);
select ok(has_function_privilege('authenticated', 'public.rpc_update_goal_progress(bigint,numeric)', 'EXECUTE'), 'RPC de progresso exposta');
select ok(not has_column_privilege('authenticated', 'public.goals', 'progress', 'UPDATE'), 'progress protegido');
select ok(has_function_privilege('authenticated', 'public.rpc_complete_goal(bigint)', 'EXECUTE'), 'conclusao via RPC');
select ok(not has_table_privilege('authenticated', 'public.squad_activity', 'INSERT'), 'feed sem INSERT direto');
select ok((select count(*) = 3 from pg_trigger where tgname in ('check_ins_squad_activity','tasks_squad_activity','goals_squad_activity')), 'triggers de feed existem');
select ok(has_function_privilege('authenticated', 'public.fn_heatmap(uuid,integer)', 'EXECUTE'), 'assinatura heatmap');
select ok(has_function_privilege('authenticated', 'public.fn_squad_ranking(bigint)', 'EXECUTE'), 'assinatura ranking');
select ok(has_function_privilege('authenticated', 'public.rpc_reopen_task(bigint)', 'EXECUTE'), 'RPC de reabertura exposta');
select ok(has_function_privilege('authenticated', 'public.rpc_leave_squad(bigint)', 'EXECUTE'), 'RPC de saída da squad exposta');
select ok(not has_column_privilege('authenticated', 'public.daily_tasks', 'done', 'INSERT'), 'done protegido no insert');
select ok(not has_column_privilege('authenticated', 'public.goals', 'progress', 'INSERT'), 'progress protegido no insert');
select ok(has_column_privilege('authenticated', 'public.daily_tasks', 'title', 'INSERT'), 'campos editáveis de tarefa liberados');
select ok(has_column_privilege('authenticated', 'public.goals', 'title', 'INSERT'), 'campos editáveis de meta liberados');
select has_index('public', 'squad_members', 'squad_members_one_squad_per_user_idx', 'uma squad ativa por usuário');
create temp table _support_users (u1 uuid, u2 uuid);
insert into _support_users values (extensions.gen_random_uuid(), extensions.gen_random_uuid());
grant select on _support_users to authenticated;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select u1, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'support-1@example.test', 'x', '{}'::jsonb, '{"name":"Support 1"}'::jsonb, now(), now(), now() from _support_users
union all
select u2, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'support-2@example.test', 'x', '{}'::jsonb, '{"name":"Support 2"}'::jsonb, now(), now(), now() from _support_users;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select u1::text from _support_users), true);
select public.rpc_create_squad('Support squad');
create temp table _task_ids (id bigint);
insert into public.daily_tasks(user_id, title) values ((select u1 from _support_users), 'Tarefa de teste');
insert into _task_ids select max(id) from public.daily_tasks where user_id=(select u1 from _support_users);
select public.rpc_complete_task((select id from _task_ids));
select public.rpc_reopen_task((select id from _task_ids));
select ok((select not done and done_at is null from public.daily_tasks where id=(select id from _task_ids)), 'reabertura limpa done e done_at');
select ok((select count(*)=1 from public.points_events where user_id=(select u1 from _support_users) and source='task_done' and ref_id=(select id from _task_ids)), 'reabertura não remove nem repete pontos');
create temp table _goal_ids (id bigint);
with inserted as (
  insert into public.goals(user_id, title)
  values ((select u1 from _support_users), 'Meta de teste')
  returning id
)
insert into _goal_ids select id from inserted;
select set_config('request.jwt.claim.sub', (select u2::text from _support_users), true);
select throws_ok(
  $$ select public.rpc_update_goal_progress((select id from _goal_ids), 0.5) $$,
  '42501',
  'Meta não encontrada',
  'usuário não altera meta de outro usuário'
);
select set_config('request.jwt.claim.sub', (select u1::text from _support_users), true);
select public.rpc_check_in(10);
select ok((select count(*) > 0 from public.squad_activity sa join public.squad_members sm on sm.squad_id=sa.squad_id where sm.user_id=(select u1 from _support_users) and sa.action='check_in'), 'check-in gera evento');
select public.rpc_leave_squad((select squad_id from public.squad_members where user_id=(select u1 from _support_users)));
select ok((select count(*)=0 from public.squad_members where user_id=(select u1 from _support_users)), 'usuário sai da própria squad');
select * from finish();
rollback;
