import { useCallback, useEffect, useState } from 'react';
import type { AppError } from '../lib/result';
import { createTask, listToday, toggleTask } from '../services/tasks.service';
import type { Task, TaskInput } from '../types/domain';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listToday();
    if (result.ok) setTasks(result.data);
    else setError(result.error);
    setLoading(false);
    return result;
  }, []);

  const add = useCallback(async (input: TaskInput) => {
    setError(null);
    const result = await createTask(input);
    if (result.ok) setTasks((current) => [...current, result.data]);
    else setError(result.error);
    return result;
  }, []);

  const toggle = useCallback(async (id: number) => {
    setError(null);
    const result = await toggleTask(id);
    if (result.ok) setTasks((current) => current.map((task) => task.id === id ? result.data : task));
    else setError(result.error);
    return result;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { tasks, loading, error, refresh, createTask: add, toggleTask: toggle };
}
