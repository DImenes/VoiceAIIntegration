import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RecordingState, VoiceRecorderProps } from '../types/voice-chat';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function VoiceRecorder({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop 
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    uri: undefined
  });
  
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0 }));
      
      // Start duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        if (recording.current) {
          setRecordingState(prev => ({ 
            ...prev, 
            duration: Date.now() - startTime 
          }));
        } else {
          clearInterval(timer);
        }
      }, 100);

      onRecordingStart?.();
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    
    if (!recording.current) return;

    try {
      await recording.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.current.getURI();
      recording.current = null;
      
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        uri 
      }));
      
      onRecordingStop?.();
      
      if (uri) {
        onRecordingComplete(uri);
      }
      
      console.log('Recording stopped and stored at', uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const playRecording = async () => {
    if (!recordingState.uri) return;

    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      console.log('Loading Sound');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingState.uri },
        { shouldPlay: true }
      );
      
      sound.current = newSound;
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      console.log('Playing Sound');
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const stopPlayback = async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      uri: undefined
    });
    if (sound.current) {
      sound.current.unloadAsync();
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!recordingState.isRecording ? (
          <TouchableOpacity
            style={[styles.recordButton, styles.startButton]}
            onPress={startRecording}
          >
            <Ionicons name="mic" size={32} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.recordButton, styles.stopButton]}
            onPress={stopRecording}
          >
            <Ionicons name="stop" size={32} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Recording Status */}
      {recordingState.isRecording && (
        <View style={styles.statusContainer}>
          <View style={styles.recordingIndicator} />
          <ThemedText style={styles.statusText}>
            Recording... {formatDuration(recordingState.duration)}
          </ThemedText>
        </View>
      )}

      {/* Playback Controls */}
      {recordingState.uri && !recordingState.isRecording && (
        <View style={styles.playbackContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? stopPlayback : playRecording}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
          
          <ThemedText style={styles.durationText}>
            {formatDuration(recordingState.duration)}
          </ThemedText>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetRecording}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    backgroundColor: '#FF3B30',
  },
  stopButton: {
    backgroundColor: '#FF9500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 10,
    opacity: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 25,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 50,
  },
  resetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
