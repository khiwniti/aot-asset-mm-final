import { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, ThumbsUp, ThumbsDown, 
  CheckCircle, XCircle, AlertTriangle, MapPin, ArrowUpRight, Sparkles, Mic, MicOff, Activity,
  FileText, Download
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { UIPayload, ReportData } from '../types';

interface ChatInterfaceProps {
  isFullPage?: boolean;
  theme?: 'light' | 'dark';
}

const ChatInterface = ({ isFullPage = false, theme = 'light' }: ChatInterfaceProps) => {
  const { 
    messages, sendMessage, isLoading, handleApproval, setActiveVisual, openChatWithPrompt,
    voiceStatus, toggleVoiceMode, voiceError
  } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect: When a new AI message arrives with a UI payload, update the global visualizer
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'ai' && lastMsg.uiPayload) {
       const { type, data } = lastMsg.uiPayload;
       
       // If it's a Chart or Map, push to the main visualizer
       if (type === 'chart' || type === 'map' || type === 'kanban') {
          setActiveVisual({
             type: type,
             title: data.title || 'Analysis',
             data: data
          });
       }
    }
  }, [messages, setActiveVisual]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInput('');
  };

  // --- Quick Actions Grid (Dark Mode Only) ---
  const QuickActions = () => (
    <div className="grid grid-cols-2 gap-3 mt-6 animate-in fade-in slide-in-from-bottom-4">
      <button 
        onClick={() => openChatWithPrompt("Generate a monthly performance report.")}
        className="bg-[#1e293b] hover:bg-[#334155] p-4 rounded-xl border border-slate-700 text-left group transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-blue-400 font-bold text-xs">Generate Monthly Report</span>
          <FileText size={16} className="text-blue-400 opacity-50 group-hover:opacity-100" />
        </div>
        <div className="h-1 w-8 bg-blue-500/30 rounded-full"></div>
      </button>

      <button 
        onClick={() => openChatWithPrompt("Identify at-risk accounts that need attention.")}
        className="bg-[#1e293b] hover:bg-[#334155] p-4 rounded-xl border border-slate-700 text-left group transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-amber-400 font-bold text-xs">Identify at-risk accounts</span>
          <AlertTriangle size={16} className="text-amber-400 opacity-50 group-hover:opacity-100" />
        </div>
        <div className="h-1 w-8 bg-amber-500/30 rounded-full"></div>
      </button>

      <button 
        onClick={() => openChatWithPrompt("Suggest growth plays for current tenants.")}
        className="bg-[#1e293b] hover:bg-[#334155] p-4 rounded-xl border border-slate-700 text-left group transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-purple-400 font-bold text-xs">Surface growth plays</span>
          <ArrowUpRight size={16} className="text-purple-400 opacity-50 group-hover:opacity-100" />
        </div>
        <div className="h-1 w-8 bg-purple-500/30 rounded-full"></div>
      </button>

      <button 
        onClick={() => openChatWithPrompt("Forecast revenue for the next quarter.")}
        className="bg-[#1e293b] hover:bg-[#334155] p-4 rounded-xl border border-slate-700 text-left group transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-cyan-400 font-bold text-xs">Forecast next quarter</span>
          <ArrowUpRight size={16} className="text-cyan-400 opacity-50 group-hover:opacity-100" />
        </div>
        <div className="h-1 w-8 bg-cyan-500/30 rounded-full"></div>
      </button>
    </div>
  );

  // --- Inline Generative UI Components ---
  
  const GenUIApproval = ({ payload, msgId }: { payload: UIPayload, msgId: string }) => {
    const { data, status } = payload;
    const isPending = status === 'pending' || !status;

    return (
      <div className={`${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-3 mt-2 shadow-sm w-full`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={12} />
            </div>
            <div className="min-w-0">
              <h4 className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.title}</h4>
              <p className="text-[10px] text-slate-500 truncate">{data.property}</p>
            </div>
          </div>
          <div className="text-right whitespace-nowrap ml-2">
            <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-800'}`}>${data.cost}</div>
          </div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'} p-2 rounded text-[10px] mb-2 italic line-clamp-2`}>
          "{data.justification}"
        </div>

        {isPending ? (
          <div className="flex gap-2">
            <button 
              onClick={() => handleApproval(msgId, 'approved')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-md text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button 
              onClick={() => handleApproval(msgId, 'rejected')}
              className={`flex-1 border hover:bg-opacity-10 py-1.5 rounded-md text-[10px] font-bold transition-colors flex items-center justify-center gap-1
                ${isDark ? 'bg-transparent border-slate-600 text-slate-300 hover:bg-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        ) : (
          <div className={`text-center py-1.5 rounded-md text-[10px] font-bold border flex items-center justify-center gap-1
            ${status === 'approved' 
              ? (isDark ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-100') 
              : (isDark ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-700 border-red-100')
            }`}>
            {status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {status === 'approved' ? 'Approved' : 'Rejected'}
          </div>
        )}
      </div>
    );
  };

  const GenUIAlerts = ({ data }: { data: any[] }) => (
    <div className={`${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'} rounded-xl border mt-2 shadow-sm w-full overflow-hidden`}>
      {data.map((alert: any, i: number) => (
        <div key={i} className={`p-2.5 border-b last:border-0 flex items-start gap-2 ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}>
          <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${alert.severity === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
          <div className="min-w-0">
            <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{alert.title}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={8} /> {alert.location}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const GenUIReport = ({ data }: { data: ReportData }) => (
     <div className={`${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-4 mt-2 shadow-sm w-full`}>
        <div className="flex items-start gap-3 mb-3">
           <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={16} />
           </div>
           <div>
              <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.title}</h4>
              <p className="text-xs text-slate-500">{data.type} Report • {data.period}</p>
           </div>
        </div>
        
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-3 leading-relaxed`}>
           {data.summary}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
           {data.keyMetrics.map((metric, i) => (
              <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                 <div className="text-[10px] text-slate-500 truncate">{metric.label}</div>
                 <div className={`font-bold text-sm ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 
                    isDark ? 'text-slate-200' : 'text-slate-800'
                 }`}>
                    {metric.value}
                 </div>
              </div>
           ))}
        </div>

        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
           <Download size={14} /> Download PDF
        </button>
     </div>
  );

  // --- Voice Mode Overlay ---
  if (voiceStatus !== 'disconnected') {
    return (
       <div className="h-full flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in duration-300">
          {/* Background Pulse Animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className={`w-64 h-64 rounded-full border-[20px] opacity-20 animate-ping ${isDark ? 'border-blue-500' : 'border-blue-200'}`} style={{animationDuration: '3s'}}></div>
             <div className={`w-48 h-48 rounded-full border-[15px] opacity-30 animate-ping absolute ${isDark ? 'border-blue-400' : 'border-blue-300'}`} style={{animationDuration: '2s'}}></div>
          </div>

          <div className="z-10 flex flex-col items-center text-center p-8">
             {voiceStatus === 'connecting' ? (
                <div className="mb-8 relative">
                   <div className={`w-24 h-24 rounded-full animate-spin border-t-4 border-b-4 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
                </div>
             ) : (
                <div className={`mb-8 relative flex items-center justify-center w-32 h-32 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.5)] 
                   ${isDark ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                   <Activity size={48} className="text-white animate-pulse" />
                </div>
             )}

             <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {voiceStatus === 'connecting' ? 'Connecting to Gemini...' : 'Listening...'}
             </h2>
             <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Speak naturally. I'm listening.
             </p>
             
             {voiceError && (
                <div className="mt-4 px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                   <AlertTriangle size={16} /> {voiceError}
                </div>
             )}
          </div>

          <div className="absolute bottom-12 left-0 right-0 flex justify-center">
             <button 
               onClick={toggleVoiceMode}
               className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center gap-2 px-6"
             >
                <MicOff size={24} />
                <span className="font-bold">End Voice Session</span>
             </button>
          </div>
       </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 1 && isDark && <QuickActions />}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
              ${msg.role === 'ai' 
                ? (isDark ? 'bg-[#1e293b] border border-slate-700 text-blue-400' : 'bg-white border border-slate-200 text-blue-600 shadow-sm') 
                : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')
              }`}>
              {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
                ${msg.role === 'ai' 
                  ? (isDark ? 'bg-[#1e293b] border border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700')
                  : 'bg-blue-600 text-white'
                }`}>
                {msg.content}
              </div>

              {/* Generative UI Rendering */}
              {msg.role === 'ai' && msg.uiPayload && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Link to view chart if it pushed to left pane */}
              {msg.uiPayload.type === 'chart' && (
                 <button
                   onClick={() => setActiveVisual({ type: 'chart', title: msg.uiPayload?.data.title, data: msg.uiPayload?.data })}
                   className="mt-1 text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                 >
                   View Visualization ↗
                 </button>
              )}
              {msg.uiPayload.type === 'entity_manager' && (
                 <button
                   onClick={() => setActiveVisual({ type: 'entity_manager', title: `${msg.uiPayload?.data.entityType} Management`, data: msg.uiPayload?.data })}
                   className="mt-1 text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                 >
                   View {msg.uiPayload?.data.entityType} Manager ↗
                 </button>
              )}
              {msg.uiPayload.type === 'approval' && <GenUIApproval payload={msg.uiPayload} msgId={msg.id} />}
              {msg.uiPayload.type === 'alert_list' && <GenUIAlerts data={msg.uiPayload.data} />}
              {msg.uiPayload.type === 'report' && <GenUIReport data={msg.uiPayload.data} />}
                 </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
             <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shadow-sm
                ${isDark ? 'bg-[#1e293b] border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-600'}`}>
                <Bot size={16} />
             </div>
             <div className={`border rounded-2xl px-3 py-3 shadow-sm
                ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
               <div className="flex gap-1 h-3 items-center">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t shrink-0 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
         <div className="relative flex gap-2">
            {/* Voice Mode Toggle */}
            <button 
               onClick={toggleVoiceMode}
               className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0
                  ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 text-blue-600'}`}
               title="Start Voice Session"
            >
               <Mic size={18} />
            </button>

            <div className="relative flex-1">
                {isDark && <Sparkles size={14} className="absolute left-4 top-3.5 text-slate-500" />}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder={isDark ? "Ask anything about your client expansion pipeline..." : "Ask AI to analyze..."}
                  className={`w-full rounded-full pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                    ${isDark 
                      ? 'bg-[#1e293b] border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/40 focus:border-blue-500' 
                      : 'bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 top-2 p-1.5 rounded-full transition-colors flex items-center justify-center
                    ${input.trim() 
                      ? 'bg-blue-500 text-white hover:bg-blue-400' 
                      : (isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')
                    }`}
                >
                  <ArrowUpRight size={16} />
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;