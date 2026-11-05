import { useCallback, useEffect, useState } from 'react';
import type { AppError } from '../lib/result';
import { listMyBadges, getStreakHistory } from '../services/progression.service';
import type { StreakRecord, UserBadge } from '../types/domain';

export function useProgression() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [history, setHistory] = useState<StreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const refresh = useCallback(async () => { setLoading(true); setError(null); const [b, h] = await Promise.all([listMyBadges(), getStreakHistory()]); if (b.ok) setBadges(b.data); else setError(b.error); if (h.ok) setHistory(h.data); else setError(h.error); setLoading(false); if (!b.ok) return b; if (!h.ok) return h; return { ok: true as const, data: { badges: b.data, history: h.data } }; }, []);
  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  return { badges, history, loading, error, refresh };
}
