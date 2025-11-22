export type VoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VoiceMessage {
  text: string;
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private onTranscriptCallback: ((message: VoiceMessage) => void) | null = null;
  private onStatusCallback: ((status: VoiceStatus) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;

    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusCallback?.('connected');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.onTranscriptCallback?.({
          text: finalTranscript,
          isFinal: true
        });
      } else if (interimTranscript) {
        this.onTranscriptCallback?.({
          text: interimTranscript,
          isFinal: false
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      let errorMessage = 'Voice recognition error';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }

      this.onErrorCallback?.(errorMessage);
      this.onStatusCallback?.('error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStatusCallback) {
        this.onStatusCallback('disconnected');
      }
    };
  }

  public start(
    onTranscript: (message: VoiceMessage) => void,
    onStatus: (status: VoiceStatus) => void,
    onError: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      onStatus('error');
      return false;
    }

    this.onTranscriptCallback = onTranscript;
    this.onStatusCallback = onStatus;
    this.onErrorCallback = onError;

    try {
      onStatus('connecting');
      this.recognition.start();
      return true;
    } catch (error: any) {
      const message = error.message || 'Failed to start voice recognition';
      onError(message);
      onStatus('error');
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    this.onStatusCallback?.('disconnected');
  }

  public speak(text: string, onComplete?: () => void) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onComplete) {
      utterance.onend = onComplete;
    }

    this.synthesis.speak(utterance);
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const voiceService = new VoiceService();
