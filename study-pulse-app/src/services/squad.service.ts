import { fail, ok, type Result } from '../lib/result';
import type { RankingEntry, Squad, SquadActivity } from '../types/domain';
import { client, guarded, unavailable } from './service.utils';

export async function getMySquad(): Promise<Result<Squad | null>> {
  const db = client();
  if (!db) return unavailable();

  try {
    const membership = await db.from('squad_members').select('squad_id').order('joined_at').limit(1).maybeSingle();
    if (membership.error) return guarded(membership.error, 'Não foi possível carregar seu grupo.');
    if (!membership.data) return ok(null);

    const { data, error } = await db.from('squads').select('*').eq('id', membership.data.squad_id).single();
    return error ? guarded(error, 'Não foi possível carregar seu grupo.') : ok(data as Squad);
  } catch (error) {
    return guarded(error, 'Não foi possível carregar seu grupo.');
  }
}

export async function getRanking(squadId: number): Promise<Result<RankingEntry[]>> {
  if (!Number.isInteger(squadId) || squadId < 1) return fail({ code: 'validation', message: 'Grupo inválido.' });
  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.rpc('fn_squad_ranking', { target_squad: squadId });
    return error ? guarded(error, 'Não foi possível carregar o ranking.') : ok((data ?? []) as RankingEntry[]);
  } catch (error) {
    return guarded(error, 'Não foi possível carregar o ranking.');
  }
}

export async function getActivity(squadId: number, limit = 20): Promise<Result<SquadActivity[]>> {
  if (!Number.isInteger(squadId) || squadId < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return fail({ code: 'validation', message: 'Parâmetros de atividade inválidos.' });
  }
  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db
      .from('squad_activity')
      .select('*, profiles(name)')
      .eq('squad_id', squadId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return guarded(error, 'Não foi possível carregar as atividades.');

    return ok((data ?? []).map(({ profiles, ...activity }) => ({
      ...activity,
      user_name: profiles?.name ?? 'Estudante',
    })) as SquadActivity[]);
  } catch (error) {
    return guarded(error, 'Não foi possível carregar as atividades.');
  }
}

export async function joinSquad(inviteCode: string): Promise<Result<number>> {
  const code = inviteCode.trim().toUpperCase();
  if (!code) return fail({ code: 'validation', message: 'Informe o código do grupo.' });
  const db = client();
  if (!db) return unavailable();

  try {
    const { data, error } = await db.rpc('rpc_join_squad', { code });
    if (!error) return ok(Number(data));
    const conflict = error.code === '23505';
    return fail({
      code: conflict ? 'conflict' : 'validation',
      message: conflict ? 'Você já está neste grupo.' : 'Código de grupo inválido.',
      cause: error,
    });
  } catch (error) {
    return guarded(error, 'Não foi possível entrar no grupo.');
  }
}

export async function leaveSquad(id: number): Promise<Result<null>> {
  if (!Number.isInteger(id) || id < 1) return fail({ code: 'validation', message: 'Grupo inválido.' });
  const db = client();
  if (!db) return unavailable();

  try {
    const { error } = await db.rpc('rpc_leave_squad', { target_squad: id });
    return error ? guarded(error, 'Não foi possível sair do grupo.') : ok(null);
  } catch (error) {
    return guarded(error, 'Não foi possível sair do grupo.');
  }
}
