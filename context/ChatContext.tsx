import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Message, ActiveVisual, InsightData, VisualContext, VoiceStatus, ReportData } from '../types';
import { generateAIResponse, generateInsight, APP_TOOLS } from '../services/geminiService';
import { GoogleGenAI } from '@google/genai';
import { createPCM16Blob, decode, decodeAudioData } from '../services/audioUtils';
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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentSessionRef = useRef<any>(null);

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

  // --- Voice Logic (Live API) ---

  const stopVoiceSession = () => {
    // Cleanup Input
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }

    // Cleanup Output
    audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    // Close Session
    if (currentSessionRef.current) {
        currentSessionRef.current = null;
    }

    setVoiceStatus('disconnected');
    nextStartTimeRef.current = 0;
  };

  const toggleVoiceMode = async () => {
    if (voiceStatus === 'connected' || voiceStatus === 'connecting') {
        stopVoiceSession();
        return;
    }

    setVoiceStatus('connecting');
    setVoiceError(null);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is missing");

        // 1. Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        
        inputAudioContextRef.current = inputCtx;
        audioContextRef.current = outputCtx;

        // 2. Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // 3. Connect to Gemini Live
        const client = new GoogleGenAI({ apiKey });
        const sessionPromise = client.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: ['AUDIO'], 
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: 'You are AOT Assistant. You are helpful and concise.',
                tools: APP_TOOLS,
            },
            callbacks: {
                onopen: () => {
                    setVoiceStatus('connected');
                    
                    // Start Streaming Input
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createPCM16Blob(inputData);
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                    
                    sourceRef.current = source;
                    processorRef.current = processor;

                    // Trigger Welcome Message
                    sessionPromise.then(session => {
                        session.send({ parts: [{ text: "Say exactly 'Hello AOT, how can I help you?'" }], turnComplete: true });
                    });
                },
                onmessage: async (msg: any) => {
                    // Handle Audio Output
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        const ctx = audioContextRef.current;
                        if (!ctx) return;

                        // Resume audio context if it was suspended (browsers do this)
                        if (ctx.state === 'suspended') {
                            await ctx.resume();
                        }

                        nextStartTimeRef.current = Math.max(
                            nextStartTimeRef.current,
                            ctx.currentTime
                        );

                        const audioBuffer = await decodeAudioData(
                            decode(audioData),
                            ctx,
                            24000
                        );

                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        
                        source.onended = () => {
                            audioSourcesRef.current.delete(source);
                        };

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                    
                    // Handle Tool Calls
                    if (msg.toolCall) {
                        // We can handle voice-triggered tool calls here in the future
                        console.log("Voice Tool Call:", msg.toolCall);
                        // For now, we just acknowledge it to the model
                         sessionPromise.then(session => {
                             session.sendToolResponse({
                                 functionResponses: msg.toolCall.functionCalls.map((fc: any) => ({
                                     id: fc.id,
                                     name: fc.name,
                                     response: { result: "Action executed." }
                                 }))
                             });
                         });
                    }

                    // Handle Interruption
                    if (msg.serverContent?.interrupted) {
                        audioSourcesRef.current.forEach(source => {
                            try { source.stop(); } catch(e) {}
                        });
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onclose: () => {
                    setVoiceStatus('disconnected');
                    stopVoiceSession();
                },
                onerror: (e) => {
                    console.error("Voice Error", e);
                    setVoiceError("Connection Error");
                    stopVoiceSession();
                }
            }
        });

        currentSessionRef.current = await sessionPromise;

    } catch (error: any) {
        console.error("Failed to start voice session", error);
        setVoiceError(error.message || "Could not connect");
        stopVoiceSession();
    }
  };

  useEffect(() => {
    return () => {
        stopVoiceSession();
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