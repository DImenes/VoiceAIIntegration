import { TranscriptionResult } from '../types/voice-chat';

interface OpenAITranscriptionResponse {
  text: string;
}

export class TranscriptionService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   */
  async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // For React Native, we need to format the file properly
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a', // or 'audio/wav' depending on your recording format
        name: 'recording.m4a'
      } as any;

      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Optional: specify language
      formData.append('response_format', 'json');

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Transcription failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data: OpenAITranscriptionResponse = await response.json();
      
      return {
        text: data.text.trim(),
        confidence: 1.0, // OpenAI doesn't provide confidence scores
      };
    } catch (error) {
      console.error('Transcription error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to transcribe audio: ${error.message}`);
      }
      
      throw new Error('Failed to transcribe audio: Unknown error');
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }

  /**
   * Validate audio file before transcription
   */
  async validateAudioFile(uri: string): Promise<boolean> {
    try {
      // Basic validation - check if file exists and has reasonable size
      const response = await fetch(uri, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      if (contentLength) {
        const fileSizeInMB = parseInt(contentLength) / (1024 * 1024);
        // OpenAI has a 25MB limit for audio files
        return fileSizeInMB <= 25;
      }
      
      return true; // If we can't determine size, assume it's valid
    } catch (error) {
      console.warn('Could not validate audio file:', error);
      return true; // Assume valid if validation fails
    }
  }

  /**
   * Get estimated transcription cost (approximate)
   */
  getEstimatedCost(durationInSeconds: number): number {
    // OpenAI Whisper pricing: $0.006 per minute
    const minutes = Math.ceil(durationInSeconds / 60);
    return minutes * 0.006;
  }
}
