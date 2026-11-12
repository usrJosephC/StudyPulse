-- Suporte ao contrato goals.updateProgress sem expor progress via UPDATE direto.
create or replace function public.rpc_update_goal_progress(goal_id bigint, new_progress numeric)
returns numeric
language plpgsql
security definer
set search_path=pg_catalog,public
as $$
declare
  uid uuid := auth.uid();
  result numeric;
begin
  if uid is null then
    raise exception using errcode='28000', message='Sessão inválida';
  end if;
  if new_progress is null or new_progress < 0 or new_progress >= 1 then
    raise exception using errcode='22023', message='Progresso inválido';
  end if;

  update public.goals
     set progress = new_progress
   where id = goal_id and user_id = uid and completed_at is null;
  if not found then
    raise exception using errcode='42501', message='Meta não encontrada';
  end if;
  select progress into result from public.goals where id = goal_id and user_id = uid;
  return result;
end;
$$;

revoke all on function public.rpc_update_goal_progress(bigint,numeric) from public, anon;
grant execute on function public.rpc_update_goal_progress(bigint,numeric) to authenticated;

create or replace function public.log_squad_activity()
returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  insert into public.squad_activity(squad_id,user_id,action,payload)
  select sm.squad_id, new.user_id, tg_argv[0], jsonb_build_object('source_id', new.id)
    from public.squad_members sm where sm.user_id = new.user_id;
  return new;
end;
$$;
drop trigger if exists check_ins_squad_activity on public.check_ins;
create trigger check_ins_squad_activity after insert on public.check_ins for each row execute function public.log_squad_activity('check_in');
drop trigger if exists tasks_squad_activity on public.daily_tasks;
create trigger tasks_squad_activity after update of done on public.daily_tasks for each row when (new.done is true and old.done is distinct from true) execute function public.log_squad_activity('task_done');
drop trigger if exists goals_squad_activity on public.goals;
create trigger goals_squad_activity after update of completed_at on public.goals for each row when (new.completed_at is not null and old.completed_at is null) execute function public.log_squad_activity('goal_done');
revoke all on function public.log_squad_activity() from public, anon, authenticated;

create or replace function public.rpc_reopen_task(task_id bigint)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception using errcode='28000', message='Sessão inválida';
  end if;
  update public.daily_tasks
     set done = false, done_at = null
   where id = task_id and user_id = uid and done = true;
  if not found then
    raise exception using errcode='40901', message='Tarefa não concluída ou não encontrada';
  end if;
  return true;
end;
$$;
revoke all on function public.rpc_reopen_task(bigint) from public, anon;
grant execute on function public.rpc_reopen_task(bigint) to authenticated;

-- O cliente só pode informar campos editáveis na criação. Estado concluído e
-- progresso continuam exclusivos das RPCs que também escrevem no ledger.
revoke insert on public.daily_tasks, public.goals from authenticated;
grant insert(user_id,title,category,task_date) on public.daily_tasks to authenticated;
grant insert(user_id,category,title,due_date,icon) on public.goals to authenticated;

-- O contrato do aplicativo é de uma squad ativa por usuário.
create unique index squad_members_one_squad_per_user_idx on public.squad_members(user_id);

create or replace function public.rpc_leave_squad(target_squad bigint)
returns boolean
language plpgsql
security definer
set search_path=pg_catalog,public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception using errcode='28000', message='Sessão inválida';
  end if;
  delete from public.squad_members where squad_id=target_squad and user_id=uid;
  if not found then
    raise exception using errcode='42501', message='Participação não encontrada';
  end if;
  return true;
end;
$$;

revoke all on function public.rpc_leave_squad(bigint) from public, anon;
grant execute on function public.rpc_leave_squad(bigint) to authenticated;
