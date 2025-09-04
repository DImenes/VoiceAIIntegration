import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ConversationDisplayProps, Message } from '../types/voice-chat';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ConversationDisplay({ 
  messages, 
  isLoading = false, 
  onPlayAudio
}: ConversationDisplayProps) {
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isUser = message.type === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          {/* Transcription indicator */}
          {message.isTranscribing && (
            <View style={styles.transcribingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <ThemedText style={styles.transcribingText}>Transcribing...</ThemedText>
            </View>
          )}
          
          {/* Message content with input type indicator */}
          <View style={styles.messageContentContainer}>
            <ThemedText style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText
            ]}>
              {message.content}
            </ThemedText>
            
            {/* Input type indicator for user messages */}
            {isUser && (
              <View style={styles.inputTypeIndicator}>
                <Ionicons 
                  name={message.audioUri ? "mic" : "chatbox"} 
                  size={12} 
                  color={isUser ? "rgba(255, 255, 255, 0.7)" : "#666"} 
                />
              </View>
            )}
          </View>
          
          {/* Audio playback button for user messages */}
          {message.audioUri && isUser && onPlayAudio && (
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => onPlayAudio(message.audioUri!)}
            >
              <Ionicons name="play-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
          
          {/* Timestamp */}
          <ThemedText style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.assistantTimestamp
          ]}>
            {formatTime(message.timestamp)}
          </ThemedText>
        </View>
        
        {/* Avatar/Icon */}
        <View style={[
          styles.avatar,
          isUser ? styles.userAvatar : styles.assistantAvatar
        ]}>
          <Ionicons 
            name={isUser ? "person" : "chatbubble-ellipses"} 
            size={16} 
            color="white" 
          />
        </View>
      </View>
    );
  };

  const renderLoadingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageContainer, styles.assistantMessage]}>
        <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <ThemedText style={styles.loadingText}>AI is thinking...</ThemedText>
          </View>
        </View>
        <View style={[styles.avatar, styles.assistantAvatar]}>
          <Ionicons name="chatbubble-ellipses" size={16} color="white" />
        </View>
      </View>
    );
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons name="mic-outline" size={64} color="#999" />
        <ThemedText style={styles.emptyTitle}>Start a conversation</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Write your message or tap the microphone button to record
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
        ListFooterComponent={renderLoadingIndicator}
        contentContainerStyle={styles.messagesContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    minWidth: 60, // Minimum width for very short messages
    maxWidth: '85%', // Slightly increased max width
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 8,
    // Remove fixed width constraint to allow dynamic sizing
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 6,
  },
  loadingBubble: {
    backgroundColor: '#F0F0F0',
  },
  messageContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexShrink: 1, // Allow container to shrink
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22, // Increased line height for better readability
    flexShrink: 1, // Allow text to shrink when needed
    // Remove flex: 1 to allow natural text width
  },
  inputTypeIndicator: {
    marginLeft: 8,
    marginTop: 2,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  assistantTimestamp: {
    color: '#666',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#34C759',
  },
  assistantAvatar: {
    backgroundColor: '#FF9500',
  },
  audioButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    padding: 4,
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcribingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
});
