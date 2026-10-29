import { useCallback, useEffect, useState } from 'react';
import type { AppError } from '../lib/result';
import { archiveGoal, completeGoal, createGoal, listActive, listArchived, updateGoal, updateProgress } from '../services/goals.service';
import type { Goal, GoalInput, GoalUpdate } from '../types/domain';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [archivedGoals, setArchivedGoals] = useState<Goal[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [archivedError, setArchivedError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listActive();
    if (result.ok) setGoals(result.data);
    else setError(result.error);
    setLoading(false);
    return result;
  }, []);

  const add = useCallback(async (input: GoalInput) => {
    setError(null);
    const result = await createGoal(input);
    if (result.ok) setGoals((current) => [result.data, ...current]);
    else setError(result.error);
    return result;
  }, []);

  const progress = useCallback(async (id: number, value: number) => {
    setError(null);
    const result = await updateProgress(id, value);
    if (result.ok) setGoals((current) => current.map((goal) => goal.id === id ? result.data : goal));
    else setError(result.error);
    return result;
  }, []);

  const complete = useCallback(async (id: number) => {
    setError(null);
    const result = await completeGoal(id);
    if (result.ok) setGoals((current) => current.filter((goal) => goal.id !== id));
    else setError(result.error);
    return result;
  }, []);

  const edit = useCallback(async (id: number, input: GoalUpdate) => {
    setError(null);
    const result = await updateGoal(id, input);
    if (result.ok) setGoals((current) => current.map((goal) => goal.id === id ? result.data : goal));
    else setError(result.error);
    return result;
  }, []);

  const archive = useCallback(async (id: number) => {
    setError(null);
    const result = await archiveGoal(id);
    if (result.ok) setGoals((current) => current.filter((goal) => goal.id !== id));
    else setError(result.error);
    return result;
  }, []);

  const refreshArchived = useCallback(async () => {
    setArchivedLoading(true);
    setArchivedError(null);
    const result = await listArchived();
    if (result.ok) setArchivedGoals(result.data);
    else setArchivedError(result.error);
    setArchivedLoading(false);
    return result;
  }, []);

  const restore = useCallback(async (id: number) => {
    setArchivedError(null);
    const result = await archiveGoal(id, false);
    if (!result.ok) {
      setArchivedError(result.error);
      return result;
    }

    setArchivedGoals((current) => current.filter((goal) => goal.id !== id));
    const activeResult = await listActive();
    if (activeResult.ok) setGoals(activeResult.data);
    else setError(activeResult.error);
    return result;
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  return {
    goals,
    loading,
    error,
    archivedGoals,
    archivedLoading,
    archivedError,
    refresh,
    refreshArchived,
    createGoal: add,
    updateProgress: progress,
    completeGoal: complete,
    updateGoal: edit,
    archiveGoal: archive,
    restoreGoal: restore,
  };
}
