
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Message, ActiveVisual, InsightData, VisualContext, ReportData } from '../types';
import { generateAIResponse, generateInsight } from '../services/geminiService';
import { useNavigate, useLocation } from 'react-router-dom';
import { voiceService, VoiceStatus } from '../services/voiceService';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  openChatWithPrompt: (prompt: string) => Promise<void>;
  isLoading: boolean;
  handleApproval: (messageId: string, action: 'approved' | 'rejected') => void;
  activeVisual: ActiveVisual;
  setActiveVisual: (visual: ActiveVisual) => void;
  
  // Insight Modal State
  isInsightOpen: boolean;
  closeInsight: () => void;
  triggerInsight: (prompt: string, visualData?: VisualContext) => Promise<void>;
  insightData: InsightData | null;
  isInsightLoading: boolean;
  insightVisual: VisualContext | null;

  // Voice State
  voiceStatus: VoiceStatus;
  toggleVoiceMode: () => void;
  voiceError: string | null;
  interimTranscript: string;

  // Shared Reports State
  generatedReports: ReportData[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children?: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Insight Modal State
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [insightVisual, setInsightVisual] = useState<VisualContext | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  
  // Default visual state
  const [activeVisual, setActiveVisual] = useState<ActiveVisual>({
    type: 'default',
    title: 'Portfolio Overview',
    data: null
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      role: 'ai',
      content: 'Hello! I am your AOT Assistant. How can I help you today?',
      timestamp: new Date()
    }];
  });

  const [generatedReports, setGeneratedReports] = useState<ReportData[]>(() => {
    const saved = localStorage.getItem('generated_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('generated_reports', JSON.stringify(generatedReports));
  }, [generatedReports]);

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('disconnected');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');

  const toggleChat = () => setIsOpen(prev => !prev);

  const sendMessage = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await generateAIResponse(content, messages, { path: location.pathname });
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.text,
        uiPayload: response.uiPayload,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);

      if (voiceStatus === 'connected') {
        voiceService.speak(response.text);
      }

      if (response.uiPayload) {
        const { type, data } = response.uiPayload;
        if (type === 'navigate' && data?.path) {
          navigate(data.path);
        } else if (type === 'chart' || type === 'map') {
          setActiveVisual({
            type: type,
            title: data.title || 'Analysis',
            data: data
          });
        } else if (type === 'report') {
           setGeneratedReports(prev => [data, ...prev]);
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: "I'm sorry, I encountered an error processing your request.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openChatWithPrompt = async (prompt: string) => {
    if (!isOpen) setIsOpen(true);
    setTimeout(() => {
        sendMessage(prompt);
    }, 300);
  };
  
  const triggerInsight = async (prompt: string, visualData?: VisualContext) => {
    setIsInsightOpen(true);
    setInsightData(null);
    setInsightVisual(visualData || null);
    setIsInsightLoading(true);
    try {
       const data = await generateInsight(prompt);
       setInsightData(data);
    } catch (error) {
       setIsInsightOpen(false);
    } finally {
       setIsInsightLoading(false);
    }
  };
  
  const closeInsight = () => setIsInsightOpen(false);

  const handleApproval = (messageId: string, action: 'approved' | 'rejected') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.uiPayload) {
        return { ...msg, uiPayload: { ...msg.uiPayload, status: action } };
      }
      return msg;
    }));
  };

  const toggleVoiceMode = () => {
    if (voiceStatus === 'connected' || voiceStatus === 'connecting') {
      voiceService.stop();
      setVoiceStatus('disconnected');
      setInterimTranscript('');
      return;
    }

    const started = voiceService.start(
      (message) => {
        if (message.isFinal) {
          setInterimTranscript('');
          sendMessage(message.text);
        } else {
          setInterimTranscript(message.text);
        }
      },
      (status) => {
        setVoiceStatus(status);
        if (status === 'disconnected') {
          setInterimTranscript('');
        }
      },
      (error) => {
        setVoiceError(error);
        setVoiceStatus('error');
      }
    );

    if (!started) {
      setVoiceStatus('error');
    }
  };

  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen, toggleChat, messages, sendMessage, openChatWithPrompt, isLoading, handleApproval,
      activeVisual, setActiveVisual, isInsightOpen, closeInsight, triggerInsight, insightData,
      isInsightLoading, insightVisual, voiceStatus, toggleVoiceMode, voiceError, interimTranscript,
      generatedReports
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
