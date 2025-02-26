import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../utils/speechToText';
import { ThemedText } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const HomeScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (recording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recording, isPaused]);

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscribedText(null); 
  };

  const pauseRecording = async () => {
    if (recording) {
      await recording.pauseAsync();
      setIsPaused(true);
    }
  };

  const resumeRecording = async () => {
    if (recording) {
      await recording.startAsync();
      setIsPaused(false);
    }
  };

  const stopRecording = async () => {
    setIsLoading(true);
    try {
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      console.log('Recording stopped. Audio URI:', uri);

      if (uri) {
        const text = await transcribeAudio(uri);
        console.log('Received Transcription:', text);
        setTranscribedText(text || ''); 
      }
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', error.message || 'Failed to transcribe audio.');
    } finally {
      setIsLoading(false);
      setRecording(null);
      setIsPaused(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadText = async () => {
    try {
      const fileUri = `${FileSystem.cacheDirectory}transcription.txt`;
      await FileSystem.writeAsStringAsync(fileUri, transcribedText || '');
      await Sharing.shareAsync(fileUri);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save transcription.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>Qknow Speech-to-Text</ThemedText>

      {recording && <Text style={styles.timer}>{formatTime(recordingTime)}</Text>}

      <View style={styles.buttonContainer}>
        {!recording ? (
          <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
            <Ionicons name="mic" size={60} color="#007AFF" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : isPaused ? (
          <TouchableOpacity style={styles.recordButton} onPress={resumeRecording}>
            <Ionicons name="play" size={60} color="#007AFF" />
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.recordButton} onPress={pauseRecording}>
            <Ionicons name="pause" size={60} color="#007AFF" />
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}

        {recording && (
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Ionicons name="stop" size={60} color="red" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView style={styles.scroll}>
          {transcribedText ? (
            <ThemedText type="defaultSemiBold" style={styles.transcribedText}>
              {transcribedText}
            </ThemedText>
          ) : (
            <Text ></Text>
          )}
        </ScrollView>
      )}

      {transcribedText && (
        <TouchableOpacity style={styles.downloadButton} onPress={downloadText}>
          <Ionicons name="download" size={30} color="#007AFF" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timer: {
    fontSize: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  stopButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    marginTop: 8,
    fontSize: 16,
  },
  transcribedText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  scroll: {
    width: '90%',
    maxHeight: 200,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  downloadButtonText: {
    marginLeft: 8,
    color: '#007AFF',
  },
});

export default HomeScreen;