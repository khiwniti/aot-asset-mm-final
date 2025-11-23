import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
  Link2, RefreshCw, Users, Wrench, FileText, CreditCard, ShieldCheck, 
  CircleAlert, Calendar, Activity, CircleCheckBig, Info, DollarSign, 
  TrendingUp, TrendingDown, Zap, Leaf, Download, Maximize2
} from 'lucide-react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { PROPERTIES, REVENUE_DATA, ALERTS, WORK_ORDERS, LEASES, ACTIVITIES, PROPERTY_TYPE_DISTRIBUTION } from '../services/mockData';

const Card = ({ children, className = '' }: { children?: any; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const OperationsAnalytics = () => {
  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const avgOccupancy = PROPERTIES.reduce((acc, p) => acc + p.occupancyRate, 0) / PROPERTIES.length;
    const openMaintenance = WORK_ORDERS.filter(w => w.status !== 'Completed').length;
    const expiringLeases = LEASES.filter(l => l.status === 'Expiring').length;
    const criticalAlerts = ALERTS.filter(a => a.severity === 'critical').length;
    const complianceIssues = ALERTS.filter(a => a.title.toLowerCase().includes('compliance') || a.title.toLowerCase().includes('safety')).length;
    
    return {
      occupancy: avgOccupancy.toFixed(1),
      maintenance: openMaintenance,
      expiring: expiringLeases,
      compliance: complianceIssues,
      critical: criticalAlerts
    };
  }, []);

  // --- Chart Options ---

  const commonChartOptions = {
    textStyle: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    grid: { top: 40, right: 20, bottom: 20, left: 20, containLabel: true },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderColor: '#e2e8f0', textStyle: { color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif" } }
  };

  // 1. Energy Usage (Small Area Chart)
  const energyOption = {
    ...commonChartOptions,
    grid: { top: 10, right: 10, bottom: 0, left: 0, containLabel: false },
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    tooltip: { trigger: 'axis' },
    series: [{
      data: [120, 132, 101, 134, 90, 230, 210],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: '#10b981' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.01)' }
        ])
      }
    }]
  };

  // 2. Occupancy Trends by Type (Line Chart)
  const occupancyTrendOption = {
    ...commonChartOptions,
    legend: { bottom: 0 },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', min: 70, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: 'Residential', type: 'line', smooth: true, data: [88, 89, 90, 92, 91, 93], itemStyle: { color: '#3b82f6' } },
      { name: 'Commercial', type: 'line', smooth: true, data: [82, 83, 85, 84, 86, 88], itemStyle: { color: '#8b5cf6' } },
      { name: 'Office', type: 'line', smooth: true, data: [75, 76, 75, 78, 79, 80], itemStyle: { color: '#f59e0b' } }
    ]
  };

  // 3. Maintenance Operations (Bar Chart)
  const maintenanceOpsOption = {
    ...commonChartOptions,
    xAxis: { type: 'category', data: ['HVAC', 'Plumbing', 'Electrical', 'Structural', 'Cosmetic'], axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: 'Open', type: 'bar', stack: 'total', data: [4, 2, 3, 1, 2], itemStyle: { color: '#f59e0b' } },
      { name: 'Completed', type: 'bar', stack: 'total', data: [12, 8, 15, 5, 10], itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] } }
    ]
  };

  // 4. Vendor Performance (Radar)
  const vendorRadarOption = {
    ...commonChartOptions,
    radar: {
      indicator: [
        { name: 'Quality', max: 100 },
        { name: 'Speed', max: 100 },
        { name: 'Cost', max: 100 },
        { name: 'Communication', max: 100 },
        { name: 'Safety', max: 100 }
      ],
      radius: '65%'
    },
    series: [{
      type: 'radar',
      data: [
        { value: [90, 85, 70, 95, 90], name: 'ABC HVAC', itemStyle: { color: '#3b82f6' } },
        { value: [75, 90, 95, 80, 85], name: 'City Cleaners', itemStyle: { color: '#10b981' } }
      ]
    }]
  };

  // 5. Revenue Trend (Area) - Using existing data
  const revenueOption = {
    ...commonChartOptions,
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (!Array.isArray(params) || !params[0]) return '';
        const p = params[0];
        return `<div class="font-bold text-slate-700">${p.name}</div>
                <div class="text-blue-600">$${(p.value * 1000000).toLocaleString()}</div>`;
      }
    },
    xAxis: { type: 'category', boundaryGap: false, data: REVENUE_DATA.map(d => d.name), axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } }, axisLabel: { formatter: (v:number) => `${v}M` } },
    series: [{
      name: 'Revenue', type: 'line', smooth: true, symbol: 'none',
      lineStyle: { width: 3, color: '#3b82f6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
        ])
      },
      data: REVENUE_DATA.map(d => d.value)
    }]
  };

  // 6. Portfolio Distribution (Pie) - Using existing data
  const portfolioOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      name: 'Properties', type: 'pie', radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
      data: PROPERTY_TYPE_DISTRIBUTION
    }]
  };

  // 7. Tenant Analysis by Type (Bar) - Derived
  const tenantAnalysisOption = {
    ...commonChartOptions,
    xAxis: { type: 'category', data: ['Commercial', 'Residential', 'Office', 'Industrial'], axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{
      name: 'Tenants', type: 'bar',
      data: [45, 120, 85, 15],
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6366f1' },
          { offset: 1, color: '#4338ca' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      barMaxWidth: 50
    }]
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header 
        title="Operations & Analytics" 
        subtitle="Real-time operational insights and portfolio performance metrics." 
      />

      <main className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Actions */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
            <Link2 size={18} /> Filters Linked
          </button>
          <button className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Daily Occupancy</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{metrics.occupancy}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users size={24} /></div>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Open Maintenance</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{metrics.maintenance}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Wrench size={24} /></div>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Leases Expiring</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{metrics.expiring}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><FileText size={24} /></div>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Rent Collection</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">98.5%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600"><CreditCard size={24} /></div>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Compliance Issues</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{metrics.compliance}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600"><ShieldCheck size={24} /></div>
            </div>
          </Card>
        </div>

        {/* Operational Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Maintenance Queue */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CircleAlert className="text-orange-500" size={20} />
                  <h3 className="font-bold text-slate-800">Maintenance Queue</h3>
                  <AIAssistButton prompt="Prioritize the current maintenance queue." />
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-600"><strong>{metrics.maintenance}</strong> open</span>
                  <span className="text-red-600"><strong>{metrics.critical}</strong> critical</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Property</th>
                      <th className="px-4 py-3">Issue</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-lg">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {WORK_ORDERS.slice(0, 4).map(wo => (
                      <tr key={wo.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{wo.property}</td>
                        <td className="px-4 py-3 text-slate-600">{wo.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold 
                            ${wo.priority === 'High' ? 'bg-red-100 text-red-700' : 
                              wo.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {wo.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{wo.status}</td>
                        <td className="px-4 py-3 text-slate-600 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                          John Doe
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {WORK_ORDERS.length === 0 && <div className="text-center py-8 text-slate-500">No active maintenance requests</div>}
              </div>
            </Card>
          </div>

          {/* Lease Renewal Timeline & Activity */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-purple-600" size={20} />
                  <h3 className="font-bold text-slate-800">Renewals</h3>
                </div>
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{metrics.expiring} expiring</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Renewal Rate</span>
                    <span className="font-bold text-slate-900">92% / 95% target</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div className="text-center py-4 text-slate-500 text-sm">
                   Upcoming: TechCorp (Dec 15)
                </div>
              </div>
            </Card>

            <Card className="max-h-[300px] overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="text-blue-600" size={20} />
                  <h3 className="font-bold text-slate-800">Activity Feed</h3>
                </div>
              </div>
              <div className="space-y-3">
                {ACTIVITIES.map((act, i) => (
                   <div key={i} className="flex gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className={`mt-0.5 shrink-0 ${
                        act.type === 'lease' ? 'text-green-600' : 
                        act.type === 'maintenance' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                         {act.type === 'lease' ? <CircleCheckBig size={16} /> : <Info size={16} />}
                      </div>
                      <div>
                         <p className="text-sm text-slate-800 font-medium">{act.description}</p>
                         <p className="text-xs text-slate-400">{act.time}</p>
                      </div>
                   </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Operations Section 2: Budget / Vendor / Energy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card>
              <div className="flex items-center gap-2 mb-4">
                 <DollarSign className="text-green-600" size={20} />
                 <h3 className="font-bold text-slate-800">Budget Tracking</h3>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                 <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall Budget</span>
                    <span className="text-green-700 font-bold">94%</span>
                 </div>
                 <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500">
                    <span>Actual: $980k</span>
                    <span>Budget: $1.04M</span>
                 </div>
              </div>
              <div className="text-center text-slate-400 text-sm py-4">No granular budget data available</div>
           </Card>

           <Card>
              <div className="flex items-center gap-2 mb-4">
                 <TrendingUp className="text-blue-600" size={20} />
                 <h3 className="font-bold text-slate-800">Vendor Performance</h3>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">Top: City Cleaners</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm">
                    <TrendingDown size={16} className="text-red-600" />
                    <span className="font-medium text-red-700">Attn: ABC HVAC (Delay)</span>
                 </div>
              </div>
              <div className="text-center text-slate-400 text-sm py-8">View detailed report</div>
           </Card>

           <Card>
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Zap className="text-green-600" size={20} />
                    <h3 className="font-bold text-slate-800">Energy Usage</h3>
                    <AIAssistButton prompt="Analyze energy consumption patterns." size={14} />
                 </div>
                 <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">↓ 4.1% MoM</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                 <div className="bg-green-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-500 flex items-center gap-1"><Zap size={10} /> Current</div>
                    <div className="font-bold text-slate-800">479.5</div>
                    <div className="text-[10px] text-slate-400">MWh</div>
                 </div>
                 <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-500 flex items-center gap-1"><Leaf size={10} /> Savings</div>
                    <div className="font-bold text-green-600">3.2%</div>
                    <div className="text-[10px] text-slate-400">vs target</div>
                 </div>
                 <div className="bg-orange-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-500 flex items-center gap-1"><TrendingDown size={10} /> Avg</div>
                    <div className="font-bold text-slate-800">483.9</div>
                    <div className="text-[10px] text-slate-400">MWh</div>
                 </div>
              </div>
              <div className="h-[120px] relative">
                 <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <button className="p-1 hover:bg-slate-100 rounded"><Download size={12} /></button>
                    <button className="p-1 hover:bg-slate-100 rounded"><Maximize2 size={12} /></button>
                 </div>
                 <ReactECharts option={energyOption} style={{ height: '100%', width: '100%' }} />
              </div>
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 flex items-start gap-2">
                 <Leaf size={16} className="text-green-600 mt-0.5" />
                 <div>
                    <p className="text-sm font-bold text-green-900">Sustainability Goal on Track</p>
                    <p className="text-xs text-green-800 mt-0.5">Current consumption is 3.2% below target.</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Analytics Section: Detailed Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           <Card>
              <h3 className="font-bold text-lg text-slate-900 mb-4">Occupancy Trends by Type</h3>
              <div className="h-[300px]">
                 <ReactECharts option={occupancyTrendOption} style={{ height: '100%', width: '100%' }} />
              </div>
           </Card>
           <Card>
              <h3 className="font-bold text-lg text-slate-900 mb-4">Maintenance Operations</h3>
              <div className="h-[300px]">
                 <ReactECharts option={maintenanceOpsOption} style={{ height: '100%', width: '100%' }} />
              </div>
           </Card>
        </div>

        <Card>
           <h3 className="font-bold text-lg text-slate-900 mb-4">Vendor Performance Analysis</h3>
           <div className="h-[350px]">
              <ReactECharts option={vendorRadarOption} style={{ height: '100%', width: '100%' }} />
           </div>
        </Card>

        <Card>
           <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-lg text-slate-900">Revenue Trend Analysis</h3>
              <AIAssistButton prompt="Analyze the revenue trend for the last 12 months." />
           </div>
           <div className="h-[400px]">
              <ReactECharts option={revenueOption} style={{ height: '100%', width: '100%' }} />
           </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           <Card>
              <h3 className="font-bold text-lg text-slate-900 mb-4">Property Portfolio Distribution</h3>
              <div className="h-[400px]">
                 <ReactECharts option={portfolioOption} style={{ height: '100%', width: '100%' }} />
              </div>
           </Card>
           <Card>
              <h3 className="font-bold text-lg text-slate-900 mb-4">Tenant Analysis by Property Type</h3>
              <div className="h-[400px]">
                 <ReactECharts option={tenantAnalysisOption} style={{ height: '100%', width: '100%' }} />
              </div>
           </Card>
        </div>

      </main>
    </div>
  );
};

export default OperationsAnalytics;