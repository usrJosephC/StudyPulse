import { fail, ok, type Result } from '../lib/result';
import type { Badge, StreakRecord, UserBadge } from '../types/domain';
import { client, guarded, unavailable } from './service.utils';

export async function reversePoints(eventId: number, reason = 'reversal'): Promise<Result<number>> {
  if (!Number.isInteger(eventId) || eventId < 1) return fail({ code: 'validation', message: 'Evento de pontos inválido.' });
  const db = client(); if (!db) return unavailable();
  try { const { data, error } = await db.rpc('rpc_reverse_points', { event_id: eventId, reversal_reason: reason.trim() || 'reversal' }); return error ? guarded(error, 'Não foi possível reverter os pontos.') : ok(Number(data ?? 0)); }
  catch (error) { return guarded(error, 'Não foi possível reverter os pontos.'); }
}

export async function listBadges(): Promise<Result<Badge[]>> {
  const db = client(); if (!db) return unavailable();
  try { const { data, error } = await db.from('badges').select('*').order('requirement'); return error ? guarded(error, 'Não foi possível carregar os badges.') : ok((data ?? []) as Badge[]); }
  catch (error) { return guarded(error, 'Não foi possível carregar os badges.'); }
}

export async function listMyBadges(): Promise<Result<UserBadge[]>> {
  const db = client(); if (!db) return unavailable();
  try {
    const [userBadges, badges] = await Promise.all([
      db.from('user_badges').select('*').order('awarded_at', { ascending: false }),
      db.from('badges').select('*').order('requirement'),
    ]);
    if (userBadges.error) return guarded(userBadges.error, 'Não foi possível carregar suas conquistas.');
    if (badges.error) return guarded(badges.error, 'Não foi possível carregar suas conquistas.');
    const badgeByCode = new Map((badges.data ?? []).map((badge) => [badge.code, badge]));
    return ok((userBadges.data ?? []).map((item) => ({
      ...item,
      badge: badgeByCode.get(item.badge_code),
    })) as UserBadge[]);
  }
  catch (error) { return guarded(error, 'Não foi possível carregar suas conquistas.'); }
}

export async function getStreakHistory(limit = 30): Promise<Result<StreakRecord[]>> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 365) return fail({ code: 'validation', message: 'Limite de histórico inválido.' });
  const db = client(); if (!db) return unavailable();
  try { const { data, error } = await db.from('streak_history').select('streak_date,streak,is_record,was_broken').order('streak_date', { ascending: false }).limit(limit); return error ? guarded(error, 'Não foi possível carregar o histórico.') : ok((data ?? []) as StreakRecord[]); }
  catch (error) { return guarded(error, 'Não foi possível carregar o histórico.'); }
}

export async function resetWeekly(): Promise<Result<boolean>> {
  const db = client(); if (!db) return unavailable();
  try { const { data, error } = await db.rpc('rpc_reset_weekly'); return error ? guarded(error, 'Não foi possível registrar o reset semanal.') : ok(Boolean(data)); }
  catch (error) { return guarded(error, 'Não foi possível registrar o reset semanal.'); }
}
