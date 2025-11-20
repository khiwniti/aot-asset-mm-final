
import { useState } from 'react';
import Header from '../components/Header';
import { Users, Layout, ShieldCheck, Database } from 'lucide-react';
import DataImporter from '../components/DataImporter';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('data-platform');

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="System Settings" subtitle="Configure application preferences and data integrations." />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-8 shadow-sm max-w-fit">
           <button 
              onClick={() => setActiveTab('general')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 ${activeTab === 'general' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
           >
              <Layout size={16} /> General
           </button>
           <button 
              onClick={() => setActiveTab('data-platform')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 ${activeTab === 'data-platform' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
           >
              <Database size={16} /> Data Platform
           </button>
           <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 ${activeTab === 'users' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
           >
              <Users size={16} /> Users & Roles
           </button>
           <button 
              onClick={() => setActiveTab('security')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 ${activeTab === 'security' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
           >
              <ShieldCheck size={16} /> Security
           </button>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
           {activeTab === 'data-platform' ? <DataImporter /> : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Layout size={32} className="opacity-50" />
                 </div>
                 <p className="font-medium">This settings module is currently under development.</p>
              </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
