import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { WORK_ORDERS } from '../services/mockData';
import { Plus, CheckSquare, Clock, AlertOctagon } from 'lucide-react';

const Maintenance = () => {
  const columns = ['Submitted', 'Approved', 'In Progress', 'Completed'];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Maintenance & Operations" subtitle="Track work orders, repairs, and facility operations." />
      
      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Open Requests', val: 12, color: 'blue' },
             { label: 'In Progress', val: 8, color: 'amber' },
             { label: 'Pending Approval', val: 3, color: 'purple' },
             { label: 'Completed (Mo)', val: 45, color: 'green' }
           ].map((stat, i) => (
             <div key={i} className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-${stat.color}-500 relative group`}>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AIAssistButton prompt={`Show details for the ${stat.label}.`} size={14} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.val}</p>
                <p className="text-xs text-slate-500 uppercase font-bold">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
           <div className="flex gap-6 min-w-[1000px]">
              {columns.map(col => (
                 <div key={col} className="flex-1 min-w-[250px]">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{col}</h3>
                       {col === 'In Progress' && <AIAssistButton prompt="Identify bottlenecks in the 'In Progress' column." size={14} />}
                       <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {WORK_ORDERS.filter(w => w.status === col).length}
                       </span>
                    </div>
                    <div className="bg-slate-100/50 rounded-xl p-3 min-h-[500px] space-y-3">
                       {WORK_ORDERS.filter(w => w.status === col).map(card => (
                          <div key={card.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all relative group">
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                                   ${card.priority === 'High' ? 'bg-red-100 text-red-700' : 
                                     card.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                   {card.priority}
                                </span>
                                <span className="text-xs text-slate-400 group-hover:hidden">{card.id}</span>
                                <div className="hidden group-hover:block">
                                    <AIAssistButton prompt={`What is the status of work order ${card.id}?`} size={12} />
                                </div>
                             </div>
                             <h4 className="font-bold text-slate-800 text-sm mb-1">{card.title}</h4>
                             <p className="text-xs text-slate-500 mb-3">{card.property}</p>
                             <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">JD</div>
                                <span className="text-[10px] text-slate-400">{card.category}</span>
                             </div>
                          </div>
                       ))}
                       {col === 'Submitted' && (
                          <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-slate-400 hover:text-slate-500 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                             <Plus size={16} /> New Work Order
                          </button>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Pending Approvals Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
           <div className="flex items-center gap-2 mb-4">
               <h3 className="font-bold text-slate-800">Pending High-Cost Approvals</h3>
               <AIAssistButton prompt="Review pending high-cost approvals. Should we approve the roof leak?" />
           </div>
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h4 className="font-bold text-slate-800">Harbor Plaza - Roof Leak Repair</h4>
                 <p className="text-sm text-slate-600 mt-1">Estimated Cost: <span className="font-bold">$2,400</span> • Contractor: ABC Roofing</p>
              </div>
              <div className="flex gap-3">
                 <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">Approve</button>
                 <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Reject</button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Maintenance;