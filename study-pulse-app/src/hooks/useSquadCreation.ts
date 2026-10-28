import { useCallback, useState } from 'react';
import type { AppError } from '../lib/result';
import { createSquad } from '../services/squad.service';
export function useSquadCreation() { const [loading, setLoading] = useState(false); const [error, setError] = useState<AppError | null>(null); const create = useCallback(async (name: string, subtitle = '', seasonEndsAt: string | null = null) => { setLoading(true); setError(null); const result = await createSquad(name, subtitle, seasonEndsAt); if (!result.ok) setError(result.error); setLoading(false); return result; }, []); return { createSquad: create, loading, error }; }
