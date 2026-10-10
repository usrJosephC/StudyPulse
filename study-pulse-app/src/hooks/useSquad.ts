import { useCallback, useEffect, useState } from 'react';
import type { AppError } from '../lib/result';
import { getMySquad, joinSquad, leaveSquad } from '../services/squad.service';
import type { Squad } from '../types/domain';

export function useSquad() {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getMySquad();
    if (result.ok) setSquad(result.data);
    else setError(result.error);
    setLoading(false);
    return result;
  }, []);
  const join = useCallback(async (code: string) => {
    setError(null);
    const result = await joinSquad(code);
    if (result.ok) await refresh();
    else setError(result.error);
    return result;
  }, [refresh]);
  const leave = useCallback(async (id: number) => {
    setError(null);
    const result = await leaveSquad(id);
    if (result.ok) setSquad(null);
    else setError(result.error);
    return result;
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { squad, loading, error, refresh, joinSquad: join, leaveSquad: leave };
}
