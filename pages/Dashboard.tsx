import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  AlertCircle,
  ChevronRight,
  Activity as ActivityIcon,
  FileText,
  Wrench,
  DollarSign,
  Sparkles
} from 'lucide-react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { KPIS, REVENUE_DATA, ALERTS, PROPERTY_TYPE_DISTRIBUTION, ACTIVITIES } from '../services/mockData';
import { generateAIResponse } from '../services/geminiService';

const Card = ({ children, className = '' }: { children?: any; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  const [insights, setInsights] = useState({ portfolio: '', revenue: '' });

  useEffect(() => {
    const fetchInsights = async () => {
      const portfolioResp = await generateAIResponse("Generate dashboard portfolio insight", []);
      const revenueResp = await generateAIResponse("Generate dashboard revenue insight", []);
      
      setInsights({
        portfolio: portfolioResp.text,
        revenue: revenueResp.text
      });
    };
    fetchInsights();
  }, []);

  // --- ECharts Options ---

  const portfolioOption = {
    tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        textStyle: { color: '#1e293b' },
        formatter: '{b}: {c}%'
    },
    legend: {
        bottom: '0%',
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: 11, color: '#64748b' }
    },
    color: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
    series: [
        {
            name: 'Portfolio Distribution',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 3
            },
            label: { show: false },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '14',
                    fontWeight: 'bold',
                    color: '#334155'
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.2)'
                }
            },
            labelLine: { show: false },
            data: PROPERTY_TYPE_DISTRIBUTION
        }
    ]
  };

  const revenueOption = {
    tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        textStyle: { color: '#1e293b' },
        axisPointer: { type: 'line', lineStyle: { type: 'dashed', color: '#94a3b8' } },
        formatter: (params: any) => {
            const p = params[0];
            return `<div class="font-bold text-slate-700 mb-1">${p.name}</div>
                    <div class="text-blue-600 font-semibold">$${(p.value * 1000000).toLocaleString()}</div>`;
        }
    },
    grid: {
        left: 0,
        right: 10,
        bottom: 0,
        top: 20,
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: REVENUE_DATA.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 11, margin: 12 }
    },
    yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { 
            color: '#94a3b8', 
            fontSize: 11, 
            formatter: (val: number) => `${val}M` 
        }
    },
    series: [
        {
            name: 'Revenue',
            type: 'line',
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 6,
            showSymbol: false,
            lineStyle: { width: 3, color: '#3b82f6' },
            areaStyle: {
                opacity: 1,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
                    { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
                ])
            },
            data: REVENUE_DATA.map(d => d.value)
        }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header 
        title="Dashboard" 
        subtitle="Executive overview of portfolio performance and critical alerts." 
      />

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {KPIS.map((kpi, index) => (
            <div key={index} className={`rounded-xl p-6 shadow-sm border transition-transform hover:-translate-y-1 cursor-pointer relative group ${index === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <AIAssistButton 
                    prompt={`Analyze the trend for ${kpi.label} which is currently ${kpi.value}.`} 
                    className={index === 0 ? "text-blue-200 hover:text-white hover:bg-blue-500" : ""}
                 />
              </div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-sm font-medium ${index === 0 ? 'text-blue-100' : 'text-slate-500'}`}>{kpi.label}</span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold tracking-tight">{kpi.value}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {kpi.isPositive ? (
                  <ArrowUpRight size={16} className={index === 0 ? 'text-green-300' : 'text-green-500'} />
                ) : (
                  <ArrowDownRight size={16} className={index === 0 ? 'text-red-300' : 'text-red-500'} />
                )}
                <span className={`text-xs font-medium ${index === 0 ? 'text-blue-100' : (kpi.isPositive ? 'text-green-600' : 'text-red-600')}`}>
                  {kpi.trend > 0 ? 'Increased' : 'Decreased'} by {Math.abs(kpi.trend)}% {kpi.trendLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Portfolio Distribution</h3>
                <AIAssistButton 
                  prompt="Analyze my portfolio distribution. Are we too exposed to one property type?"
                  visualData={{
                    type: 'chart',
                    title: 'Portfolio Distribution',
                    chartType: 'pie',
                    data: { series: PROPERTY_TYPE_DISTRIBUTION }
                  }}
                />
            </div>
            <div className="h-[250px] w-full flex items-center justify-center">
               <ReactECharts option={portfolioOption} style={{height: '100%', width: '100%'}} />
            </div>
            {/* AI Explanation */}
            <div className="mt-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex-1">
              <div className="flex items-start gap-3 h-full">
                 <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} />
                 </div>
                 <div>
                    <h4 className="text-xs font-bold text-blue-700 mb-1">AI Insight</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                       {insights.portfolio ? insights.portfolio : <span className="animate-pulse text-slate-400">Generating analysis...</span>}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">Revenue Trend (12mo)</h3>
                  <AIAssistButton 
                    prompt="Analyze the 12-month revenue trend. What is the projected growth?" 
                    visualData={{
                      type: 'chart',
                      title: 'Revenue Trend (12mo)',
                      chartType: 'area',
                      data: { series: REVENUE_DATA }
                    }}
                  />
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1">
                  <Calendar size={14} /> Year
                </button>
              </div>
            </div>
            <div className="h-[250px] w-full">
               <ReactECharts option={revenueOption} style={{height: '100%', width: '100%'}} />
            </div>
            {/* AI Explanation */}
            <div className="mt-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} />
                 </div>
                 <div>
                    <h4 className="text-xs font-bold text-blue-700 mb-1">AI Insight</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                       {insights.revenue ? insights.revenue : <span className="animate-pulse text-slate-400">Generating analysis...</span>}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-slate-800">Recent Activity</h3>
                 <AIAssistButton prompt="Summarize the recent activity and highlight any unusual patterns." />
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="space-y-6">
              {ACTIVITIES.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative">
                   {idx !== ACTIVITIES.length - 1 && (
                     <div className="absolute left-[19px] top-8 bottom-[-24px] w-[2px] bg-slate-100"></div>
                   )}
                   <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center z-10
                     ${activity.type === 'lease' ? 'bg-green-100 text-green-600' :
                       activity.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                       activity.type === 'financial' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                     }`}>
                      {activity.type === 'lease' && <FileText size={18} />}
                      {activity.type === 'maintenance' && <Wrench size={18} />}
                      {activity.type === 'financial' && <DollarSign size={18} />}
                      {activity.type === 'system' && <ActivityIcon size={18} />}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                     <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">Critical Alerts</h3>
                  <AIAssistButton prompt="Show me all critical and warning alerts using the alert list view." />
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
            </div>

            <div className="space-y-4">
              {ALERTS.filter(a => a.severity === 'critical' || a.severity === 'warning').map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all">
                   <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{alert.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.description}</p>
                      </div>
                   </div>
                   <div className="mt-3 flex justify-end">
                      <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Take Action <ChevronRight size={12} />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;