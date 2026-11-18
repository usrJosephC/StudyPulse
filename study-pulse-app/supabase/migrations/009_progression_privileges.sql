begin;

-- Supabase may give authenticated default table privileges. Server-owned
-- progression tables must only be changed by the existing SECURITY DEFINER RPCs.
revoke insert, update, delete, truncate, references, trigger
on public.points_reversals, public.streak_history, public.weekly_resets,
   public.badges, public.user_badges
from authenticated;
grant select on public.points_reversals, public.streak_history, public.weekly_resets,
   public.badges, public.user_badges
to authenticated;

commit;
