
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Users, Layout, ShieldCheck, Database, Network, Plus, Trash2, CheckCircle, Server } from 'lucide-react';
import DataImporter from '../components/DataImporter';
import { mcpService } from '../services/mcpService';
import { MCPServer } from '../types';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('data-platform');
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [newServerUrl, setNewServerUrl] = useState('');

  useEffect(() => {
    setMcpServers(mcpService.getServers());
  }, []);

  const handleAddServer = () => {
    if(!newServerUrl) return;
    mcpService.addServer(`Custom Server ${mcpServers.length + 1}`, newServerUrl);
    setMcpServers(mcpService.getServers());
    setNewServerUrl('');
  };

  const handleRemoveServer = (id: string) => {
    mcpService.removeServer(id);
    setMcpServers(mcpService.getServers());
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="System Settings" subtitle="Configure application preferences and data integrations." />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-8 shadow-sm max-w-fit">
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
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                 ${activeTab === 'integrations' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
           >
              <Network size={16} /> Integrations (MCP)
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
           {activeTab === 'data-platform' && <DataImporter />}
           
           {activeTab === 'integrations' && (
              <div className="animate-in fade-in">
                 <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                          <Network size={20} />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-slate-800">Model Context Protocol (MCP) Servers</h3>
                          <p className="text-sm text-slate-500">Connect your agent to external tools and data sources.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {/* Connected Servers List */}
                       <div className="space-y-4">
                          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Active Connections</h4>
                          {mcpServers.map(server => (
                             <div key={server.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 group">
                                <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                   <div>
                                      <p className="font-bold text-slate-800 text-sm">{server.name}</p>
                                      <p className="text-xs text-slate-400 font-mono">{server.url}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase">
                                      {server.capabilities.join(', ')}
                                   </span>
                                   <button onClick={() => handleRemoveServer(server.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>

                       {/* Add New Server */}
                       <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed">
                          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Connect New Server</h4>
                          <div className="space-y-3">
                             <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Server URL (SSE Endpoint)</label>
                                <div className="flex gap-2">
                                   <input 
                                      type="text" 
                                      value={newServerUrl}
                                      onChange={(e) => setNewServerUrl(e.target.value)}
                                      placeholder="http://localhost:8000/sse" 
                                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                   />
                                   <button 
                                      onClick={handleAddServer}
                                      disabled={!newServerUrl}
                                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
                                   >
                                      <Plus size={16} /> Connect
                                   </button>
                                </div>
                             </div>
                             <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                                <Server className="text-blue-500 mt-0.5" size={16} />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                   For this demo, the system is pre-connected to a "Market Intel" simulation server. 
                                   Try asking the agent: 
                                   <br/><span className="font-bold italic">"Check competitor rates in Bang Na district"</span>
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {(activeTab === 'general' || activeTab === 'users' || activeTab === 'security') && (
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
