export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'Commercial' | 'Residential' | 'Industrial' | 'Office';
  status: 'Active' | 'Pending' | 'Maintenance';
  value: number;
  occupancyRate: number;
  monthlyRent: number;
  image: string;
  tenantCount: number;
  lastRenovated: string;
}

export interface KPI {
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
  isPositive: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  date: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export type UIComponentType = 'chart' | 'approval' | 'alert_list' | 'property_card' | 'map' | 'kanban' | 'navigate' | 'report' | 'entity_manager';

export interface ReportData {
  id: string;
  title: string;
  type: 'Financial' | 'Operational' | 'Market' | 'Compliance';
  period: string;
  summary: string;
  keyMetrics: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }[];
  generatedAt: string;
}

export interface UIPayload {
  type: UIComponentType;
  data: any; 
  status?: 'pending' | 'approved' | 'rejected'; 
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  uiPayload?: UIPayload;
}

export interface ActiveVisual {
  type: 'default' | 'chart' | 'map' | 'kanban' | 'entity_manager';
  title: string;
  data: any;
}

export interface VisualContext {
  type: 'chart' | 'map';
  title: string;
  data: any;
  chartType?: 'bar' | 'area' | 'pie';
}

export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  tenant: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: 'Active' | 'Expiring' | 'New';
  renewalStatus?: 'None' | 'Draft' | 'Sent' | 'Negotiating' | 'Signed';
}

export interface WorkOrder {
  id: string;
  title: string;
  property: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Submitted' | 'Approved' | 'In Progress' | 'Completed';
  assignedTo?: string;
  category: string;
}

export interface Activity {
  id: string;
  type: 'lease' | 'maintenance' | 'financial' | 'system';
  description: string;
  time: string;
}

export interface InsightData {
  title: string;
  explanation: string[];
  prediction: string;
  suggestions: string[];
}

export type VoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface MappingField {
  sourceField: string;
  targetField: string;
  confidence: number;
  sampleValue: string;
  issue?: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'uploading' | 'analyzing' | 'mapping' | 'ready' | 'completed' | 'error';
  mappings: MappingField[];
}

// --- Entity Management Types ---

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type LeaseStatus = 'draft' | 'active' | 'expiring' | 'expired' | 'renewed';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';
export type MaintenanceStatus = 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface Workflow extends BaseEntity {
  title: string;
  description: string;
  status: WorkflowStatus;
  assignee: string;
  dueDate?: string;
  priority: Priority;
  propertyId?: string;
  parentWorkflowId?: string;
  tags: string[];
}

export interface Task extends BaseEntity {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  dueDate?: string;
  priority: Priority;
  parentWorkflowId?: string;
  blockerReason?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[]; // Task IDs
  propertyId?: string;
}

export interface MaintenanceRequest extends BaseEntity {
  propertyId: string;
  description: string;
  status: MaintenanceStatus;
  priority: Priority;
  assignee?: string; // Vendor or staff member
  costEstimate?: number;
  actualCost?: number;
  scheduledDate?: string;
  completionDate?: string;
  category: string;
  vendor?: string;
  notes?: string;
}

export interface EnhancedLease extends BaseEntity {
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenant: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: LeaseStatus;
  renewalStatus?: 'None' | 'Draft' | 'Sent' | 'Negotiating' | 'Signed';
  renewalTerms?: string;
  securityDeposit: number;
  workflowId?: string; // Associated renewal workflow
}

export interface EntityAuditTrail {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance';
  entityId: string;
  timestamp: string;
  userId: string;
  operation: 'create' | 'update' | 'delete' | 'status_change';
  field?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

export interface PendingOperation {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance';
  entityId: string;
  operationType: 'create' | 'update' | 'delete' | 'status_change';
  operationData: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  retryCount: number;
  createdAt: string;
  lastRetryAt?: string;
  errorMessage?: string;
}

export interface ConflictResolution {
  entityType: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: string;
  resolution?: 'keep_local' | 'accept_remote' | 'manual_merge';
}

export interface EntityNotification {
  id: string;
  type: 'lease_expiring' | 'task_assigned' | 'maintenance_overrun' | 'sync_failed' | 'conflict_detected';
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  userId: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// --- MCP (Model Context Protocol) Types ---

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  capabilities: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}
