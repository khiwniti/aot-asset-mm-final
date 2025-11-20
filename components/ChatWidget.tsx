import { useState, useEffect } from 'react';
import { X, Sparkles, Globe, Map as MapIcon, Maximize2, Minimize2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useLocation } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import { 
  ChartVisual, MapVisual, 
  WorkflowStatusManagerVisual, TaskBoardVisual, 
  LeaseManagerVisual, MaintenanceTrackerVisual 
} from './Visuals';

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
       <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 animate-pulse">
          <Globe size={48} className="text-blue-400" />
       </div>
       <h2 className="text-3xl font-bold text-white mb-2">AOT Intelligence</h2>
       <p className="text-slate-400 max-w-md text-lg">
         Ready to analyze your portfolio. Ask about revenue trends, occupancy rates, or maintenance issues.
       </p>
       <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <div className="text-2xl font-bold text-white">102M</div>
             <div className="text-xs text-slate-400 uppercase mt-1">Asset Value</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <div className="text-2xl font-bold text-green-400">76%</div>
             <div className="text-xs text-slate-400 uppercase mt-1">Occupancy</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <div className="text-2xl font-bold text-blue-400">5.2%</div>
             <div className="text-xs text-slate-400 uppercase mt-1">Yield</div>
          </div>
       </div>
    </div>
  );

  const ChartVisualWrapper = ({ data }: { data: any }) => (
    <div className="h-full flex flex-col p-6">
       <div className="flex justify-between items-end mb-6">
          <div>
             <h3 className="text-2xl font-bold text-white">{data.title}</h3>
             <p className="text-slate-400 mt-1">Live Data Visualization</p>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Live
             </span>
          </div>
       </div>
       <div className="flex-1 w-full bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 backdrop-blur-sm">
          <ChartVisual data={data} theme="dark" />
       </div>
    </div>
  );

  const MapVisualWrapper = ({ data }: { data: any }) => (
     <div className="h-full flex flex-col p-6 relative overflow-hidden">
        <div className="z-10 mb-4">
           <h3 className="text-2xl font-bold text-white">Geospatial Analysis</h3>
           <p className="text-slate-400">District: {data.district || 'Bangkok Metropolitan'}</p>
        </div>
        <div className="flex-1 relative z-10 flex items-center justify-center">
            <MapVisual data={data} theme="dark" />
        </div>
     </div>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group flex items-center justify-center
          ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-110'}
        `}
        title="Ask AOT AI Assistant"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {/* Drawer Container (Always rendered for animation, controlled via opacity/translate) */}
      <div 
         className={`fixed inset-0 z-40 overflow-hidden pointer-events-none transition-all duration-500 ease-in-out
         ${isOpen ? 'visible' : 'invisible delay-300'}`}
      >
         {/* Backdrop */}
         <div 
            className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto
            ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={toggleChat}
         />

         {/* Sliding Panel */}
         <div 
            className={`absolute top-0 right-0 bottom-0 bg-white shadow-2xl flex pointer-events-auto transform transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1)
               ${isOpen ? 'translate-x-0' : 'translate-x-full'}
               ${isExpanded ? 'w-[90vw] max-w-[1600px]' : 'w-[400px]'}
            `}
         >
            {/* LEFT PANE (Visualizer) - Collapsible */}
            <div className={`bg-[#0f172a] flex flex-col border-r border-slate-800 overflow-hidden transition-all duration-500 relative
               ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}
            `}>
               {/* Background Pattern */}
               <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
               </div>
               
               {/* Visualizer Content */}
               <div className="flex-1 relative z-10 h-full overflow-hidden">
                  {activeVisual.type === 'default' && <DefaultVisual />}
                                     {activeVisual.type === 'chart' && <ChartVisualWrapper data={activeVisual.data} />}
                                     {activeVisual.type === 'map' && <MapVisualWrapper data={activeVisual.data} />}
                                     {activeVisual.type === 'kanban' && <div className="p-8 text-white text-center">Kanban Visualization Placeholder</div>}
                                     {activeVisual.type === 'workflow_status_manager' && <WorkflowStatusManagerVisual data={activeVisual.data} />}
                                     {activeVisual.type === 'task_board' && <TaskBoardVisual data={activeVisual.data} />}
                                     {activeVisual.type === 'lease_manager' && <LeaseManagerVisual data={activeVisual.data} />}
                                     {activeVisual.type === 'maintenance_tracker' && <MaintenanceTrackerVisual data={activeVisual.data} />}
               </div>

               {/* Collapse Visualizer Button */}
               <button 
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors z-20 border border-slate-700"
                  title="Collapse View"
               >
                  <Minimize2 size={20} />
               </button>
            </div>

            {/* RIGHT PANE (Chat) - Fixed Width */}
            <div className="w-[400px] shrink-0 flex flex-col h-full bg-white relative z-20 shadow-xl">
               {/* Expand Visualizer Button (Only if collapsed) */}
               {!isExpanded && (
                   <button 
                      onClick={() => setIsExpanded(true)}
                      className="absolute top-3 left-3 p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg z-10 transition-colors"
                      title="Expand Visualizer"
                   >
                      <Maximize2 size={20} />
                   </button>
               )}

               {/* Header */}
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                  <div className={`flex items-center gap-3 ${!isExpanded ? 'ml-8' : ''}`}>
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-blue-200 shadow-sm">
                        <Sparkles size={16} />
                     </div>
                     <div>
                        <h2 className="font-bold text-slate-800 text-sm">AOT Assistant</h2>
                        <div className="flex items-center gap-1.5">
                           <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                           </span>
                           <span className="text-[10px] text-slate-500 font-medium">Online</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={toggleChat} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                     <X size={20} />
                  </button>
               </div>

               {/* Chat Interface */}
               <div className="flex-1 overflow-hidden bg-slate-50/50">
                  <ChatInterface />
               </div>
            </div>

         </div>
      </div>
    </>
  );
};

export default ChatWidget;