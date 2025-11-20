import { Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { VisualContext } from '../types';

interface AIAssistButtonProps {
  prompt: string;
  tooltip?: string;
  className?: string;
  size?: number;
  mode?: 'modal' | 'chat';
  visualData?: VisualContext;
}

const AIAssistButton = ({ 
  prompt, 
  tooltip = "Ask AI about this", 
  className = "",
  size = 16,
  mode = 'modal', // Defaulting to modal based on requirements
  visualData
}: AIAssistButtonProps) => {
  const { openChatWithPrompt, triggerInsight } = useChat();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (mode === 'modal') {
            triggerInsight(prompt, visualData);
        } else {
            openChatWithPrompt(prompt);
        }
      }}
      className={`group relative inline-flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-1.5 transition-all ${className}`}
      title={tooltip}
    >
      <Sparkles size={size} className="transition-transform group-hover:scale-110" />
      <span className="sr-only">{tooltip}</span>
      
      {/* Optional visual cue that it's AI */}
      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
    </button>
  );
};

export default AIAssistButton;