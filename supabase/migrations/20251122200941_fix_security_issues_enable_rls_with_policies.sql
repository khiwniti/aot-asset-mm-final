/*
  # Fix Security Issues - Part 4: Enable RLS on Tables with Policies

  ## Summary
  This migration enables RLS on tables that have policies defined but RLS is not enabled.
  This is a critical security fix.

  ## Changes
  1. Enable RLS
     - Enable RLS on equipment_assets table
     - Enable RLS on insurance_policies table
     - Enable RLS on vendors table

  ## Security Impact
  - CRITICAL: Enables row-level security enforcement
  - Activates existing policies to restrict data access
  - Prevents unauthorized data access
*/

-- Enable RLS on equipment_assets (has "Authenticated users can read" policy)
ALTER TABLE public.equipment_assets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on insurance_policies (has "Authenticated users can read" policy)
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on vendors (has "Authenticated users can read" policy)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
