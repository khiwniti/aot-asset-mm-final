/*
  # Fix Security Issues - Part 2: RLS Policy Optimization

  ## Summary
  This migration optimizes RLS policies that re-evaluate auth functions for each row
  by wrapping them in SELECT subqueries for better performance at scale.

  ## Changes
  1. RLS Policy Optimization
     - Update policies on insurance_providers, workflow_definitions, document_categories
     - Update policies on notification_templates, notifications, notification_preferences
     - Update policies on user_activity_summary
     - Replace auth.<function>() with (SELECT auth.<function>()) pattern

  ## Performance Impact
  - Significantly reduces CPU usage for large result sets
  - Prevents re-evaluation of auth functions for every row
  - Improves query performance at scale

  ## Security Impact
  - No change to security posture
  - Maintains same access control rules with better performance
*/

-- Insurance Providers: Optimize "Authenticated users can read" policy
DROP POLICY IF EXISTS "Authenticated users can read" ON public.insurance_providers;
CREATE POLICY "Authenticated users can read"
  ON public.insurance_providers
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Workflow Definitions: Optimize "Authenticated users can view workflow definitions" policy
DROP POLICY IF EXISTS "Authenticated users can view workflow definitions" ON public.workflow_definitions;
CREATE POLICY "Authenticated users can view workflow definitions"
  ON public.workflow_definitions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Document Categories: Optimize "Authenticated users can view document categories" policy
DROP POLICY IF EXISTS "Authenticated users can view document categories" ON public.document_categories;
CREATE POLICY "Authenticated users can view document categories"
  ON public.document_categories
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Notification Templates: Optimize "Authenticated users can view notification templates" policy
DROP POLICY IF EXISTS "Authenticated users can view notification templates" ON public.notification_templates;
CREATE POLICY "Authenticated users can view notification templates"
  ON public.notification_templates
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Notifications: Optimize "Users can view their own notifications" policy
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Notification Preferences: Optimize "Users can view their own notification preferences" policy
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- User Activity Summary: Optimize "Users can view their own activity summary" policy
DROP POLICY IF EXISTS "Users can view their own activity summary" ON public.user_activity_summary;
CREATE POLICY "Users can view their own activity summary"
  ON public.user_activity_summary
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
