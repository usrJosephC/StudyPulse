import type { Json } from './database';

export type Profile = { id: string; name: string; badge: string | null; created_at: string };
export type SignUpMetadata = { birthDate?: string; gender?: string };
export type Task = { id: number; user_id: string; title: string; category: string; task_date: string; done: boolean; done_at: string | null; created_at?: string };
export type Goal = { id: number; user_id: string; category: string; title: string; due_date: string | null; progress: number; icon: string | null; completed_at: string | null; created_at: string };
export type CheckIn = { id: number; user_id: string; check_date: string; minutes: number; created_at: string };
export type CheckInResult = { checkIn: CheckIn; pointsAwarded: number; streak: number };
export type Points = { total: number; weekly: number };
export type RankingEntry = { user_id: string; name: string; weekly_points: number; streak: number; rank: number };
export type Squad = { id: number; name: string; subtitle: string; invite_code: string; season_ends_at: string | null; created_by: string; created_at: string };
export type SquadActivity = { id: number; squad_id: number; user_id: string; user_name: string; action: string; payload: Json; created_at: string };
export type TaskInput = { title: string; category?: string; task_date?: string };
export type GoalInput = { title: string; category?: string; due_date?: string | null; progress?: number; icon?: string | null };
