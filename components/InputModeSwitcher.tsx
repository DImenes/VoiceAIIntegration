import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { InputMode, InputModeSwitcherProps } from '../types/voice-chat';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function InputModeSwitcher({ 
  currentMode, 
  onModeChange,
  disabled = false 
}: InputModeSwitcherProps) {
  
  const handleModeToggle = () => {
    if (!disabled) {
      const newMode: InputMode = currentMode === 'text' ? 'voice' : 'text';
      onModeChange(newMode);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[
          styles.switchButton,
          disabled && styles.switchButtonDisabled
        ]}
        onPress={handleModeToggle}
        disabled={disabled}
      >
        <View style={styles.switchContent}>
          <View style={[
            styles.iconContainer,
            currentMode === 'text' ? styles.iconContainerActive : styles.iconContainerInactive
          ]}>
            <Ionicons 
              name="chatbox" 
              size={16} 
              color={currentMode === 'text' ? "white" : "#666"} 
            />
          </View>
          
          <View style={styles.switchTrack}>
            <View style={[
              styles.switchThumb,
              currentMode === 'voice' ? styles.switchThumbRight : styles.switchThumbLeft
            ]} />
          </View>
          
          <View style={[
            styles.iconContainer,
            currentMode === 'voice' ? styles.iconContainerActive : styles.iconContainerInactive
          ]}>
            <Ionicons 
              name="mic" 
              size={16} 
              color={currentMode === 'voice' ? "white" : "#666"} 
            />
          </View>
        </View>
        
        <ThemedText style={styles.modeLabel}>
          {currentMode === 'text' ? 'Text Mode' : 'Voice Mode'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  switchButton: {
    alignItems: 'center',
    padding: 8,
  },
  switchButtonDisabled: {
    opacity: 0.5,
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#007AFF',
  },
  iconContainerInactive: {
    backgroundColor: '#E0E0E0',
  },
  switchTrack: {
    width: 50,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    justifyContent: 'center',
    position: 'relative',
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  switchThumbLeft: {
    left: 2,
  },
  switchThumbRight: {
    right: 2,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
