import { Property, KPI, ChartData, Alert, Lease, WorkOrder, Activity, Task } from '../types';

export const PROPERTIES: Property[] = [
  {
    id: 'P001',
    name: 'Suvarnabhumi Residence',
    address: '612/21 King Kaew Rd',
    city: 'Bangkok',
    type: 'Residential',
    status: 'Active',
    value: 15200000,
    occupancyRate: 92,
    monthlyRent: 12000,
    image: 'https://picsum.photos/400/300?random=1',
    tenantCount: 45,
    lastRenovated: '2022',
  },
  {
    id: 'P002',
    name: 'Airport Side Apartment',
    address: '613/21 Lat Krabang',
    city: 'Bangkok',
    type: 'Residential',
    status: 'Pending',
    value: 8400000,
    occupancyRate: 88,
    monthlyRent: 15000,
    image: 'https://picsum.photos/400/300?random=2',
    tenantCount: 22,
    lastRenovated: '2020',
  },
  {
    id: 'P003',
    name: 'Park Villa',
    address: '614/21 Phuket Town',
    city: 'Phuket',
    type: 'Commercial',
    status: 'Active',
    value: 22100000,
    occupancyRate: 95,
    monthlyRent: 18500,
    image: 'https://picsum.photos/400/300?random=3',
    tenantCount: 12,
    lastRenovated: '2023',
  },
  {
    id: 'P004',
    name: 'Sriracha View',
    address: '615/21 Sriracha',
    city: 'Chonburi',
    type: 'Office',
    status: 'Maintenance',
    value: 35000000,
    occupancyRate: 72,
    monthlyRent: 20000,
    image: 'https://picsum.photos/400/300?random=4',
    tenantCount: 8,
    lastRenovated: '2019',
  },
  {
    id: 'P005',
    name: 'Urban Chiang Mai',
    address: '621/21 Nimman',
    city: 'Chiang Mai',
    type: 'Commercial',
    status: 'Active',
    value: 18500000,
    occupancyRate: 98,
    monthlyRent: 22500,
    image: 'https://picsum.photos/400/300?random=5',
    tenantCount: 15,
    lastRenovated: '2024',
  },
  {
    id: 'P006',
    name: 'Urban Bang Phli',
    address: '623/21 Bang Phli',
    city: 'Samut Prakan',
    type: 'Residential',
    status: 'Active',
    value: 12000000,
    occupancyRate: 85,
    monthlyRent: 8500,
    image: 'https://picsum.photos/400/300?random=6',
    tenantCount: 30,
    lastRenovated: '2021',
  },
];

export const KPIS: KPI[] = [
  {
    label: 'Total Asset Portfolio',
    value: '102,000,000',
    trend: 6,
    trendLabel: 'since last month',
    isPositive: true,
  },
  {
    label: 'Total Occupancy Rate',
    value: '76%',
    trend: 2,
    trendLabel: 'last month',
    isPositive: true,
  },
  {
    label: 'Average Rent Yield',
    value: '5.2%',
    trend: 0.1,
    trendLabel: 'last month',
    isPositive: true,
  },
  {
    label: 'Vacant Properties',
    value: '12',
    trend: -2,
    trendLabel: 'rented out last month',
    isPositive: true, // In this context, decrease in vacancy is good
  },
];

export const REVENUE_DATA: ChartData[] = [
  { name: 'Jan', value: 1.2, value2: 1.0 },
  { name: 'Feb', value: 1.3, value2: 1.1 },
  { name: 'Mar', value: 1.4, value2: 1.2 },
  { name: 'Apr', value: 1.8, value2: 1.4 },
  { name: 'May', value: 2.0, value2: 1.5 },
  { name: 'Jun', value: 2.4, value2: 1.8 },
  { name: 'Jul', value: 2.2, value2: 1.9 },
  { name: 'Aug', value: 2.6, value2: 2.0 },
  { name: 'Sep', value: 2.8, value2: 2.1 },
  { name: 'Oct', value: 3.0, value2: 2.2 },
  { name: 'Nov', value: 3.2, value2: 2.3 },
  { name: 'Dec', value: 3.5, value2: 2.4 },
];

export const PROPERTY_TYPE_DISTRIBUTION: ChartData[] = [
  { name: 'Commercial', value: 35 },
  { name: 'Residential', value: 45 },
  { name: 'Office', value: 15 },
  { name: 'Industrial', value: 5 },
];

export const ALERTS: Alert[] = [
  {
    id: 'A1',
    title: 'Lease Renewal Required',
    description: '12 leases up for renewal in the next month at Suvarnabhumi Residence.',
    severity: 'warning',
    date: '2 hrs ago',
  },
  {
    id: 'A2',
    title: 'Tenant Dispute',
    description: 'Property 612 DMK: Tenant refuse to leave after contract termination.',
    severity: 'critical',
    date: '5 hrs ago',
  },
  {
    id: 'A3',
    title: 'Fire Safety Compliance',
    description: '3 properties are non-compliant with new fire safety regulations.',
    severity: 'critical',
    date: '1 day ago',
  },
  {
    id: 'A4',
    title: 'Maintenance Scheduled',
    description: 'HVAC maintenance for Park Villa scheduled for next Tuesday.',
    severity: 'info',
    date: '2 days ago',
  },
];

export const LEASES: Lease[] = [
  { id: 'L001', propertyId: 'P001', propertyName: 'Suvarnabhumi - Unit 5F', tenant: 'TechCorp Inc.', startDate: '2023-01-15', endDate: '2025-12-15', rent: 8500, status: 'Expiring', renewalStatus: 'None' },
  { id: 'L002', propertyId: 'P003', propertyName: 'Park Villa - 204', tenant: 'Design Studio LLC', startDate: '2022-06-01', endDate: '2026-05-31', rent: 6200, status: 'Active', renewalStatus: 'None' },
  { id: 'L003', propertyId: 'P004', propertyName: 'Sriracha View - 8A', tenant: 'Medical Group', startDate: '2024-03-01', endDate: '2027-02-28', rent: 4800, status: 'Active', renewalStatus: 'None' },
  { id: 'L004', propertyId: 'P001', propertyName: 'Suvarnabhumi - Unit 3B', tenant: 'Global Logistics', startDate: '2023-11-01', endDate: '2024-11-01', rent: 7200, status: 'Expiring', renewalStatus: 'Draft' },
  { id: 'L005', propertyId: 'P005', propertyName: 'Urban Chiang Mai - 101', tenant: 'Coffee Co.', startDate: '2024-01-01', endDate: '2028-12-31', rent: 12000, status: 'New', renewalStatus: 'Signed' },
];

export const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-123', title: 'HVAC Repair', property: 'Harbor Plaza', priority: 'High', status: 'Submitted', category: 'HVAC' },
  { id: 'WO-124', title: 'Roof Leak', property: 'Oak Street', priority: 'Medium', status: 'Approved', category: 'Structural' },
  { id: 'WO-125', title: 'Paint Job', property: 'Riverside', priority: 'Low', status: 'In Progress', category: 'Cosmetic' },
  { id: 'WO-126', title: 'Electrical Fix', property: 'Harbor Plaza', priority: 'High', status: 'Completed', category: 'Electrical' },
  { id: 'WO-127', title: 'Cleaning', property: 'Oak Street', priority: 'Low', status: 'Completed', category: 'Janitorial' },
];

export const ACTIVITIES: Activity[] = [
  { id: 'act1', type: 'lease', description: 'New lease signed for Urban Chiang Mai', time: '2 hours ago' },
  { id: 'act2', type: 'maintenance', description: 'HVAC repair completed at Park Villa', time: '4 hours ago' },
  { id: 'act3', type: 'financial', description: 'Monthly rent roll generated', time: '5 hours ago' },
  { id: 'act4', type: 'system', description: 'System backup completed successfully', time: '1 day ago' },
  { id: 'act5', type: 'lease', description: 'Lease renewal notice sent to TechCorp', time: '1 day ago' },
];

export const TASKS: Task[] = [
  { id: 't1', title: 'Review Q3 Financial Report', completed: false, priority: 'High' },
  { id: 't2', title: 'Call TechCorp regarding renewal', completed: false, priority: 'Medium' },
  { id: 't3', title: 'Approve Invoice #8492', completed: true, priority: 'Low' },
];