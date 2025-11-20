import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import ReactECharts from 'echarts-for-react';
import { ArrowUpRight, Download } from 'lucide-react';

const FinancialManagement = () => {
  // Mock data for simulations
  const EXPENSES_DATA = [
    { name: 'Maintenance', value: 35, color: '#3b82f6' },
    { name: 'Utilities', value: 25, color: '#10b981' },
    { name: 'Insurance', value: 20, color: '#f59e0b' },
    { name: 'Taxes', value: 15, color: '#6366f1' },
    { name: 'Other', value: 5, color: '#94a3b8' },
  ];

  const SummaryCard = ({ label, value, trend, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
         <AIAssistButton prompt={`Explain the ${label} metric. Why is it ${trend}?`} size={14} />
      </div>
      <p className="text-sm text-slate-500 font-medium mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={14} className="mr-1" /> {trend}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">{subtext}</p>
    </div>
  );

  // --- ECharts Options ---

  // Waterfall Chart Logic
  // Revenue: 2400 (0 to 2400)
  // Parking: 150 (2400 to 2550)
  // Maint: -400 (2550 to 2150)
  // Tax: -300 (2150 to 1850)
  // Util: -200 (1850 to 1650)
  // NOI: 1650 (0 to 1650)

  const waterfallOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params: any) {
        let tar = params[1];
        return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
      }
    },
    grid: { left: 0, right: 0, bottom: 0, top: 10, containLabel: true },
    xAxis: {
      type: 'category',
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b' },
      data: ['Revenue', 'Parking', 'Maint.', 'Tax', 'Util.', 'NOI']
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
      axisLabel: { formatter: '${value}', color: '#64748b' }
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          }
        },
        data: [0, 2400, 2150, 1850, 1650, 0] // Calculated base values
      },
      {
        name: 'Income',
        type: 'bar',
        stack: 'Total',
        label: { show: true, position: 'top', formatter: '{c}', color: '#64748b', fontSize: 10 },
        data: [
           { value: 2400, itemStyle: { color: '#22c55e' } }, // Revenue
           { value: 150, itemStyle: { color: '#22c55e' } }, // Parking
           { value: 400, itemStyle: { color: '#ef4444' } }, // Maint (shown as positive bar, logic handled by stack position)
           { value: 300, itemStyle: { color: '#ef4444' } }, // Tax
           { value: 200, itemStyle: { color: '#ef4444' } }, // Util
           { value: 1650, itemStyle: { color: '#3b82f6' } } // NOI
        ],
        itemStyle: { borderRadius: 4 }
      }
    ]
  };

  const expensePieOption = {
    tooltip: { trigger: 'item' },
    legend: { show: false },
    series: [
      {
        name: 'Expenses',
        type: 'pie',
        radius: ['60%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        labelLine: { show: false },
        data: EXPENSES_DATA.map(d => ({ value: d.value, name: d.name, itemStyle: { color: d.color } }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Financial Management" subtitle="Track revenue, expenses, and financial performance." />
      
      <main className="p-8 max-w-[1600px] mx-auto space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard label="Total Revenue" value="$2.4M" trend="+5.2%" subtext="vs last month" />
          <SummaryCard label="Total Expenses" value="$980K" trend="+2.1%" subtext="vs last month" />
          <SummaryCard label="Net Income" value="$1.42M" trend="+8.1%" subtext="vs last month" />
          <SummaryCard label="Cash Flow" value="$1.38M" trend="+7.9%" subtext="vs last month" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waterfall Chart Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">Revenue vs Expenses Flow</h3>
                    <AIAssistButton prompt="Explain this waterfall chart. What is the biggest impact on our Net Operating Income?" />
                </div>
                <button className="text-sm text-blue-600 border border-blue-100 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition">Download Report</button>
             </div>
             <div className="h-[300px]">
                <ReactECharts option={waterfallOption} style={{height: '100%', width: '100%'}} />
             </div>
          </div>

          {/* Expense Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Expense Breakdown</h3>
                <AIAssistButton prompt="Suggest ways to reduce our operating expenses based on this breakdown." />
             </div>
             <div className="h-[250px] flex items-center justify-center relative">
                <ReactECharts option={expensePieOption} style={{height: '100%', width: '100%'}} />
                <div className="absolute text-center pointer-events-none">
                   <p className="text-xs text-slate-400">Total</p>
                   <p className="text-xl font-bold text-slate-800">$980k</p>
                </div>
             </div>
             <div className="flex flex-wrap justify-center gap-3 mt-4">
                {EXPENSES_DATA.map((item, i) => (
                   <div key={i} className="flex items-center gap-1 text-xs text-slate-600">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                      {item.name}
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-slate-800">Property Financial Breakdown</h3>
                 <AIAssistButton prompt="Identify underperforming properties from this list." />
              </div>
              <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm border border-slate-200 px-3 py-1.5 rounded-lg">
                 <Download size={16} /> Export CSV
              </button>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                 <tr>
                    <th className="p-4">Property</th>
                    <th className="p-4">Revenue</th>
                    <th className="p-4">Expenses</th>
                    <th className="p-4">NOI</th>
                    <th className="p-4">Margin</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {[
                    { name: 'Harbor Plaza', rev: 142000, exp: 58000, noi: 84000, margin: 59 },
                    { name: 'Oak Street', rev: 98000, exp: 42000, noi: 56000, margin: 57 },
                    { name: 'Riverside', rev: 215000, exp: 89000, noi: 126000, margin: 59 },
                    { name: 'Suvarnabhumi', rev: 180000, exp: 40000, noi: 140000, margin: 77 },
                 ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                       <td className="p-4 font-medium text-slate-800">{row.name}</td>
                       <td className="p-4 text-slate-600">${row.rev.toLocaleString()}</td>
                       <td className="p-4 text-red-500">${row.exp.toLocaleString()}</td>
                       <td className="p-4 font-bold text-green-600">${row.noi.toLocaleString()}</td>
                       <td className="p-4 text-slate-800">{row.margin}%</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </main>
    </div>
  );
};

export default FinancialManagement;