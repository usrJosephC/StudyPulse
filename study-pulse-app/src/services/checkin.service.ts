import { fail, ok, type Result } from '../lib/result';
import type { CheckIn, CheckInResult } from '../types/domain';
import { client, guarded, unavailable } from './service.utils';

type RpcCheckIn = {
  checkInId: number;
  pointsAwarded: number;
  streak: number;
};

function parseCheckInResult(value: unknown): RpcCheckIn | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const checkInId = Number(row.checkInId);
  const pointsAwarded = Number(row.pointsAwarded);
  const streak = Number(row.streak);
  if (![checkInId, pointsAwarded, streak].every(Number.isFinite)) return null;
  return { checkInId, pointsAwarded, streak };
}

export async function checkInToday(minutes = 0): Promise<Result<CheckInResult>> {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 1440) {
    return fail({ code: 'validation', message: 'Informe um tempo de estudo entre 0 e 1440 minutos.' });
  }

  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.rpc('rpc_check_in', { input_minutes: Math.round(minutes) });
    if (error) {
      const conflict = error.code === '23505';
      return fail({
        code: conflict ? 'conflict' : 'unknown',
        message: conflict ? 'Você já fez o check-in de hoje.' : 'Não foi possível registrar o check-in.',
        cause: error,
      });
    }

    const rpcResult = parseCheckInResult(data);
    if (!rpcResult) return fail({ code: 'unknown', message: 'O check-in retornou uma resposta inválida.' });

    const checkIn = await db.from('check_ins').select('*').eq('id', rpcResult.checkInId).single();
    if (checkIn.error) return guarded(checkIn.error, 'Não foi possível carregar o check-in.');

    return ok({
      checkIn: checkIn.data as CheckIn,
      pointsAwarded: rpcResult.pointsAwarded,
      streak: rpcResult.streak,
    });
  } catch (error) {
    return guarded(error, 'Não foi possível registrar o check-in.');
  }
}
