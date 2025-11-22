
import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { Message, ActiveVisual, InsightData, VisualContext, VoiceStatus, ReportData } from '../types';
import { generateAIResponse, generateInsight, LIVEKIT_CONFIG, generateLiveKitToken } from '../services/geminiService';
import { useNavigate, useLocation } from 'react-router-dom';
import { Room, RoomEvent, RemoteTrack, RemoteTrackPublication } from 'livekit-client';

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
  toggleVoiceMode: () => Promise<void>;
  voiceError: string | null;

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

  // --- Voice API State (LiveKit) ---
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('disconnected');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

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

  // --- Voice Logic (LiveKit) ---

  const stopVoiceSession = async () => {
    if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
    }
    setVoiceStatus('disconnected');
  };

  const toggleVoiceMode = async () => {
    if (voiceStatus === 'connected' || voiceStatus === 'connecting') {
        await stopVoiceSession();
        return;
    }

    setVoiceStatus('connecting');
    setVoiceError(null);

    try {
        const identity = `user-${Math.floor(Math.random() * 10000)}`;
        const roomName = "aot-voice-room";
        
        // Generate Client Side Token (Demo Only)
        const token = await generateLiveKitToken(roomName, identity);

        const room = new Room();
        roomRef.current = room;

        // Handle Remote Tracks (Audio from Agent)
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant) => {
            if (track.kind === 'audio') {
                track.attach();
            }
        });

        room.on(RoomEvent.Disconnected, () => {
            setVoiceStatus('disconnected');
        });

        await room.connect(LIVEKIT_CONFIG.url, token);
        console.log("Connected to LiveKit Room:", room.name);

        // Publish Microphone
        await room.localParticipant.setMicrophoneEnabled(true);

        setVoiceStatus('connected');

    } catch (error: any) {
        console.error("Failed to start LiveKit session", error);
        
        // Robust error message extraction
        let message = "Unknown connection error";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (typeof error === 'object' && error !== null) {
            // Try to extract useful info if it's an object with reason or message
            message = (error as any).message || (error as any).reason || JSON.stringify(error);
        }

        // Clean up common ugly error strings containing "[object Object]"
        if (message.includes("[object Object]")) {
             message = "Voice service is currently unreachable. Please check connection.";
        }

        setVoiceError(message);
        stopVoiceSession();
    }
  };

  useEffect(() => {
    return () => {
        if (roomRef.current) {
             roomRef.current.disconnect();
        }
    };
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen, toggleChat, messages, sendMessage, openChatWithPrompt, isLoading, handleApproval,
      activeVisual, setActiveVisual, isInsightOpen, closeInsight, triggerInsight, insightData,
      isInsightLoading, insightVisual, voiceStatus, toggleVoiceMode, voiceError,
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
