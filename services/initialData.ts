import { Workflow, Task, EnhancedLease, MaintenanceRequest } from '../types';

// Sample workflows
export const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    title: 'Q1 Budget Review',
    description: 'Review and approve Q1 2024 budget allocations across all departments',
    status: 'active',
    assignee: 'Sarah Chen',
    dueDate: '2024-12-31',
    priority: 'high',
    propertyId: 'prop-001',
    tags: ['finance', 'quarterly', '2024'],
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z',
    createdBy: 'admin',
    version: 1
  },
  {
    id: 'wf-2',
    title: 'Terminal Building Renovation',
    description: 'Coordinate renovation of Terminal Building common areas and facade',
    status: 'draft',
    assignee: 'Mike Johnson',
    dueDate: '2025-02-15',
    priority: 'medium',
    propertyId: 'prop-002',
    tags: ['renovation', 'capital-project'],
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
    createdBy: 'admin',
    version: 1
  },
  {
    id: 'wf-3',
    title: 'HVAC System Upgrade',
    description: 'Upgrade HVAC systems across all properties to improve energy efficiency',
    status: 'completed',
    assignee: 'Lisa Wang',
    dueDate: '2024-10-30',
    priority: 'medium',
    tags: ['maintenance', 'energy', 'sustainability'],
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-10-29T16:45:00Z',
    createdBy: 'admin',
    version: 3
  }
];

// Sample tasks
export const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review Q3 Financial Reports',
    description: 'Analyze Q3 financial performance and prepare summary for board meeting',
    status: 'in_progress',
    assignee: 'Sarah Chen',
    dueDate: '2024-11-25',
    priority: 'high',
    parentWorkflowId: 'wf-1',
    estimatedHours: 8,
    actualHours: 5,
    dependencies: [],
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-20T11:30:00Z',
    createdBy: 'admin',
    version: 2
  },
  {
    id: 'task-2',
    title: 'Contact Vendors for Renovation Bids',
    description: 'Reach out to at least 3 vendors for Terminal Building renovation project',
    status: 'todo',
    assignee: 'Mike Johnson',
    dueDate: '2024-11-22',
    priority: 'medium',
    parentWorkflowId: 'wf-2',
    estimatedHours: 6,
    dependencies: [],
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
    createdBy: 'admin',
    version: 1
  },
  {
    id: 'task-3',
    title: 'Schedule HVAC Inspection',
    description: 'Schedule pre-upgrade inspection of current HVAC systems',
    status: 'completed',
    assignee: 'Tom Davis',
    dueDate: '2024-09-15',
    priority: 'low',
    parentWorkflowId: 'wf-3',
    estimatedHours: 4,
    actualHours: 3,
    dependencies: [],
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-14T15:20:00Z',
    createdBy: 'admin',
    version: 2
  },
  {
    id: 'task-4',
    title: 'Prepare Budget Presentation',
    description: 'Create PowerPoint presentation for Q1 budget review meeting',
    status: 'blocked',
    assignee: 'Sarah Chen',
    dueDate: '2024-11-28',
    priority: 'high',
    parentWorkflowId: 'wf-1',
    blockerReason: 'Waiting for final expense reports from accounting',
    estimatedHours: 3,
    dependencies: ['task-1'],
    createdAt: '2024-11-05T14:00:00Z',
    updatedAt: '2024-11-18T10:15:00Z',
    createdBy: 'admin',
    version: 3
  }
];

// Sample leases
export const SAMPLE_LEASES: EnhancedLease[] = [
  {
    id: 'lease-1',
    propertyId: 'prop-001',
    propertyName: 'Airport Plaza - Floor 12',
    tenantId: 'tenant-001',
    tenant: 'Global Services Inc.',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    rent: 15000,
    status: 'active',
    renewalStatus: 'None',
    securityDeposit: 45000,
    createdAt: '2022-12-01T10:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'admin',
    version: 1
  },
  {
    id: 'lease-2',
    propertyId: 'prop-002',
    propertyName: 'Harbor Plaza - Suite 300',
    tenantId: 'tenant-002',
    tenant: 'TechCorp Solutions',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    rent: 8500,
    status: 'expiring',
    renewalStatus: 'Draft',
    securityDeposit: 25500,
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-11-01T08:00:00Z',
    createdBy: 'admin',
    version: 2
  },
  {
    id: 'lease-3',
    propertyId: 'prop-003',
    propertyName: 'Suvarnabhumi Res. - Unit 45B',
    tenantId: 'tenant-003',
    tenant: 'Asia Pacific Trading',
    startDate: '2022-06-01',
    endDate: '2024-11-30',
    rent: 12000,
    status: 'expired',
    renewalStatus: 'Negotiating',
    securityDeposit: 36000,
    workflowId: 'wf-renewal-1',
    createdAt: '2022-05-15T14:00:00Z',
    updatedAt: '2024-11-25T16:30:00Z',
    createdBy: 'admin',
    version: 4
  }
];

// Sample maintenance requests
export const SAMPLE_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    propertyId: 'prop-001',
    description: 'HVAC system not cooling properly in west wing',
    status: 'in_progress',
    priority: 'high',
    assignee: 'ABC HVAC Services',
    costEstimate: 3500,
    actualCost: 2800,
    scheduledDate: '2024-11-15',
    category: 'HVAC',
    vendor: 'ABC HVAC Services',
    notes: 'Compressor replacement completed, awaiting final inspection',
    createdAt: '2024-11-10T08:00:00Z',
    updatedAt: '2024-11-18T14:20:00Z',
    createdBy: 'admin',
    version: 2
  },
  {
    id: 'maint-2',
    propertyId: 'prop-002',
    description: 'Roof leak in main lobby area during heavy rain',
    status: 'submitted',
    priority: 'urgent',
    costEstimate: 5000,
    scheduledDate: '2024-11-20',
    category: 'Roofing',
    vendor: 'Quality Roofing Co.',
    createdAt: '2024-11-18T16:45:00Z',
    updatedAt: '2024-11-18T16:45:00Z',
    createdBy: 'tenant-002',
    version: 1
  },
  {
    id: 'maint-3',
    propertyId: 'prop-003',
    description: 'Elevator maintenance and annual inspection',
    status: 'completed',
    priority: 'medium',
    assignee: 'Elevator Tech Pro',
    costEstimate: 1200,
    actualCost: 1150,
    scheduledDate: '2024-11-01',
    completionDate: '2024-11-05T17:30:00Z',
    category: 'Elevator',
    vendor: 'Elevator Tech Pro',
    createdAt: '2024-10-15T09:00:00Z',
    updatedAt: '2024-11-05T17:30:00Z',
    createdBy: 'admin',
    version: 3
  }
];
