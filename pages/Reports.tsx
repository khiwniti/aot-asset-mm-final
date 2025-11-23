
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { FileText, Download, Calendar, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ChevronRight, Clock } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Link, useNavigate } from 'react-router-dom';

const Reports = () => {
  const { generatedReports } = useChat();
  const navigate = useNavigate();

  const MOCK_HISTORY = [
      { id: 'RPT-2024-001', title: 'Q3 2024 Financial Performance', date: 'Oct 15, 2024', type: 'Financial', status: 'Finalized' },
      { id: 'RPT-2024-002', title: 'Monthly Occupancy Analysis', date: 'Nov 01, 2024', type: 'Operational', status: 'Draft' },
      { id: 'RPT-2024-003', title: 'Annual Compliance Audit', date: 'Nov 10, 2024', type: 'Compliance', status: 'Finalized' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Reports & Compliance" subtitle="Generate insights and track regulatory compliance." />
      
      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {['Portfolio Performance', 'Financial Statements', 'Compliance Checklist'].map((title, i) => (
             <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer group relative">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AIAssistButton prompt={`Generate a summary of the ${title}.`} />
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <FileText size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
                <button className="text-sm font-medium text-blue-600 group-hover:underline">Generate Report</button>
             </div>
           ))}
        </div>

        {/* AI Generated Reports Section (Shared State) */}
        {generatedReports.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                   <Sparkles size={16} />
                </div>
                <h3 className="font-bold text-slate-800">AI Generated Reports</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedReports.map((report, i) => (
                   <div key={i} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">{report.type}</span>
                         <span className="text-xs text-slate-400">{new Date(report.generatedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">{report.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{report.summary}</p>
                      
                      {/* Mini Metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {report.keyMetrics.slice(0, 3).map((m, idx) => (
                           <div key={idx} className="bg-white p-2 rounded border border-slate-100">
                              <div className="text-[10px] text-slate-400 truncate">{m.label}</div>
                              <div className={`text-xs font-bold ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-600' : 'text-slate-700'}`}>
                                 {m.value}
                              </div>
                           </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Link 
                            to={`/reports/${report.id}`} 
                            className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1"
                        >
                            View Details <ChevronRight size={12} />
                        </Link>
                        <button className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600">
                           <Download size={14} />
                        </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Report History List */}
           <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                 <h3 className="font-bold text-slate-800">Report History</h3>
                 <button className="text-sm text-blue-600 font-medium hover:underline">View Archive</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-3 rounded-l-lg">Report Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Date Generated</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 rounded-r-lg text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_HISTORY.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-3">
                                    <div className="font-bold text-slate-700 group-hover:text-blue-600">{report.title}</div>
                                    <div className="text-xs text-slate-400">{report.id}</div>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                        ${report.type === 'Financial' ? 'bg-blue-50 text-blue-600' : 
                                          report.type === 'Operational' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {report.type}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-600 flex items-center gap-2">
                                    {report.date}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${report.status === 'Finalized' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                        <span className="text-slate-600">{report.status}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    <Link to={`/reports/${report.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1">
                                        View <ArrowRight size={12} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
           </div>

           {/* Compliance Center (Right Sidebar) */}
           <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm h-fit">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-800">Compliance Center</h3>
                  <AIAssistButton prompt="Check for any upcoming compliance risks." />
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-3">
                       <h4 className="font-bold text-sm text-slate-700">Insurance Renewals</h4>
                       <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">3 Due Soon</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3 text-sm p-2 bg-slate-50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="flex-1 text-slate-700">Harbor Plaza - Property Insurance</span>
                          <span className="text-slate-500 text-xs">Due 12/15</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm p-2 bg-slate-50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="flex-1 text-slate-700">Oak Street - Liability Insurance</span>
                          <span className="text-slate-500 text-xs">Due 01/20</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between mb-3">
                       <h4 className="font-bold text-sm text-slate-700">Safety Inspections</h4>
                       <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">2 Overdue</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3 text-sm p-2 bg-red-50 rounded-lg border border-red-100 relative group">
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <AIAssistButton prompt="Schedule a safety inspection for Riverside." size={12} />
                          </div>
                          <AlertCircle size={14} className="text-red-500" />
                          <span className="flex-1 text-slate-700 font-medium">Riverside - Fire Safety</span>
                          <span className="text-red-600 text-xs font-bold">Due 10/30</span>
                       </div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between mb-3">
                       <h4 className="font-bold text-sm text-slate-700">Tax Filings</h4>
                       <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">All Current</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-2 bg-slate-50 rounded-lg opacity-60">
                       <CheckCircle2 size={14} className="text-green-500" />
                       <span className="flex-1 text-slate-700">Q3 Property Tax Filed</span>
                       <span className="text-slate-500 text-xs">10/15</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
