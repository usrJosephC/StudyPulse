import { fail, ok, type Result } from '../lib/result';
import type { Task, TaskInput } from '../types/domain';
import { client, guarded, unavailable } from './service.utils';

function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export async function listToday(): Promise<Result<Task[]>> {
  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.from('daily_tasks').select('*').eq('task_date', todayInSaoPaulo()).order('id');
    return error ? guarded(error, 'Não foi possível carregar suas tarefas.') : ok((data ?? []) as Task[]);
  } catch (error) {
    return guarded(error, 'Não foi possível carregar suas tarefas.');
  }
}

export async function createTask(input: TaskInput): Promise<Result<Task>> {
  const title = input.title.trim();
  if (!title || title.length > 160) {
    return fail({ code: 'validation', message: 'Informe um título de até 160 caracteres.' });
  }

  const db = client();
  if (!db) return unavailable();

  try {
    const { data: authData, error: authError } = await db.auth.getUser();
    if (authError || !authData.user) return fail({ code: 'auth', message: 'Faça login para criar uma tarefa.' });

    const { data, error } = await db
      .from('daily_tasks')
      .insert({ title, category: input.category?.trim() || 'Geral', task_date: input.task_date ?? todayInSaoPaulo(), user_id: authData.user.id })
      .select()
      .single();
    return error ? guarded(error, 'Não foi possível criar a tarefa.') : ok(data as Task);
  } catch (error) {
    return guarded(error, 'Não foi possível criar a tarefa.');
  }
}

export async function toggleTask(id: number): Promise<Result<Task>> {
  if (!Number.isInteger(id) || id < 1) return fail({ code: 'validation', message: 'Tarefa inválida.' });

  const db = client();
  if (!db) return unavailable();

  try {
    const current = await db.from('daily_tasks').select('done').eq('id', id).single();
    if (current.error) return guarded(current.error, 'Não foi possível atualizar a tarefa.');

    const mutation = current.data.done
      ? await db.rpc('rpc_reopen_task', { task_id: id })
      : await db.rpc('rpc_complete_task', { task_id: id });
    if (mutation.error) return guarded(mutation.error, 'Não foi possível atualizar a tarefa.');

    const updated = await db.from('daily_tasks').select('*').eq('id', id).single();
    return updated.error ? guarded(updated.error, 'Não foi possível carregar a tarefa.') : ok(updated.data as Task);
  } catch (error) {
    return guarded(error, 'Não foi possível atualizar a tarefa.');
  }
}
