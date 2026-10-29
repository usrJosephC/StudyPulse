begin;
select plan(8);

select ok(has_function_privilege('authenticated', 'public.rpc_update_squad(bigint,text,text)', 'EXECUTE'), 'RPC de edição exposta');
select ok(not has_function_privilege('anon', 'public.rpc_update_squad(bigint,text,text)', 'EXECUTE'), 'RPC não exposta anonimamente');
select ok(not has_table_privilege('authenticated', 'public.squads', 'UPDATE'), 'edição direta de squads permanece protegida');

create temp table _squad_update_users (owner_id uuid, member_id uuid);
insert into _squad_update_users values (extensions.gen_random_uuid(), extensions.gen_random_uuid());
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
select owner_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'squad-owner@example.test', 'x', '{}'::jsonb, '{}', now(), now(), now() from _squad_update_users
union all
select member_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'squad-member@example.test', 'x', '{}'::jsonb, '{}', now(), now(), now() from _squad_update_users;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select owner_id::text from _squad_update_users), true);
select public.rpc_create_squad('Original squad', 'Original description');
create temp table _created_squad as select id from public.squads where created_by = (select owner_id from _squad_update_users);
select ok((select name = 'Updated squad' from public.rpc_update_squad((select id from _created_squad), 'Updated squad', 'Updated description')), 'criador atualiza nome e descrição');
select throws_ok($$ select public.rpc_update_squad((select id from _created_squad), '   ', 'Updated') $$, '22023', 'Nome de squad inválido', 'nome vazio é rejeitado');
select throws_ok($$ select public.rpc_update_squad((select id from _created_squad), 'Updated squad', repeat('x', 161)) $$, '22023', 'Descrição de squad inválida', 'descrição acima de 160 caracteres é rejeitada');
select set_config('request.jwt.claim.sub', (select member_id::text from _squad_update_users), true);
select throws_ok($$ select public.rpc_update_squad((select id from _created_squad), 'Tampered', 'Tampered') $$, '42501', 'Somente o criador pode editar o grupo', 'membro não pode editar grupo');
select ok((select name = 'Updated squad' and subtitle = 'Updated description' from public.squads where id = (select id from _created_squad)), 'tentativa do membro não altera o grupo');

select * from finish();
rollback;
