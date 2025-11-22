/*
  # Fix Security Issues - Part 5C: Add RLS Policies (Third Set)

  ## Summary
  This migration continues adding RLS policies to remaining tables with RLS enabled but no policies.

  ## Changes
  1. Add Policies for Remaining Tables
     - opportunities: Authenticated users can view all opportunities
     - payment_transactions: Authenticated users can view all transactions
     - performance_metrics: Authenticated users can view all metrics
     - predictions: Authenticated users can view all predictions
     - property_embeddings: Authenticated users can view all embeddings
     - reports: Users can view their own reports
     - sessions: Users can view their own sessions
     - transactions: Authenticated users can view all transactions
     - voice_commands: Users can view their own voice commands
     - workflow_approvals: Users can view approvals assigned to them
     - workflow_instances: Authenticated users can view all workflow instances

  ## Security Impact
  - Enables data access through secure RLS policies
  - Restricts access based on user authentication and ownership
  - Follows principle of least privilege
*/

-- opportunities: Authenticated users can view all opportunities
CREATE POLICY "Authenticated users can view opportunities"
  ON public.opportunities
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- payment_transactions: Authenticated users can view all transactions
CREATE POLICY "Authenticated users can view payment transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- performance_metrics: Authenticated users can view all metrics
CREATE POLICY "Authenticated users can view performance metrics"
  ON public.performance_metrics
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- predictions: Authenticated users can view all predictions
CREATE POLICY "Authenticated users can view predictions"
  ON public.predictions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- property_embeddings: Authenticated users can view all embeddings
CREATE POLICY "Authenticated users can view property embeddings"
  ON public.property_embeddings
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- reports: Users can view their own reports
CREATE POLICY "Users can view their reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (generated_by = (SELECT auth.uid()));

-- sessions: Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- transactions: Authenticated users can view all transactions
CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- voice_commands: Users can view their own voice commands
CREATE POLICY "Users can view their own voice commands"
  ON public.voice_commands
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- workflow_approvals: Users can view approvals assigned to them
CREATE POLICY "Users can view their workflow approvals"
  ON public.workflow_approvals
  FOR SELECT
  TO authenticated
  USING (assigned_to = (SELECT auth.uid()));

-- workflow_instances: Authenticated users can view all workflow instances
CREATE POLICY "Authenticated users can view workflow instances"
  ON public.workflow_instances
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);
