import type { SupabaseClient } from '@supabase/supabase-js';
import { fail, ok, type Result } from '../lib/result';
import type { Database } from '../types/database';
import type { Goal, GoalInput } from '../types/domain';
import { client, guarded, unavailable } from './service.utils';

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

async function loadGoal(id: number, db: SupabaseClient<Database>): Promise<Result<Goal>> {
  const { data, error } = await db.from('goals').select('*').eq('id', id).single();
  return error ? guarded(error, 'Não foi possível carregar a meta.') : ok(data as Goal);
}

export async function listActive(): Promise<Result<Goal[]>> {
  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.from('goals').select('*').is('completed_at', null).order('created_at', { ascending: false });
    return error ? guarded(error, 'Não foi possível carregar suas metas.') : ok((data ?? []) as Goal[]);
  } catch (error) {
    return guarded(error, 'Não foi possível carregar suas metas.');
  }
}

export async function createGoal(input: GoalInput): Promise<Result<Goal>> {
  const title = input.title.trim();
  if (!title || title.length > 160) return fail({ code: 'validation', message: 'Informe um título de até 160 caracteres.' });
  if (input.progress !== undefined && input.progress !== 0) {
    return fail({ code: 'validation', message: 'Uma nova meta deve começar com 0% de progresso.' });
  }
  if (input.due_date && !isValidDate(input.due_date)) {
    return fail({ code: 'validation', message: 'Informe a data no formato AAAA-MM-DD.' });
  }

  const db = client();
  if (!db) return unavailable();

  try {
    const { data: authData, error: authError } = await db.auth.getUser();
    if (authError || !authData.user) return fail({ code: 'auth', message: 'Faça login para criar uma meta.' });

    const { data, error } = await db
      .from('goals')
      .insert({
        user_id: authData.user.id,
        title,
        category: input.category?.trim() || 'Geral',
        due_date: input.due_date || null,
        icon: input.icon ?? null,
      })
      .select()
      .single();
    return error ? guarded(error, 'Não foi possível criar a meta.') : ok(data as Goal);
  } catch (error) {
    return guarded(error, 'Não foi possível criar a meta.');
  }
}

export async function updateProgress(id: number, progress: number): Promise<Result<Goal>> {
  if (!Number.isInteger(id) || id < 1 || !Number.isFinite(progress) || progress < 0 || progress >= 1) {
    return fail({ code: 'validation', message: 'Use um progresso entre 0% e 99%; para 100%, conclua a meta.' });
  }

  const db = client();
  if (!db) return unavailable();

  try {
    const { error } = await db.rpc('rpc_update_goal_progress', { goal_id: id, new_progress: progress });
    return error ? guarded(error, 'Não foi possível atualizar o progresso.') : loadGoal(id, db);
  } catch (error) {
    return guarded(error, 'Não foi possível atualizar o progresso.');
  }
}

export async function completeGoal(id: number): Promise<Result<Goal>> {
  if (!Number.isInteger(id) || id < 1) return fail({ code: 'validation', message: 'Meta inválida.' });
  const db = client();
  if (!db) return unavailable();

  try {
    const { error } = await db.rpc('rpc_complete_goal', { goal_id: id });
    return error ? guarded(error, 'Não foi possível concluir a meta.') : loadGoal(id, db);
  } catch (error) {
    return guarded(error, 'Não foi possível concluir a meta.');
  }
}
