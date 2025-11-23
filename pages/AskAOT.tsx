import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';
import { useChat } from '../context/ChatContext';
import { ChartVisual, MapVisual } from '../components/Visuals';
import { BarChart3, Sparkles, Globe, MessageSquare, LayoutDashboard, X } from 'lucide-react';

const AskAOT = () => {
  const { activeVisual, setActiveVisual } = useChat();

  // Helper to render the visual content in the right pane
  const renderVisualContent = () => {
    // If no active visual, don't render anything (handled by parent conditional)
    if (activeVisual.type === 'default') return null;

    return (
      <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-500">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                activeVisual.type === 'map' 
                    ? 'bg-purple-50 text-purple-600 border-purple-100' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                {activeVisual.type === 'map' ? <Globe size={20} /> : <BarChart3 size={20} />}
                </div>
                <div>
                <h3 className="text-lg font-bold text-slate-800">{activeVisual.title}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Context</p>
                </div>
            </div>
            <button 
                onClick={() => setActiveVisual({ type: 'default', title: '', data: null })}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                title="Close Visualizer"
            >
                <X size={20} />
            </button>
         </div>
         <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
            {activeVisual.type === 'chart' && <ChartVisual data={activeVisual.data} theme="light" />}
            {activeVisual.type === 'map' && <MapVisual data={activeVisual.data} theme="light" />}
            {activeVisual.type === 'kanban' && (
               <div className="flex items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <LayoutDashboard size={32} className="mr-2 opacity-50" />
                  <span>Kanban Visualization Placeholder</span>
               </div>
            )}
         </div>
      </div>
    );
  };

  const isVisualActive = activeVisual.type !== 'default';

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fc]">
      <Header 
        title="AOT Intelligence Hub" 
        subtitle="Advanced AI workspace with real-time data visualization." 
      />
      <main className="flex-1 overflow-hidden w-full p-6 pt-2">
        <div className="w-full h-full overflow-hidden relative flex gap-6 justify-center">
          
          {/* LEFT PANE: Chat Interface - Centered if no visual, Left aligned if visual active */}
          <div 
            className={`
                flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-500 ease-in-out
                ${isVisualActive ? 'w-[400px] xl:w-[450px]' : 'w-full max-w-3xl'}
            `}
          >
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                   <Sparkles size={16} />
                </div>
                <div>
                   <span className="text-sm font-bold text-slate-800 block">Assistant Stream</span>
                   <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                   </span>
                </div>
             </div>
             <div className="flex-1 overflow-hidden bg-white">
                <ChatInterface isFullPage={true} theme="light" />
             </div>
          </div>

          {/* RIGHT PANE: Context Visualizer - Only appears when active */}
          {isVisualActive && (
              <div className="flex-1 h-full bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-inner relative overflow-hidden animate-in slide-in-from-right-10 duration-500 fade-in">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>
                {renderVisualContent()}
              </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AskAOT;