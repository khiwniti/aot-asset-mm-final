/*
  # Fix Security Issues - Part 5B: Add RLS Policies (Second Set)

  ## Summary
  This migration continues adding RLS policies to tables with RLS enabled but no policies.

  ## Changes
  1. Add Policies for Additional Tables
     - dashboards: Users can view their own dashboards and public ones
     - document_access_log: Users can view their own access logs
     - document_chunks: Authenticated users can view all chunks
     - documents: Authenticated users can view all documents
     - feedback: Authenticated users can view all feedback
     - invoices: Authenticated users can view all invoices
     - maintenance_schedules: Authenticated users can view all schedules
     - message_context: Users can view context for their messages
     - metrics_cache: Authenticated users can view cached metrics

  ## Security Impact
  - Enables data access through secure RLS policies
  - Restricts access based on user authentication and ownership
  - Follows principle of least privilege
*/

-- dashboards: Users can view their own dashboards and public ones
CREATE POLICY "Users can view their dashboards"
  ON public.dashboards
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR is_public = true);

-- document_access_log: Users can view their own access logs
CREATE POLICY "Users can view their document access logs"
  ON public.document_access_log
  FOR SELECT
  TO authenticated
  USING (accessed_by = (SELECT auth.uid()));

-- document_chunks: Authenticated users can view all chunks
CREATE POLICY "Authenticated users can view document chunks"
  ON public.document_chunks
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- documents: Authenticated users can view all documents
CREATE POLICY "Authenticated users can view documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- feedback: Authenticated users can view all feedback
CREATE POLICY "Authenticated users can view feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- invoices: Authenticated users can view all invoices
CREATE POLICY "Authenticated users can view invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- maintenance_schedules: Authenticated users can view all schedules
CREATE POLICY "Authenticated users can view maintenance schedules"
  ON public.maintenance_schedules
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- message_context: Users can view context for their messages
CREATE POLICY "Users can view their message context"
  ON public.message_context
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages
      JOIN public.conversations ON chat_messages.conversation_id = conversations.id
      WHERE chat_messages.id = message_context.message_id
      AND conversations.user_id = (SELECT auth.uid())
    )
  );

-- metrics_cache: Authenticated users can view cached metrics
CREATE POLICY "Authenticated users can view metrics cache"
  ON public.metrics_cache
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);
