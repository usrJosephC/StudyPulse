-- Profile deletion removes points_events and points_reversals together.
-- A RESTRICT reference could block the cascade for a reversed event.
alter table public.points_reversals
  drop constraint if exists points_reversals_original_event_id_fkey;

alter table public.points_reversals
  add constraint points_reversals_original_event_id_fkey
  foreign key (original_event_id)
  references public.points_events(id)
  on delete cascade;
