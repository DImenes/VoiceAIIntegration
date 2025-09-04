import { Audio } from 'expo-av';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConversationDisplay from '@/components/ConversationDisplay';
import InputModeSwitcher from '@/components/InputModeSwitcher';
import TextInputComponent from '@/components/TextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import VoiceRecorder from '@/components/VoiceRecorder';
import { API_CONFIG, validateApiConfig } from '@/config/api';
import { ChatGPTService } from '@/services/ChatGPTService';
import { TranscriptionService } from '@/services/TranscriptionService';
import { InputMode, Message } from '@/types/voice-chat';

export default function VoiceChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  
  // Services
  const transcriptionService = useRef(new TranscriptionService(API_CONFIG.OPENAI_API_KEY));
  const chatGPTService = useRef(new ChatGPTService(API_CONFIG.OPENAI_API_KEY, API_CONFIG.OPENAI_MODEL));
  const playbackSound = useRef<Audio.Sound | null>(null);

  // Validate API configuration on mount
  React.useEffect(() => {
    const { isValid, errors } = validateApiConfig();
    if (!isValid) {
      Alert.alert(
        'Configuration Required',
        `Please configure your API keys:\n${errors.join('\n')}\n\nEdit the config/api.ts file with your OpenAI API key.`
      );
    }
  }, []);

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleRecordingComplete = useCallback(async (audioUri: string) => {
    // Create a user message with transcribing state
    const userMessageId = generateMessageId();
    const userMessage: Message = {
      id: userMessageId,
      type: 'user',
      content: '',
      timestamp: new Date(),
      audioUri,
      isTranscribing: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Validate API configuration
      const { isValid, errors } = validateApiConfig();
      if (!isValid) {
        throw new Error(`API configuration error: ${errors.join(', ')}`);
      }

      // Transcribe the audio
      const transcriptionResult = await transcriptionService.current.transcribeAudio(audioUri);
      
      if (!transcriptionResult.text.trim()) {
        throw new Error('No speech detected in the recording');
      }

      // Update user message with transcription
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, content: transcriptionResult.text, isTranscribing: false }
          : msg
      ));

      // Get ChatGPT response
      const chatResponse = await chatGPTService.current.sendMessage(
        transcriptionResult.text, 
        messages
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: generateMessageId(),
        type: 'assistant',
        content: chatResponse.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Voice chat error:', error);
      
      // Remove the user message with transcribing state
      setMessages(prev => prev.filter(msg => msg.id !== userMessageId));
      
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Failed to process voice message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleTextMessageSend = useCallback(async (textMessage: string) => {
    // Create a user message
    const userMessageId = generateMessageId();
    const userMessage: Message = {
      id: userMessageId,
      type: 'user',
      content: textMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Validate API configuration
      const { isValid, errors } = validateApiConfig();
      if (!isValid) {
        throw new Error(`API configuration error: ${errors.join(', ')}`);
      }

      // Get ChatGPT response
      const chatResponse = await chatGPTService.current.sendMessage(
        textMessage, 
        messages
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: generateMessageId(),
        type: 'assistant',
        content: chatResponse.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Text chat error:', error);
      
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessageId));
      
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Failed to process text message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handlePlayAudio = useCallback(async (audioUri: string) => {
    try {
      // Stop any currently playing audio
      if (playbackSound.current) {
        await playbackSound.current.stopAsync();
        await playbackSound.current.unloadAsync();
      }

      // Load and play the audio
      console.log('Playing audio:', audioUri);
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      playbackSound.current = sound;

      // Clean up when playback finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio recording');
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (playbackSound.current) {
        playbackSound.current.unloadAsync();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Voice Sentinel</ThemedText>
          <ThemedText style={styles.subtitle}>
            {messages.length > 0 
              ? `${messages.length} messages` 
              : 'Start a conversation'
            }
          </ThemedText>
        </ThemedView>

        {/* Conversation Display */}
        <ConversationDisplay 
          messages={messages}
          isLoading={isLoading}
          onPlayAudio={handlePlayAudio}
        />

        {/* Input Mode Switcher */}
        <InputModeSwitcher
          currentMode={inputMode}
          onModeChange={setInputMode}
          disabled={isLoading}
        />

        {/* Input Container */}
        <ThemedView style={styles.inputContainer}>
          {inputMode === 'voice' ? (
            <VoiceRecorder 
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={() => console.log('Recording started')}
              onRecordingStop={() => console.log('Recording stopped')}
            />
          ) : (
            <TextInputComponent
              onSendMessage={handleTextMessageSend}
              isLoading={isLoading}
              placeholder="Type your message..."
            />
          )}
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});
