import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppError, Result } from '../lib/result';
import { ok } from '../lib/result';
import { getActivity } from '../services/squad.service';
import type { SquadActivity } from '../types/domain';

export function useSquadActivity(id: number | null, limit = 20) {
  const [activities, setActivities] = useState<SquadActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const requestId = useRef(0);
  const refresh = useCallback(async (): Promise<Result<SquadActivity[]>> => {
    const currentRequest = ++requestId.current;
    setError(null);
    if (id === null) {
      setActivities([]);
      setLoading(false);
      return ok([]);
    }
    setActivities([]);
    setLoading(true);
    const result = await getActivity(id, limit);
    if (currentRequest === requestId.current) {
      if (result.ok) {
        setActivities(result.data);
        setError(null);
      } else setError(result.error);
      setLoading(false);
    }
    return result;
  }, [id, limit]);
  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);
  return { activities, loading, error, refresh };
}
