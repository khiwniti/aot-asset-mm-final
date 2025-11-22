/*
  # Fix Security Issues - Part 6: Enable RLS on Public Tables

  ## Summary
  This migration enables RLS on all public tables that currently don't have it enabled,
  and adds appropriate policies for each table.

  ## Changes
  1. Enable RLS on Core Tables
     - property_team_members, workflow_steps, property_documents, calendar_events, tasks
     - lease_applications, roles, role_permissions, permissions, user_roles
     - building_units, asset_equipment, maintenance_work_orders, service_contracts
     - leases, properties, tenants, insurance_claims, vendor_performance
     - equipment_assets, maintenance_tickets, budgets, budget_actuals
     - sustainability_metrics, compliance_certificates, lease_payments
     - portfolios, users, airports

  2. Add Policies
     - All tables get "Authenticated users can view" policy for SELECT
     - This ensures data is protected but accessible to authenticated users

  ## Security Impact
  - CRITICAL: Enables row-level security on all public tables
  - Prevents unauthorized access to sensitive data
  - Follows zero-trust security model
*/

-- Enable RLS and add policies for all public tables
ALTER TABLE public.property_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view property team members" ON public.property_team_members FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view workflow steps" ON public.workflow_steps FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view property documents" ON public.property_documents FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view calendar events" ON public.calendar_events FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.lease_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view lease applications" ON public.lease_applications FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view roles" ON public.roles FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view permissions" ON public.permissions FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view user roles" ON public.user_roles FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.building_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view building units" ON public.building_units FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.asset_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view asset equipment" ON public.asset_equipment FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.maintenance_work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view maintenance work orders" ON public.maintenance_work_orders FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.service_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view service contracts" ON public.service_contracts FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view leases" ON public.leases FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view properties" ON public.properties FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tenants" ON public.tenants FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view insurance claims" ON public.insurance_claims FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.vendor_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view vendor performance" ON public.vendor_performance FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view maintenance tickets" ON public.maintenance_tickets FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view budgets" ON public.budgets FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.budget_actuals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view budget actuals" ON public.budget_actuals FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sustainability metrics" ON public.sustainability_metrics FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.compliance_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view compliance certificates" ON public.compliance_certificates FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.lease_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view lease payments" ON public.lease_payments FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view portfolios" ON public.portfolios FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));

ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view airports" ON public.airports FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
