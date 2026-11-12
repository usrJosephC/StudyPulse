-- Allow only a squad creator to update its user-editable settings.
create or replace function public.rpc_update_squad(
  target_squad bigint,
  squad_name text,
  squad_subtitle text default ''
) returns public.squads
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  uid uuid := auth.uid();
  updated_squad public.squads;
begin
  if uid is null then
    raise exception using errcode = '28000', message = 'Sessão inválida';
  end if;

  if target_squad is null or target_squad < 1 then
    raise exception using errcode = '22023', message = 'Grupo inválido';
  end if;

  if squad_name is null or char_length(btrim(squad_name)) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'Nome de squad inválido';
  end if;

  if squad_subtitle is not null and char_length(squad_subtitle) > 160 then
    raise exception using errcode = '22023', message = 'Descrição de squad inválida';
  end if;

  update public.squads
     set name = btrim(squad_name),
         subtitle = btrim(coalesce(squad_subtitle, ''))
   where id = target_squad
     and created_by = uid
  returning * into updated_squad;

  if not found then
    raise exception using errcode = '42501', message = 'Somente o criador pode editar o grupo';
  end if;

  return updated_squad;
end;
$$;

revoke all on function public.rpc_update_squad(bigint, text, text) from public, anon;
grant execute on function public.rpc_update_squad(bigint, text, text) to authenticated;
