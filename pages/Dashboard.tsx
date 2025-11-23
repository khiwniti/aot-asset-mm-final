import { useState, useEffect, type FormEvent } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  ChevronRight,
  Activity as ActivityIcon,
  FileText,
  Wrench,
  DollarSign,
  Sparkles,
  CheckSquare,
  Plus,
  Trash2,
  BarChart3,
  ChevronDown,
  Filter,
  Flag,
  Minus
} from 'lucide-react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { KPIS, REVENUE_DATA, ALERTS, PROPERTY_TYPE_DISTRIBUTION, ACTIVITIES, TASKS } from '../services/mockData';
import { generateAIResponse } from '../services/geminiService';
import { Task } from '../types';

const Dashboard = () => {
  const [insights, setInsights] = useState({ portfolio: '', revenue: '' });
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [newTask, setNewTask] = useState('');
  
  // Filter State
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const portfolioResp = await generateAIResponse("Generate dashboard portfolio insight", []);
        const revenueResp = await generateAIResponse("Generate dashboard revenue insight", []);
        
        setInsights({
          portfolio: portfolioResp.text,
          revenue: revenueResp.text
        });
      } catch (error) {
        // console.error("Error fetching insights:", error);
      }
    };
    fetchInsights();
  }, []);

  // --- Task Management Logic ---
  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: 'Medium'
    };
    
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'High') return <Flag size={10} className="fill-current" />;
    if (priority === 'Medium') return <ActivityIcon size={10} />;
    return <Minus size={10} />;
  };

  // --- ECharts Options ---

  const portfolioOption = {
    tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 16,
        textStyle: { color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" },
        formatter: '{b}: {c}%',
        extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 12px; border: none;'
    },
    legend: {
        bottom: '0%',
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: 12, color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }
    },
    color: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
    series: [
        {
            name: 'Portfolio',
            type: 'pie',
            radius: ['50%', '75%'],
            center: ['50%', '42%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 4
            },
            label: { show: false },
            emphasis: {
                scale: true,
                scaleSize: 5,
                label: {
                    show: true,
                    fontSize: '16',
                    fontWeight: '700',
                    color: '#0f172a',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                },
                itemStyle: {
                    shadowBlur: 20,
                    shadowColor: 'rgba(0, 0, 0, 0.1)'
                }
            },
            data: PROPERTY_TYPE_DISTRIBUTION
        }
    ]
  };

  const revenueOption = {
    tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 16,
        textStyle: { color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" },
        axisPointer: { type: 'line', lineStyle: { type: 'dashed', color: '#cbd5e1', width: 2 } },
        extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 12px; border: none;',
        formatter: (params: any) => {
            if (!Array.isArray(params) || params.length === 0 || !params[0]) return '';
            const p = params[0];
            if (!p || p.value === undefined) return '';
            return `<div class="font-bold text-slate-900 mb-1 text-sm">${p.name}</div>
                    <div class="text-blue-600 font-bold text-lg">$${(Number(p.value) * 1000000).toLocaleString()}</div>`;
        }
    },
    grid: {
        left: 20,
        right: 20,
        bottom: 10,
        top: 30,
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: REVENUE_DATA.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 12, margin: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }
    },
    yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', width: 1 } },
        axisLabel: { 
            color: '#94a3b8', 
            fontSize: 12,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            formatter: (val: number) => `${val}M` 
        }
    },
    series: [
        {
            name: 'Revenue',
            type: 'line',
            smooth: 0.4,
            symbol: 'circle',
            symbolSize: 6, // Added symbol size for clearer data points
            showSymbol: false,
            lineStyle: { width: 4, color: '#3b82f6', shadowColor: 'rgba(59, 130, 246, 0.3)', shadowBlur: 10 },
            areaStyle: {
                opacity: 0.6, // Increased slightly
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
                    { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
                ])
            },
            emphasis: {
                showSymbol: true, // Show symbol on hover
                itemStyle: {
                    opacity: 1,
                    borderWidth: 3,
                    borderColor: '#fff',
                    color: '#3b82f6',
                    shadowBlur: 5,
                    shadowColor: '#3b82f6'
                }
            },
            data: REVENUE_DATA.map(d => d.value)
        }
    ]
  };

  return (
    <div className="min-h-screen pb-12">
      <Header 
        title="Dashboard" 
        subtitle="Executive overview of portfolio performance and critical alerts." 
      />

      {/* Global Filter Bar */}
      <div className="px-8 py-3 flex items-center gap-3 sticky top-[80px] z-10 bg-[#f8f9fc]/90 backdrop-blur supports-[backdrop-filter]:bg-[#f8f9fc]/50 border-b border-slate-200/50 transition-all">
        <div className="relative">
            <button 
                onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm
                    ${isTypeFilterOpen ? 'border-blue-500 ring-2 ring-blue-100 text-blue-600' : 'border-slate-200 hover:border-slate-300 text-slate-700'}
                `}
            >
                Property type
                <ChevronDown size={16} className={`transition-transform duration-200 ${isTypeFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTypeFilterOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsTypeFilterOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                        <div className="space-y-1">
                            {['Residential', 'Townhouse', 'Condominium', 'Land', 'Maintenance records'].map(type => (
                                <label key={type} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                    <div className="relative flex items-center">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedTypes.includes(type)}
                                          onChange={() => toggleType(type)}
                                          className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" 
                                      />
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium">{type}</span>
                                </label>
                            ))}
                        </div>
                        <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between px-2 pb-1">
                            <button onClick={() => setSelectedTypes([])} className="text-xs text-slate-400 hover:text-slate-600 font-medium">Clear</button>
                            <button onClick={() => setIsTypeFilterOpen(false)} className="text-xs text-blue-600 font-bold hover:text-blue-700">Apply</button>
                        </div>
                    </div>
                </>
            )}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-all shadow-sm group">
            Region
            <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600" />
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-all shadow-sm">
            <Filter size={16} className="text-slate-500" />
            More filters
        </button>

        {selectedTypes.length > 0 && (
           <div className="ml-auto flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
              <span className="text-xs text-slate-500 font-medium">Active filters:</span>
              {selectedTypes.map(t => (
                 <span key={t} className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold flex items-center gap-1">
                    {t} <button onClick={() => toggleType(t)} className="hover:text-blue-800">×</button>
                 </span>
              ))}
           </div>
        )}
      </div>

      <main className="px-8 py-6 max-w-[1600px] mx-auto space-y-8">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {KPIS.map((kpi, index) => (
            <div 
              key={index} 
              className={`
                relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ease-out group cursor-default
                transform hover:-translate-y-2 hover:scale-[1.02]
                ${index === 0 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/10 hover:shadow-2xl hover:shadow-blue-900/30' 
                  : 'bg-white hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100'}
              `}
            >
              {/* Background Decoration for Dark Card */}
              {index === 0 && (
                <>
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-150"></div>
                  <div className="absolute bottom-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </>
              )}
              
              {/* Background Hover Effect for Light Cards */}
              {index !== 0 && (
                 <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm
                     ${index === 0 ? 'bg-white/10 text-white group-hover:bg-white/20 shadow-inner' : 'bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:shadow-blue-100'}`}>
                    {index === 0 ? <DollarSign size={20} /> : index === 1 ? <ActivityIcon size={20} /> : index === 2 ? <BarChart3 size={20} /> : <CheckSquare size={20} />}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                     <AIAssistButton 
                        prompt={`Analyze the trend for ${kpi.label} which is currently ${kpi.value}.`} 
                        className={index === 0 ? "text-slate-300 hover:text-white hover:bg-white/10" : ""}
                     />
                  </div>
                </div>
                
                <div className="mb-1 overflow-hidden">
                   <span className={`text-sm font-semibold tracking-wide block transform transition-transform duration-300 group-hover:translate-x-1 ${index === 0 ? 'text-slate-300' : 'text-slate-500'}`}>{kpi.label}</span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold tracking-tight">{kpi.value}</span>
                </div>
                
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm ${
                  index === 0 
                    ? 'bg-white/10 text-white border border-white/5 group-hover:bg-white/20' 
                    : (kpi.isPositive ? 'bg-green-50 text-green-600 border border-green-100 group-hover:bg-green-100 group-hover:border-green-200' : 'bg-red-50 text-red-600 border border-red-100 group-hover:bg-red-100 group-hover:border-red-200')
                }`}>
                  {kpi.isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                  <span>{Math.abs(kpi.trend)}% {kpi.trendLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-1 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-slate-300">
            <div className="p-6 pb-0 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">Portfolio</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Asset Distribution</p>
                </div>
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
            <div className="flex-1 min-h-[250px] w-full flex items-center justify-center relative">
               <ReactECharts option={portfolioOption} style={{height: '100%', width: '100%'}} />
               {/* Center text for Donut */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-bold text-slate-800">102M</span>
               </div>
            </div>
            {/* AI Insight Footer */}
            <div className="mx-4 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex gap-3 items-start group hover:bg-slate-100 transition-colors">
               <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <Sparkles size={12} strokeWidth={2.5} />
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">AI Insight</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                     {insights.portfolio ? insights.portfolio : <span className="animate-pulse text-slate-400">Analyzing data patterns...</span>}
                  </p>
               </div>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-1 flex flex-col transition-all hover:shadow-md hover:border-slate-300">
            <div className="p-6 pb-0 flex items-center justify-between">
              <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">Revenue Growth</h3>
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
                  <p className="text-xs text-slate-400 font-medium mt-1">Year over Year Performance</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="px-3 py-1 rounded-md text-xs font-bold bg-white text-slate-800 shadow-sm">12M</button>
                <button className="px-3 py-1 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700">6M</button>
                <button className="px-3 py-1 rounded-md text-xs font-bold text-slate-500 hover:text-slate-700">30D</button>
              </div>
            </div>
            <div className="h-[280px] w-full px-4">
               <ReactECharts option={revenueOption} style={{height: '100%', width: '100%'}} />
            </div>
            {/* AI Insight Footer */}
             <div className="mx-4 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex gap-3 items-start group hover:bg-slate-100 transition-colors">
               <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <Sparkles size={12} strokeWidth={2.5} />
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">AI Insight</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                     {insights.revenue ? insights.revenue : <span className="animate-pulse text-slate-400">Analyzing trends...</span>}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Activity, Alerts & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-lg text-slate-900">Recent Activity</h3>
                 <AIAssistButton prompt="Summarize the recent activity and highlight any unusual patterns." />
              </div>
              <button className="text-xs text-slate-500 hover:text-slate-900 font-bold border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">View All</button>
            </div>
            <div className="space-y-6 pl-2">
              {ACTIVITIES.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative group">
                   {idx !== ACTIVITIES.length - 1 && (
                     <div className="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-slate-100 group-hover:bg-blue-50 transition-colors"></div>
                   )}
                   <div className={`relative z-10 w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border border-white transition-transform group-hover:scale-110 group-hover:rotate-3
                     ${activity.type === 'lease' ? 'bg-emerald-50 text-emerald-600' :
                       activity.type === 'maintenance' ? 'bg-orange-50 text-orange-600' :
                       activity.type === 'financial' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                     }`}>
                      {activity.type === 'lease' && <FileText size={18} />}
                      {activity.type === 'maintenance' && <Wrench size={18} />}
                      {activity.type === 'financial' && <DollarSign size={18} />}
                      {activity.type === 'system' && <ActivityIcon size={18} />}
                   </div>
                   <div className="pt-0.5">
                     <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{activity.description}</p>
                     <p className="text-xs text-slate-400 mt-1 font-medium">{activity.time}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Stack: Critical Alerts & Tasks */}
          <div className="space-y-6">
            {/* Critical Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 relative overflow-hidden group hover:shadow-md transition-all">
              {/* Gradient Header Line */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">Critical Alerts</h3>
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>
                <AIAssistButton prompt="Show me all critical and warning alerts." />
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                {ALERTS.filter(a => a.severity === 'critical' || a.severity === 'warning').map((alert) => (
                  <div key={alert.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer group/item">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className={`mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 group-hover/item:text-red-700 transition-colors">{alert.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed group-hover/item:text-slate-700">{alert.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                             <span>{alert.date}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                             <span className="text-blue-600 hover:underline flex items-center gap-0.5">Action <ChevronRight size={10}/></span>
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Task Manager */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900">My Tasks</h3>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">{tasks.filter(t => !t.completed).length} pending</span>
              </div>

              {/* Input */}
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                    />
                </div>
                <button 
                  type="submit"
                  disabled={!newTask.trim()}
                  className="bg-slate-900 text-white rounded-xl w-10 flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Plus size={18} />
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                      ${task.completed 
                        ? 'bg-slate-50 border-transparent opacity-60' 
                        : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200
                        ${task.completed 
                            ? 'bg-blue-500 border-blue-500 text-white scale-90' 
                            : 'bg-white border-slate-300 text-transparent hover:border-blue-500'}`}
                    >
                      <CheckSquare size={12} strokeWidth={3} />
                    </button>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className={`text-sm truncate font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                        {task.title}
                      </p>
                      {!task.completed && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ml-auto flex items-center gap-1 ${
                          task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                          task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                            <Sparkles size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-500">All caught up!</p>
                    </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;