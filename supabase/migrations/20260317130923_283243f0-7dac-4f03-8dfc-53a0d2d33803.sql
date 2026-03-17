-- Case routing log table
CREATE TABLE public.case_routing_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(case_id) ON DELETE CASCADE,
  action text NOT NULL, -- 'auto_assigned', 'declined', 'admin_assigned', 'admin_reassigned', 'escalated', 'no_match'
  lawyer_id uuid REFERENCES public.lawyer_profiles(lawyer_id),
  admin_id uuid REFERENCES public.users(user_id),
  reason text,
  score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_routing_log_case ON public.case_routing_log(case_id);
CREATE INDEX idx_routing_log_action ON public.case_routing_log(action);

ALTER TABLE public.case_routing_log ENABLE ROW LEVEL SECURITY;

-- Admins can see all routing logs
CREATE POLICY "Admins can view routing logs"
ON public.case_routing_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Case owners can see their case routing
CREATE POLICY "Case owners can view routing logs"
ON public.case_routing_log FOR SELECT
TO authenticated
USING (case_id IN (
  SELECT c.case_id FROM public.cases c WHERE c.user_id::text = auth.uid()::text
));

-- Lawyers can see routing for their assigned cases
CREATE POLICY "Lawyers can view own case routing"
ON public.case_routing_log FOR SELECT
TO authenticated
USING (case_id IN (
  SELECT c.case_id FROM public.cases c
  WHERE c.assigned_lawyer_id IN (
    SELECT lp.lawyer_id FROM public.lawyer_profiles lp WHERE lp.user_id::text = auth.uid()::text
  )
));

-- Add declined_lawyer_ids to cases for tracking declines
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS declined_lawyer_ids uuid[] DEFAULT '{}';
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS decline_count integer DEFAULT 0;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS routing_attempts integer DEFAULT 0;

-- Enable pg_cron and pg_net for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;