/*
  # Fix Security Issues - Part 1: Foreign Key Indexes

  ## Summary
  This migration adds missing indexes for foreign key columns to improve query performance
  and prevent suboptimal join operations.

  ## Changes
  1. Foreign Key Indexes
     - Add indexes for all unindexed foreign keys across multiple tables
     - Includes documents, invoices, maintenance_schedules, notifications, payment_transactions
     - Includes properties, property_documents, roles, service_contracts, workflow tables

  ## Performance Impact
  - Significantly improves JOIN query performance
  - Reduces table scan operations
  - Optimizes foreign key constraint checks

  ## Security Impact
  - No direct security impact, but improves overall system performance
  - Prevents performance degradation that could lead to DoS conditions
*/

-- Documents table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent_document_id ON public.documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_verified_by ON public.documents(verified_by);

-- Invoices table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);

-- Maintenance schedules foreign key indexes (note: column is 'assigned_vendor' not 'assigned_vendor_id')
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_assigned_vendor ON public.maintenance_schedules(assigned_vendor);

-- Maintenance work orders foreign key indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_equipment_id ON public.maintenance_work_orders(equipment_id);

-- Notifications foreign key indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON public.notifications(created_by);

-- Payment transactions foreign key indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reconciled_by ON public.payment_transactions(reconciled_by);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_recorded_by ON public.payment_transactions(recorded_by);

-- Properties foreign key indexes
CREATE INDEX IF NOT EXISTS idx_properties_airport_id ON public.properties(airport_id);

-- Property documents foreign key indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_version_of ON public.property_documents(version_of);

-- Roles foreign key indexes
CREATE INDEX IF NOT EXISTS idx_roles_parent_role_id ON public.roles(parent_role_id);

-- Service contracts foreign key indexes
CREATE INDEX IF NOT EXISTS idx_service_contracts_equipment_id ON public.service_contracts(equipment_id);

-- Workflow approvals foreign key indexes
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_delegate_from ON public.workflow_approvals(delegate_from);

-- Workflow definitions foreign key indexes
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_created_by ON public.workflow_definitions(created_by);
