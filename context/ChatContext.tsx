import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Message, ActiveVisual, InsightData, VisualContext, VoiceStatus, ReportData } from '../types';
import { generateAIResponse, generateInsight, APP_TOOLS } from '../services/githubModelsService';
import { createPCM16Blob, decode, decodeAudioData } from '../services/audioUtils';
import { VoiceService } from '../services/voiceService';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // --- State Persistence (Agent Constitution: Cross-Tab State Persistence) ---
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      role: 'ai',
      content: 'Hello! I am your AOT Assistant. How can I help you today?',
      timestamp: new Date()
    }];
  });

  // Generated Reports State
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

  // --- Voice API State ---
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('disconnected');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const voiceServiceRef = useRef<VoiceService | null>(null);

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

      // Handle Generative UI Actions
      if (response.uiPayload) {
        const { type, data } = response.uiPayload;

        if (type === 'navigate' && data?.path) {
          navigate(data.path);
        } else if (type === 'chart' || type === 'map') {
          // Auto-expand visualizer
          setActiveVisual({
            type: type,
            title: data.title || 'Analysis',
            data: data
          });
        } else if (type === 'report') {
           // Add to shared state
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

  // --- Voice Logic (GitHub Models + Web Speech API) ---

  const stopVoiceSession = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
    }
    setVoiceStatus('disconnected');
  };

  const toggleVoiceMode = async () => {
    if (voiceStatus === 'connected' || voiceStatus === 'connecting') {
        stopVoiceSession();
        return;
    }

    setVoiceStatus('connecting');
    setVoiceError(null);

    try {
        // Initialize voice service
        if (!voiceServiceRef.current) {
            voiceServiceRef.current = new VoiceService();
        }

        if (!voiceServiceRef.current.isSupported()) {
            throw new Error('Speech recognition is not supported in this browser');
        }

        // Start listening with callbacks
        voiceServiceRef.current.startListening({
            onStart: () => {
                setVoiceStatus('connected');
                // Welcome message
                setTimeout(() => {
                    voiceServiceRef.current?.speak("Hello AOT, how can I help you?");
                }, 500);
            },
            onTranscript: async (transcript) => {
                console.log('Voice transcript:', transcript);
                
                // Process the transcript with GitHub Models
                try {
                    const response = await generateAIResponse(transcript, messages, { path: location.pathname });
                    
                    // Add user message to chat
                    const userMsg: Message = {
                        id: Date.now().toString(),
                        role: 'user',
                        content: transcript,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, userMsg]);

                    // Add AI response to chat
                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'ai',
                        content: response.text,
                        uiPayload: response.uiPayload,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMsg]);

                    // Handle UI actions
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

                    // Speak the response
                    await voiceServiceRef.current?.speak(response.text);
                } catch (error) {
                    console.error('Error processing voice input:', error);
                    await voiceServiceRef.current?.speak("I'm sorry, I encountered an error processing your request.");
                }
            },
            onResponse: (text) => {
                console.log('Voice response:', text);
            },
            onError: (error) => {
                console.error('Voice error:', error);
                setVoiceError(error);
                setVoiceStatus('disconnected');
            },
            onEnd: () => {
                setVoiceStatus('disconnected');
            }
        });

    } catch (error: any) {
        console.error("Failed to start voice session", error);
        setVoiceError(error.message || "Could not connect");
        setVoiceStatus('disconnected');
    }
  };

  useEffect(() => {
    return () => {
        stopVoiceSession();
        if (voiceServiceRef.current) {
            voiceServiceRef.current.stopListening();
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