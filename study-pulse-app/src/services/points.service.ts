import { fail, ok, type Result } from '../lib/result';
import type { Points } from '../types/domain';
import { client, guarded, unavailable } from './service.utils';

export async function getPoints(): Promise<Result<Points>> {
  const db = client();
  if (!db) return unavailable();

  try {
    const { data: authData, error: authError } = await db.auth.getUser();
    if (authError || !authData.user) return fail({ code: 'auth', message: 'Faça login para ver seus pontos.' });

    const { data, error } = await db
      .from('v_user_points')
      .select('total,weekly')
      .eq('user_id', authData.user.id)
      .maybeSingle();
    if (error) return guarded(error, 'Não foi possível carregar seus pontos.');

    return ok({ total: Number(data?.total ?? 0), weekly: Number(data?.weekly ?? 0) });
  } catch (error) {
    return guarded(error, 'Não foi possível carregar seus pontos.');
  }
}

export async function getStreak(): Promise<Result<number>> {
  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.rpc('fn_streak');
    return error ? guarded(error, 'Não foi possível carregar sua sequência.') : ok(Number(data ?? 0));
  } catch (error) {
    return guarded(error, 'Não foi possível carregar sua sequência.');
  }
}

export async function getHeatmap(weeks = 4): Promise<Result<number[][]>> {
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
    return fail({ code: 'validation', message: 'Período do mapa inválido.' });
  }

  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.rpc('fn_heatmap', { weeks });
    if (error) return guarded(error, 'Não foi possível carregar seu mapa de atividade.');

    const heatmap = Array.from({ length: weeks }, () => Array<number>(7).fill(0));
    const rows = [...(data ?? [])].sort((a, b) => a.check_date.localeCompare(b.check_date));
    rows.slice(-weeks * 7).forEach((row, index) => {
      const week = Math.floor(index / 7);
      const day = index % 7;
      heatmap[week][day] = Math.max(0, Math.min(4, Number(row.intensity)));
    });
    return ok(heatmap);
  } catch (error) {
    return guarded(error, 'Não foi possível carregar seu mapa de atividade.');
  }
}
