/*
  # Fix Security Issues - Part 5A: Add RLS Policies (First Set)

  ## Summary
  This migration adds RLS policies to tables that have RLS enabled but no policies.
  Without policies, RLS-enabled tables are completely locked down.

  ## Changes
  1. Add Policies for Core Tables
     - ai_insights: Authenticated users can view all insights
     - asset_valuation_history: Authenticated users can view all valuations
     - audit_log: Users can view their own audit logs
     - automation_executions: Authenticated users can view all executions
     - automation_rules: Authenticated users can view all rules
     - chat_analytics: Users can view their own analytics
     - chat_messages: Users can view messages in their conversations
     - conversations: Users can view their own conversations
     - conversation_summaries: Users can view summaries of their conversations

  ## Security Impact
  - Enables data access through secure RLS policies
  - Restricts access based on user authentication and ownership
  - Follows principle of least privilege
*/

-- ai_insights: Authenticated users can view all insights
CREATE POLICY "Authenticated users can view ai insights"
  ON public.ai_insights
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- asset_valuation_history: Authenticated users can view all valuations
CREATE POLICY "Authenticated users can view valuations"
  ON public.asset_valuation_history
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- audit_log: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- automation_executions: Authenticated users can view all executions
CREATE POLICY "Authenticated users can view automation executions"
  ON public.automation_executions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- automation_rules: Authenticated users can view all rules
CREATE POLICY "Authenticated users can view automation rules"
  ON public.automation_rules
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- chat_analytics: Users can view their own analytics
CREATE POLICY "Users can view their own chat analytics"
  ON public.chat_analytics
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- chat_messages: Users can view messages in their conversations
CREATE POLICY "Users can view their conversation messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND conversations.user_id = (SELECT auth.uid())
    )
  );

-- conversations: Users can view their own conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- conversation_summaries: Users can view summaries of their conversations
CREATE POLICY "Users can view their conversation summaries"
  ON public.conversation_summaries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_summaries.conversation_id
      AND conversations.user_id = (SELECT auth.uid())
    )
  );
