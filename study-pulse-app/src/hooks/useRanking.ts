import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppError, Result } from '../lib/result';
import { ok } from '../lib/result';
import { getRanking } from '../services/squad.service';
import type { RankingEntry } from '../types/domain';

export function useRanking(id: number | null) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const requestId = useRef(0);
  const refresh = useCallback(async (): Promise<Result<RankingEntry[]>> => {
    const currentRequest = ++requestId.current;
    setError(null);
    if (id === null) {
      setRanking([]);
      setLoading(false);
      return ok([]);
    }
    setRanking([]);
    setLoading(true);
    const result = await getRanking(id);
    if (currentRequest === requestId.current) {
      if (result.ok) {
        setRanking(result.data);
        setError(null);
      } else setError(result.error);
      setLoading(false);
    }
    return result;
  }, [id]);
  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);
  return { ranking, loading, error, refresh };
}
