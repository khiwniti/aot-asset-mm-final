/*
  # Fix Security Issues - Part 3: Remove Duplicate Permissive Policies

  ## Summary
  This migration removes duplicate permissive policies on workflow_definitions table
  that were causing conflicts for multiple roles.

  ## Changes
  1. Duplicate Policy Removal
     - Remove the overly broad "Admins can manage all operational tables" SELECT policy
     - Keep the more specific "Authenticated users can view workflow definitions" policy
     - This eliminates multiple permissive policies for the same action

  ## Security Impact
  - Maintains existing access control
  - Reduces policy evaluation overhead
  - Simplifies policy management
  - Follows principle of single responsibility per policy
*/

-- Remove the duplicate "Admins can manage all operational tables" SELECT policy
-- Keep only the more specific policy for viewing workflow definitions
DROP POLICY IF EXISTS "Admins can manage all operational tables" ON public.workflow_definitions;

-- Note: The "Authenticated users can view workflow definitions" policy remains active
-- and provides the necessary SELECT access
