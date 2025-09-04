export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUri?: string;
  isTranscribing?: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
}

export interface ChatGPTResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export interface ConversationDisplayProps {
  messages: Message[];
  isLoading?: boolean;
  onPlayAudio?: (uri: string) => void;
}

export type InputMode = 'text' | 'voice';

export interface TextInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface InputModeSwitcherProps {
  currentMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  disabled?: boolean;
}