import type { SpeechRecognition, SpeechRecognitionErrorEvent, SpeechRecognitionEvent } from '../types';

// Voice service using Web Speech API and GitHub Models
// This provides a fallback voice experience since GitHub Models doesn't have real-time audio API

interface VoiceCallbacks {
  onTranscript: (text: string) => void;
  onResponse: (text: string) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: speechSynthesis;
  private isListening: boolean = false;
  private callbacks: VoiceCallbacks | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks?.onStart();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks?.onEnd();
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        this.callbacks?.onError(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.callbacks?.onTranscript(finalTranscript.trim());
        }
      };
    }
  }

  public startListening(callbacks: VoiceCallbacks) {
    if (!this.recognition) {
      callbacks.onError('Speech recognition is not supported in this browser');
      return;
    }

    this.callbacks = callbacks;
    this.recognition.start();
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  public isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }
}