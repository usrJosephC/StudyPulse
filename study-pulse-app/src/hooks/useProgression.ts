import { useCallback, useEffect, useState } from 'react';
import type { AppError } from '../lib/result';
import { listBadges, listMyBadges, getStreakHistory } from '../services/progression.service';
import type { Badge, StreakRecord, UserBadge } from '../types/domain';

export function useProgression() {
  const [catalog, setCatalog] = useState<Badge[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [history, setHistory] = useState<StreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [catalogError, setCatalogError] = useState<AppError | null>(null);
  const [badgesError, setBadgesError] = useState<AppError | null>(null);
  const [historyError, setHistoryError] = useState<AppError | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [catalogResult, badgeResult, historyResult] = await Promise.all([
      listBadges(),
      listMyBadges(),
      getStreakHistory(),
    ]);
    if (catalogResult.ok) setCatalog(catalogResult.data);
    setCatalogError(catalogResult.ok ? null : catalogResult.error);
    if (badgeResult.ok) setBadges(badgeResult.data);
    setBadgesError(badgeResult.ok ? null : badgeResult.error);
    if (historyResult.ok) setHistory(historyResult.data);
    setHistoryError(historyResult.ok ? null : historyResult.error);
    setError(!catalogResult.ok ? catalogResult.error : !badgeResult.ok ? badgeResult.error : !historyResult.ok ? historyResult.error : null);
    setLoading(false);
    if (!catalogResult.ok) return catalogResult;
    if (!badgeResult.ok) return badgeResult;
    if (!historyResult.ok) return historyResult;
    return { ok: true as const, data: { catalog: catalogResult.data, badges: badgeResult.data, history: historyResult.data } };
  }, []);
  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  return { catalog, badges, history, loading, error, catalogError, badgesError, historyError, refresh };
}
