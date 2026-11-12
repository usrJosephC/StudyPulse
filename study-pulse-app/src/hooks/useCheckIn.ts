import { useCallback, useState } from 'react';
import type { AppError } from '../lib/result';
import { checkInToday } from '../services/checkin.service';
import type { CheckInResult } from '../types/domain';

export function useCheckIn() {
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const checkIn = useCallback(async (minutes = 0) => {
    setLoading(true);
    setError(null);
    const next = await checkInToday(minutes);
    if (next.ok) setResult(next.data);
    else setError(next.error);
    setLoading(false);
    return next;
  }, []);
  return { result, loading, error, checkIn };
}
