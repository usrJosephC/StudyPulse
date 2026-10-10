import { useCallback, useEffect, useState } from 'react';
import type { AppError } from '../lib/result';
import { getHeatmap } from '../services/points.service';

export function useHeatmap(weeks = 4) {
  const [heatmap, setHeatmap] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getHeatmap(weeks);
    if (result.ok) setHeatmap(result.data);
    else setError(result.error);
    setLoading(false);
    return result;
  }, [weeks]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { heatmap, weeks, loading, error, refresh };
}
