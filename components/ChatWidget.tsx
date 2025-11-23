import { useState, useEffect } from 'react';
import { X, Sparkles, Globe, Map as MapIcon, Maximize2, Minimize2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useLocation } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import { ChartVisual, MapVisual } from './Visuals';

const ChatWidget = () => {
  const { isOpen, toggleChat, activeVisual } = useChat();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when visual context updates to something interesting (non-default)
  useEffect(() => {
    if (activeVisual.type !== 'default' && isOpen) {
       setIsExpanded(true);
    }
  }, [activeVisual, isOpen]);

  if (location.pathname === '/ask-aot') {
    return null;
  }

  const DefaultVisual = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
       <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
          <div className="w-24 h-24 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-md flex items-center justify-center shadow-2xl">
             <Globe size={48} className="text-blue-400" />
          </div>
       </div>
       <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">AOT Intelligence</h2>
       <p className="text-slate-400 max-w-md text-lg leading-relaxed">
         Ready to analyze your portfolio. Ask about revenue trends, occupancy rates, or maintenance issues.
       </p>
       <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
             <div className="text-2xl font-bold text-white">102M</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Asset Value</div>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
             <div className="text-2xl font-bold text-green-400">76%</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Occupancy</div>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
             <div className="text-2xl font-bold text-blue-400">5.2%</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Yield</div>
          </div>
       </div>
    </div>
  );

  const ChartVisualWrapper = ({ data }: { data: any }) => (
    <div className="h-full flex flex-col p-8">
       <div className="flex justify-between items-end mb-8">
          <div>
             <h3 className="text-3xl font-bold text-white tracking-tight">{data.title}</h3>
             <p className="text-slate-400 mt-2 font-medium">Live Data Visualization</p>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span> Live Stream
             </span>
          </div>
       </div>
       <div className="flex-1 w-full bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-md shadow-2xl">
          <ChartVisual data={data} theme="dark" />
       </div>
    </div>
  );

  const MapVisualWrapper = ({ data }: { data: any }) => (
     <div className="h-full flex flex-col p-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full p-8 z-10 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none">
           <h3 className="text-3xl font-bold text-white tracking-tight">Geospatial Analysis</h3>
           <p className="text-slate-400 mt-1 font-medium">District: {data.district || 'Bangkok Metropolitan'}</p>
        </div>
        <div className="flex-1 relative z-0 flex items-center justify-center bg-slate-900">
            <MapVisual data={data} theme="dark" />
        </div>
     </div>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.4)] transition-all duration-500 group flex items-center justify-center border border-white/10 backdrop-blur-sm
          ${isOpen ? 'bg-slate-900 text-white rotate-90 scale-90' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-110'}
        `}
        title="Ask AOT AI Assistant"
      >
        {isOpen ? <X size={28} /> : <Sparkles size={28} />}
        {!isOpen && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-4 border-[#f8fafc] animate-bounce"></span>}
      </button>

      {/* Drawer Container */}
      <div 
         className={`fixed inset-0 z-40 overflow-hidden pointer-events-none transition-all duration-500 ease-in-out
         ${isOpen ? 'visible' : 'invisible delay-300'}`}
      >
         {/* Backdrop */}
         <div 
            className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[4px] transition-opacity duration-500 pointer-events-auto
            ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={toggleChat}
         />

         {/* Sliding Panel */}
         <div 
            className={`absolute top-0 right-0 bottom-0 flex pointer-events-auto transform transition-all duration-500 cubic-bezier(0.2, 0, 0, 1)
               ${isOpen ? 'translate-x-0' : 'translate-x-[110%]'}
               ${isExpanded ? 'w-[95vw] max-w-[1800px]' : 'w-[450px]'}
            `}
         >
            {/* LEFT PANE (Visualizer) - Collapsible */}
            <div className={`bg-[#020617] flex flex-col border-r border-slate-800 overflow-hidden transition-all duration-500 relative shadow-2xl
               ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}
            `}>
               {/* Background Pattern */}
               <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
               </div>
               
               {/* Visualizer Content */}
               <div className="flex-1 relative z-10 h-full overflow-hidden">
                  {activeVisual.type === 'default' && <DefaultVisual />}
                  {activeVisual.type === 'chart' && <ChartVisualWrapper data={activeVisual.data} />}
                  {activeVisual.type === 'map' && <MapVisualWrapper data={activeVisual.data} />}
                  {activeVisual.type === 'kanban' && <div className="p-8 text-white text-center">Kanban Visualization Placeholder</div>}
               </div>

               {/* Collapse Visualizer Button */}
               <button 
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-6 right-6 p-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors z-20 border border-slate-700 backdrop-blur-md"
                  title="Collapse View"
               >
                  <Minimize2 size={20} />
               </button>
            </div>

            {/* RIGHT PANE (Chat) - Fixed Width */}
            <div className="w-[450px] shrink-0 flex flex-col h-full bg-white/95 backdrop-blur-xl relative z-20 shadow-[-10px_0_40px_rgba(0,0,0,0.1)]">
               {/* Expand Visualizer Button (Only if collapsed) */}
               {!isExpanded && (
                   <button 
                      onClick={() => setIsExpanded(true)}
                      className="absolute top-4 left-4 p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl z-10 transition-colors"
                      title="Expand Visualizer"
                   >
                      <Maximize2 size={20} />
                   </button>
               )}

               {/* Header */}
               <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className={`flex items-center gap-4 ${!isExpanded ? 'ml-10' : ''}`}>
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Sparkles size={20} />
                     </div>
                     <div>
                        <h2 className="font-bold text-slate-900 text-base">AOT Assistant</h2>
                        <div className="flex items-center gap-1.5">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                           </span>
                           <span className="text-xs text-slate-500 font-medium">Connected</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={toggleChat} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={20} />
                  </button>
               </div>

               {/* Chat Interface */}
               <div className="flex-1 overflow-hidden bg-slate-50/30">
                  <ChatInterface />
               </div>
            </div>

         </div>
      </div>
    </>
  );
};

export default ChatWidget;