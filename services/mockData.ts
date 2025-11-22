import { Property, KPI, ChartData, Alert, Task, Lease, WorkOrder, Activity } from '../types';

export const KPIS: KPI[] = [
  { label: 'Total Portfolio Value', value: '$45.2M', trend: 5.2, trendLabel: '+5.2% from last month', isPositive: true },
  { label: 'Occupancy Rate', value: '94.5%', trend: 2.1, trendLabel: '+2.1% from last month', isPositive: true },
  { label: 'Monthly Revenue', value: '$385K', trend: 3.8, trendLabel: '+3.8% from last month', isPositive: true },
  { label: 'Active Maintenance', value: '12', trend: -15, trendLabel: '-15% from last month', isPositive: true },
];

export const REVENUE_DATA: ChartData[] = [
  { name: 'Jan', value: 320, value2: 280 },
  { name: 'Feb', value: 340, value2: 290 },
  { name: 'Mar', value: 360, value2: 310 },
  { name: 'Apr', value: 350, value2: 320 },
  { name: 'May', value: 370, value2: 330 },
  { name: 'Jun', value: 385, value2: 340 },
];

export const PROPERTY_TYPE_DISTRIBUTION: ChartData[] = [
  { name: 'Commercial', value: 12 },
  { name: 'Residential', value: 8 },
  { name: 'Industrial', value: 5 },
  { name: 'Office', value: 7 },
];

export const ALERTS: Alert[] = [
  { id: '1', title: 'Lease Expiring Soon', description: 'Tenant at Oak Street Plaza - 60 days remaining', severity: 'warning', date: '2024-01-15' },
  { id: '2', title: 'Maintenance Required', description: 'HVAC system needs inspection at Riverside Complex', severity: 'critical', date: '2024-01-14' },
  { id: '3', title: 'Payment Overdue', description: 'Tenant payment 15 days overdue at Maple Tower', severity: 'warning', date: '2024-01-13' },
];

export const TASKS: Task[] = [
  { id: '1', title: 'Review Q1 Financial Reports', completed: false, priority: 'High' },
  { id: '2', title: 'Schedule property inspection', completed: true, priority: 'Medium' },
  { id: '3', title: 'Update tenant contracts', completed: false, priority: 'High' },
  { id: '4', title: 'Process maintenance requests', completed: false, priority: 'Low' },
];

export const PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Riverside Complex',
    address: '123 River St',
    city: 'Portland',
    type: 'Commercial',
    status: 'Active',
    value: 8500000,
    occupancyRate: 95,
    monthlyRent: 45000,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    tenantCount: 12,
    lastRenovated: '2022-03-15'
  },
  {
    id: '2',
    name: 'Oak Street Plaza',
    address: '456 Oak Ave',
    city: 'Seattle',
    type: 'Residential',
    status: 'Active',
    value: 6200000,
    occupancyRate: 92,
    monthlyRent: 32000,
    image: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
    tenantCount: 24,
    lastRenovated: '2021-08-20'
  },
];

export const LEASES: Lease[] = [
  {
    id: '1',
    propertyId: '1',
    propertyName: 'Riverside Complex',
    tenant: 'Tech Solutions Inc.',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    rent: 12000,
    status: 'Active'
  },
  {
    id: '2',
    propertyId: '2',
    propertyName: 'Oak Street Plaza',
    tenant: 'Urban Coffee Co.',
    startDate: '2023-06-01',
    endDate: '2024-03-15',
    rent: 3500,
    status: 'Expiring',
    renewalStatus: 'Negotiating'
  },
];

export const WORK_ORDERS: WorkOrder[] = [
  {
    id: '1',
    title: 'HVAC Maintenance',
    property: 'Riverside Complex',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'John Smith',
    category: 'HVAC'
  },
  {
    id: '2',
    title: 'Plumbing Repair',
    property: 'Oak Street Plaza',
    priority: 'Medium',
    status: 'Submitted',
    category: 'Plumbing'
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'lease',
    description: 'New lease signed at Riverside Complex',
    time: '2 hours ago'
  },
  {
    id: '2',
    type: 'maintenance',
    description: 'Work order completed at Oak Street Plaza',
    time: '4 hours ago'
  },
  {
    id: '3',
    type: 'financial',
    description: 'Rent payment received from Tech Solutions Inc.',
    time: '6 hours ago'
  },
];
