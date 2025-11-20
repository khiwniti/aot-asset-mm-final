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
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parentWorkflowId?: string;
  blockerReason?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  dependencies?: string[]; // Array of task IDs
}

export type UIComponentType = 'chart' | 'approval' | 'alert_list' | 'property_card' | 'map' | 'kanban' | 'navigate' | 'report' | 'workflow_status_manager' | 'lease_manager' | 'task_board' | 'maintenance_tracker';

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
  type: 'default' | 'chart' | 'map' | 'kanban';
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
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: 'draft' | 'active' | 'expiring' | 'expired' | 'renewed';
  renewalStatus?: 'None' | 'Draft' | 'Sent' | 'Negotiating' | 'Signed';
  securityDeposit?: number;
  renewalTerms?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string; // vendor or staff member
  costEstimate?: number;
  actualCost?: number;
  scheduledDate?: string;
  completionDate?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Legacy WorkOrder interface for backward compatibility
export interface WorkOrder {
  id: string;
  title: string;
  property: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Submitted' | 'Approved' | 'In Progress' | 'Completed';
  assignedTo?: string;
  category: string;
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  taskIds?: string[]; // Array of task IDs
}

export interface Activity {
  id: string;
  type: 'lease' | 'maintenance' | 'financial' | 'system' | 'workflow' | 'task';
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

// Entity Management System Types
export interface EntityAuditTrail {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityId: string;
  timestamp: string;
  userId: string;
  operation: 'create' | 'update' | 'delete' | 'status_change';
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  details?: string;
}

export interface PendingOperation {
  id: string;
  entityType: 'workflow' | 'lease' | 'task' | 'maintenance_request';
  entityId?: string;
  operationType: 'create' | 'update' | 'delete' | 'status_change';
  operationData: any; // JSON data
  status: 'pending' | 'success' | 'failed';
  retryCount: number;
  createdTimestamp: string;
  lastRetryTimestamp?: string;
  errorMessage?: string;
}

// Entity Management UI Components
export type EntityUIComponentType = UIComponentType | 'workflow_status_manager' | 'lease_manager' | 'task_board' | 'maintenance_tracker';

export interface WorkflowStatusManagerData {
  workflows: Workflow[];
  availableStatuses: string[];
  dragAndDropEnabled: boolean;
}

export interface LeaseManagerData {
  leases: Lease[];
  expiringThreshold: number; // days
  showRenewalAlerts: boolean;
}

export interface TaskBoardData {
  tasks: Task[];
  columns: { id: string; title: string; taskIds: string[] }[];
  allowBulkOperations: boolean;
}

export interface MaintenanceTrackerData {
  requests: MaintenanceRequest[];
  sortBy: 'priority' | 'date' | 'status';
  showCostOverrunAlerts: boolean;
}
