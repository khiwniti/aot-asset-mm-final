
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

export type UIComponentType = 'chart' | 'approval' | 'alert_list' | 'property_card' | 'map' | 'kanban' | 'navigate' | 'report';

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

// Web Speech API Types
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}