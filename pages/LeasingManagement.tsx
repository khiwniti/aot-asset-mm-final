import { useState } from 'react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { LEASES } from '../services/mockData';
import { Clock, AlertCircle, UserPlus, CheckCircle2, Send, FileCheck, ArrowRight } from 'lucide-react';
import { Lease } from '../types';

const LeasingManagement = () => {
  const [leases, setLeases] = useState<Lease[]>(LEASES);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSendNotice = (id: string) => {
    // Simulate sending notice
    setLeases(prev => prev.map(lease => {
       if (lease.id === id) {
          return { ...lease, renewalStatus: 'Sent' };
       }
       return lease;
    }));
    
    const lease = leases.find(l => l.id === id);
    setNotification(`Renewal notice sent to ${lease?.tenant}`);
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  const getRenewalBadge = (status: string | undefined) => {
     switch(status) {
        case 'Sent': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><Send size={10} /> Notice Sent</span>;
        case 'Draft': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Drafted</span>;
        case 'Negotiating': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Negotiating</span>;
        case 'Signed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"><FileCheck size={10} /> Signed</span>;
        default: return <span className="text-xs text-slate-400">-</span>;
     }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Leasing Management" subtitle="Manage tenants, leases, vacancies and renewals." />
      
      <main className="p-8 max-w-[1600px] mx-auto space-y-8 relative">
        {/* Notification Toast */}
        {notification && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 fade-in">
              <CheckCircle2 size={18} className="text-green-400" />
              <span className="text-sm font-medium">{notification}</span>
           </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <AIAssistButton prompt="Analyze our lease retention rate." size={14} />
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><CheckCircle2 /></div>
              <div>
                 <p className="text-2xl font-bold text-slate-800">189</p>
                 <p className="text-xs text-slate-500 uppercase font-bold">Active Leases</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <AIAssistButton prompt="Draft renewals for expiring leases." size={14} />
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><Clock /></div>
              <div>
                 <p className="text-2xl font-bold text-slate-800">23</p>
                 <p className="text-xs text-slate-500 uppercase font-bold">Expiring (90d)</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><AlertCircle /></div>
              <div>
                 <p className="text-2xl font-bold text-slate-800">6.2%</p>
                 <p className="text-xs text-slate-500 uppercase font-bold">Vacancy Rate</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><UserPlus /></div>
              <div>
                 <p className="text-2xl font-bold text-slate-800">3.5yr</p>
                 <p className="text-xs text-slate-500 uppercase font-bold">Avg Lease Term</p>
              </div>
           </div>
        </div>

        {/* Lease Expiration Timeline (Visual Mock) */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 overflow-hidden">
           <div className="flex items-center gap-3 mb-8">
              <h3 className="font-bold text-slate-800">Lease Expiration Timeline</h3>
              <AIAssistButton prompt="Forecast vacancy for the next 6 months based on this timeline." />
           </div>
           <div className="relative h-20">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center">
                 <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                 <span className="mt-2 text-xs font-bold text-slate-400">Nov</span>
              </div>
              <div className="absolute top-1/2 left-[30%] -translate-y-1/2 flex flex-col items-center">
                 <div className="w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
                 <div className="absolute bottom-6 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">TechCorp (P001)</div>
                 <span className="mt-2 text-xs font-bold text-slate-800">Dec</span>
              </div>
              <div className="absolute top-1/2 left-[50%] -translate-y-1/2 flex flex-col items-center">
                 <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                 <span className="mt-2 text-xs font-bold text-slate-400">Jan</span>
              </div>
              <div className="absolute top-1/2 left-[70%] -translate-y-1/2 flex flex-col items-center">
                 <div className="w-4 h-4 rounded-full bg-amber-400 border-4 border-white shadow-sm"></div>
                 <span className="mt-2 text-xs font-bold text-slate-800">Feb</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Table */}
           <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">Lease Management</h3>
                    <AIAssistButton prompt="List all tenants with leases expiring in the next 60 days." />
                 </div>
                 <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ New Lease</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                       <tr>
                          <th className="p-4">Property</th>
                          <th className="p-4">Tenant</th>
                          <th className="p-4">End Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Renewal</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {leases.map(lease => (
                          <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-4 text-sm font-medium text-slate-700">{lease.propertyName}</td>
                             <td className="p-4 text-sm text-slate-600">{lease.tenant}</td>
                             <td className="p-4 text-sm text-slate-600">{lease.endDate}</td>
                             <td className="p-4">
                                <div className={`w-2 h-2 rounded-full ${lease.status === 'Expiring' ? 'bg-red-500' : lease.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                             </td>
                             <td className="p-4">
                                {getRenewalBadge(lease.renewalStatus)}
                             </td>
                             <td className="p-4 text-right">
                                {lease.status === 'Expiring' && lease.renewalStatus !== 'Sent' && lease.renewalStatus !== 'Signed' ? (
                                   <button 
                                      onClick={() => handleSendNotice(lease.id)}
                                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
                                   >
                                      Send Notice <ArrowRight size={12} />
                                   </button>
                                ) : (
                                   <button className="text-xs text-slate-400 px-3 py-1.5">View Details</button>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Side Cards */}
           <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Vacant Units</h3>
                    <AIAssistButton prompt="Suggest a marketing strategy for these vacant units." />
                 </div>
                 <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                       <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm text-slate-700">Floor 3-301</span>
                          <span className="text-xs text-red-500 font-bold">45 days</span>
                       </div>
                       <p className="text-xs text-slate-500">2,500 sf • Market: $4,200</p>
                       <button className="w-full mt-2 text-xs bg-white border border-slate-300 py-1 rounded hover:bg-slate-100">List Property</button>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                 <h3 className="font-bold text-slate-800 mb-4">Applications</h3>
                 <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                       <p className="font-bold text-sm text-slate-700">Global Services Inc.</p>
                       <p className="text-xs text-slate-500 mb-2">Harbor Plaza Floor 6</p>
                       <div className="flex gap-2">
                          <button className="flex-1 text-xs bg-green-600 text-white py-1 rounded hover:bg-green-700">Approve</button>
                          <button className="flex-1 text-xs bg-white border border-slate-300 py-1 rounded hover:bg-slate-100">Review</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default LeasingManagement;