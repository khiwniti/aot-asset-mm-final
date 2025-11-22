export interface SwiftConfig {
  apiUrl: string;
}

export interface SwiftMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class SwiftVoiceService {
  private config: SwiftConfig;
  private messageHistory: SwiftMessage[] = [];
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;

  constructor(config: SwiftConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: 24000 });

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to access microphone: ${error}`);
    }
  }

  startRecording(): void {
    if (!this.stream) {
      throw new Error('Voice service not initialized. Call initialize() first.');
    }

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        try {
          const wavBlob = await this.convertToWav(audioBlob);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  private async convertToWav(webmBlob: Blob): Promise<Blob> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const wav = this.encodeWAV(audioBuffer);
    return new Blob([wav], { type: 'audio/wav' });
  }

  private encodeWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const channelData = audioBuffer.getChannelData(0);
    const samples = new Int16Array(channelData.length);

    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    const dataLength = samples.length * 2;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    const offset = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset + i * 2, samples[i], true);
    }

    return buffer;
  }

  async sendVoiceMessage(audioBlob: Blob): Promise<{ transcript: string; response: string; audioResponse: Blob }> {
    const formData = new FormData();
    formData.append('input', audioBlob, 'audio.wav');

    if (this.messageHistory.length > 0) {
      formData.append('message', JSON.stringify(this.messageHistory));
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Swift API error: ${response.status}`);
      }

      const transcript = decodeURIComponent(response.headers.get('X-Transcript') || '');
      const textResponse = decodeURIComponent(response.headers.get('X-Response') || '');

      this.messageHistory.push({ role: 'user', content: transcript });
      this.messageHistory.push({ role: 'assistant', content: textResponse });

      const audioResponse = await response.blob();

      return {
        transcript,
        response: textResponse,
        audioResponse
      };
    } catch (error) {
      throw new Error(`Failed to communicate with Swift API: ${error}`);
    }
  }

  async playAudioResponse(audioBlob: Blob): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start(0);
    });
  }

  async sendTextMessage(text: string): Promise<{ response: string; audioResponse: Blob }> {
    const formData = new FormData();
    formData.append('input', text);

    if (this.messageHistory.length > 0) {
      formData.append('message', JSON.stringify(this.messageHistory));
    }

    this.messageHistory.push({ role: 'user', content: text });

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Swift API error: ${response.status}`);
      }

      const textResponse = decodeURIComponent(response.headers.get('X-Response') || '');

      this.messageHistory.push({ role: 'assistant', content: textResponse });

      const audioResponse = await response.blob();

      return {
        response: textResponse,
        audioResponse
      };
    } catch (error) {
      throw new Error(`Failed to communicate with Swift API: ${error}`);
    }
  }

  getMessageHistory(): SwiftMessage[] {
    return [...this.messageHistory];
  }

  clearHistory(): void {
    this.messageHistory = [];
  }

  disconnect(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isRecording = false;
    this.audioChunks = [];
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const createSwiftService = (apiUrl: string): SwiftVoiceService => {
  return new SwiftVoiceService({ apiUrl });
};
