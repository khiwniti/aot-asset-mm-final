import { useState, useEffect, type FormEvent } from 'react';
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
  Sparkles,
  CheckSquare,
  Plus,
  Trash2
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
            <div 
              key={index} 
              className={`
                rounded-2xl p-6 border transition-all duration-500 ease-out cursor-pointer relative group overflow-hidden
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-100
                ${index === 0 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-transparent shadow-lg shadow-blue-200' 
                  : 'bg-white border-slate-100 hover:border-blue-100'}
              `}
            >
              {/* Hover Gradient Overlay for white cards */}
              {index !== 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}
              
              <div className="relative z-10">
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                   <AIAssistButton 
                      prompt={`Analyze the trend for ${kpi.label} which is currently ${kpi.value}.`} 
                      className={index === 0 ? "text-blue-200 hover:text-white hover:bg-white/20" : ""}
                   />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-sm font-semibold tracking-wide ${index === 0 ? 'text-blue-100' : 'text-slate-500'}`}>{kpi.label}</span>
                </div>
                
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">{kpi.value}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-300 group-hover:scale-110
                    ${index === 0 ? 'bg-white/20 backdrop-blur-sm text-white' : (kpi.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}
                  `}>
                    {kpi.isPositive ? (
                      <ArrowUpRight size={14} strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight size={14} strokeWidth={2.5} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${index === 0 ? 'text-blue-50' : (kpi.isPositive ? 'text-green-600' : 'text-red-600')}`}>
                    {Math.abs(kpi.trend)}% {kpi.trendLabel}
                  </span>
                </div>
              </div>

              {/* Decorative background elements */}
              {index === 0 && (
                <>
                   <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:shadow-md">
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
            <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex-1 group">
              <div className="flex items-start gap-3 h-full">
                 <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
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
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:shadow-md">
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
            <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100 group">
              <div className="flex items-start gap-3">
                 <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
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

        {/* Bottom Section: Activity, Alerts & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-slate-800">Recent Activity</h3>
                 <AIAssistButton prompt="Summarize the recent activity and highlight any unusual patterns." />
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="space-y-6">
              {ACTIVITIES.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative group">
                   {idx !== ACTIVITIES.length - 1 && (
                     <div className="absolute left-[19px] top-8 bottom-[-24px] w-[2px] bg-slate-100 group-hover:bg-blue-50 transition-colors"></div>
                   )}
                   <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center z-10 transition-transform group-hover:scale-110
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

          {/* Right Column Stack: Critical Alerts & Tasks */}
          <div className="space-y-6">
            {/* Critical Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">Critical Alerts</h3>
                    <AIAssistButton prompt="Show me all critical and warning alerts using the alert list view." />
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse">
                  <AlertCircle size={18} />
                </div>
              </div>

              <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {ALERTS.filter(a => a.severity === 'critical' || a.severity === 'warning').map((alert) => (
                  <div key={alert.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all cursor-pointer hover:shadow-sm group">
                    <div className="flex items-start gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{alert.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.description}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Take Action <ChevronRight size={12} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Task Manager */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">My Tasks</h3>
                  <AIAssistButton prompt="Generate follow-up tasks based on the critical alerts and recent activity." />
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{tasks.filter(t => !t.completed).length} open</span>
              </div>

              {/* Input */}
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add new task..."
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newTask.trim()}
                  className="bg-blue-600 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={18} />
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`group flex items-center gap-3 p-2 rounded-lg border transition-all
                      ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                        ${task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-blue-400'}`}
                    >
                      <CheckSquare size={14} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {task.title}
                      </p>
                    </div>

                    {!task.completed && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                        ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {task.priority === 'High' ? 'HP' : ''}
                      </span>
                    )}
                    
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && <div className="text-center py-4 text-xs text-slate-400">No tasks pending. Great job!</div>}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;