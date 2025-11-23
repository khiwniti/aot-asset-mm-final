import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useChat } from '../context/ChatContext';
import { ReportData } from '../types';
import ReactECharts from 'echarts-for-react';
import { ArrowLeft, Download, Share2, Calendar, Printer, TrendingUp, TrendingDown, Minus, FileBarChart2, Table } from 'lucide-react';
import * as echarts from 'echarts';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { generatedReports } = useChat();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock static reports to ensure the page works even without AI generation
  const MOCK_REPORTS: ReportData[] = [
    {
      id: 'RPT-2024-001',
      title: 'Q3 2024 Financial Performance',
      type: 'Financial',
      period: 'Q3 2024',
      summary: 'Revenue exceeded targets by 12% driven by high occupancy in commercial units. Operating expenses remained flat.',
      generatedAt: '2024-10-15T10:00:00Z',
      keyMetrics: [
        { label: 'Total Revenue', value: '$4.2M', trend: 'up' },
        { label: 'Net Operating Income', value: '$2.8M', trend: 'up' },
        { label: 'OpEx Ratio', value: '32%', trend: 'down' }
      ]
    },
    {
      id: 'RPT-2024-002',
      title: 'Monthly Occupancy Analysis',
      type: 'Operational',
      period: 'October 2024',
      summary: 'Overall occupancy holds steady at 94%. Residential units are fully leased, while Office space sees a slight decline.',
      generatedAt: '2024-11-01T09:30:00Z',
      keyMetrics: [
        { label: 'Occupancy Rate', value: '94%', trend: 'neutral' },
        { label: 'Avg Lease Term', value: '14 mo', trend: 'up' },
        { label: 'Turnover Rate', value: '2%', trend: 'down' }
      ]
    },
    {
      id: 'RPT-2024-003',
      title: 'Annual Compliance Audit',
      type: 'Compliance',
      period: '2024 YTD',
      summary: 'All properties passed fire safety inspections. 2 minor zoning warnings resolved in Q2.',
      generatedAt: '2024-11-10T14:15:00Z',
      keyMetrics: [
        { label: 'Inspection Pass Rate', value: '100%', trend: 'up' },
        { label: 'Open Violations', value: '0', trend: 'down' },
        { label: 'Insurance Status', value: 'Active', trend: 'neutral' }
      ]
    }
  ];

  useEffect(() => {
    // 1. Try to find in AI generated reports context
    const aiReport = generatedReports.find(r => r.id === id);
    
    if (aiReport) {
      setReport(aiReport);
      setLoading(false);
      return;
    }

    // 2. Try to find in Mock Static reports
    const staticReport = MOCK_REPORTS.find(r => r.id === id);
    if (staticReport) {
      setReport(staticReport);
      setLoading(false);
      return;
    }

    // 3. Fallback
    setLoading(false);
  }, [id, generatedReports]);

  if (loading) return <div className="p-8 text-center">Loading report details...</div>;

  // If still no report found (and not loading), use the first mock as a fallback for demo purposes
  const activeReport = report || MOCK_REPORTS[0]; 

  // --- Chart Configuration based on Report Type ---
  const getChartOption = () => {
    if (activeReport.type === 'Financial') {
      return {
        tooltip: { 
            trigger: 'axis',
            formatter: (params: any) => {
                if (!Array.isArray(params) || params.length === 0 || !params[0]) return '';
                const p = params[0];
                return `${p.name}<br/>${p.marker} ${p.seriesName}: ${p.value}`;
            }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: [320, 332, 301, 334, 390, 450],
            itemStyle: { 
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#60a5fa' }]),
              borderRadius: [4, 4, 0, 0] 
            },
            barWidth: '40%',
          },
          {
            name: 'Expenses',
            type: 'line',
            data: [150, 232, 201, 154, 190, 210],
            smooth: true,
            itemStyle: { color: '#f59e0b' },
            lineStyle: { width: 3 }
          }
        ]
      };
    } else if (activeReport.type === 'Operational') {
       return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { top: '5%', left: 'center' },
        series: [
            {
                name: 'Occupancy',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
                data: [
                    { value: 1048, name: 'Leased' },
                    { value: 300, name: 'Vacant' },
                    { value: 120, name: 'Maintenance' }
                ]
            }
        ]
       };
    }
    
    // Default Chart
    return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
        yAxis: { type: 'value' },
        series: [{ data: [820, 932, 901, 934], type: 'line', smooth: true, areaStyle: {} }]
    };
  };

  const getTrendIcon = (trend?: string) => {
      if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
      if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
      return <Minus size={16} className="text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Sub-Report Details" subtitle={`Reference ID: ${activeReport.id}`} />
      
      <main className="p-8 max-w-[1400px] mx-auto space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button 
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
                <ArrowLeft size={18} /> Back to Report List
            </button>

            <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-sm flex items-center gap-2 hover:bg-slate-50 shadow-sm">
                    <Printer size={16} /> Print View
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-sm flex items-center gap-2 hover:bg-slate-50 shadow-sm">
                    <Share2 size={16} /> Share
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-200">
                    <Download size={16} /> Export PDF
                </button>
            </div>
        </div>

        {/* Report Content - Document Style */}
        <div className="bg-white rounded-none md:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Report Header */}
            <div className="p-8 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border
                                ${activeReport.type === 'Financial' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                  activeReport.type === 'Operational' ? 'bg-green-50 text-green-700 border-green-100' : 
                                  'bg-purple-50 text-purple-700 border-purple-100'
                                }`}>
                                {activeReport.type}
                            </span>
                            <span className="text-slate-500 text-sm flex items-center gap-1">
                                <Calendar size={14} /> Generated: {new Date(activeReport.generatedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{activeReport.title}</h1>
                        <p className="text-slate-500 font-medium text-lg">Reporting Period: {activeReport.period}</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white mb-2 ml-auto">
                            <FileBarChart2 size={24} />
                        </div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Confidential</div>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="p-8 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Executive Summary</h3>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-slate-700 leading-relaxed text-base font-medium">
                        "{activeReport.summary}"
                    </p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="p-8 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeReport.keyMetrics.map((metric, index) => (
                        <div key={index} className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <p className="text-sm text-slate-500 font-medium mb-2">{metric.label}</p>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded
                                    ${metric.trend === 'up' ? 'bg-green-50 text-green-700' : 
                                      metric.trend === 'down' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {getTrendIcon(metric.trend)}
                                    <span className="uppercase">{metric.trend}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visualizations */}
            <div className="p-8 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Visual Analysis</h3>
                <div className="h-[400px] w-full border border-slate-200 rounded-xl p-4 bg-slate-50/30">
                     <ReactECharts option={getChartOption()} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="p-8 bg-slate-50/30">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Table size={18} className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailed Breakdown</h3>
                    </div>
                    <button className="text-sm text-blue-600 font-medium hover:underline">Download Raw CSV</button>
                </div>
                <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-1/3">Category</th>
                                <th className="p-4">Previous Period</th>
                                <th className="p-4">Current Period</th>
                                <th className="p-4">Variance</th>
                                <th className="p-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { cat: 'Rental Income', prev: '$1,200,000', curr: '$1,350,000', var: '+12.5%', status: 'Good' },
                                { cat: 'Operating Expenses', prev: '$450,000', curr: '$460,000', var: '+2.2%', status: 'Stable' },
                                { cat: 'Maintenance Costs', prev: '$80,000', curr: '$95,000', var: '+18.7%', status: 'Review' },
                                { cat: 'Marketing & Ads', prev: '$25,000', curr: '$22,000', var: '-12.0%', status: 'Good' },
                                { cat: 'Utility Charges', prev: '$60,000', curr: '$58,000', var: '-3.3%', status: 'Good' },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-medium text-slate-800">{row.cat}</td>
                                    <td className="p-4 text-slate-500 font-mono">{row.prev}</td>
                                    <td className="p-4 text-slate-800 font-mono font-bold">{row.curr}</td>
                                    <td className={`p-4 font-medium ${row.var.startsWith('+') && row.cat.includes('Income') ? 'text-green-600' : row.var.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>{row.var}</td>
                                    <td className="p-4 text-right">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                                            ${row.status === 'Good' ? 'bg-green-50 text-green-700 border-green-100' : 
                                              row.status === 'Review' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                            <tr>
                                <td className="p-4">Total Net</td>
                                <td className="p-4">$585,000</td>
                                <td className="p-4">$715,000</td>
                                <td className="p-4 text-green-600">+22.2%</td>
                                <td className="p-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default ReportDetail;