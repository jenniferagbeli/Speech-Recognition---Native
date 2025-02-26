import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const transcribeAudio = async (audioUri: string): Promise<string> => {
  // Get the backend URL from Expo constants
  const backendUrl = 'http://localhost:5000';

  console.log('Backend URL:', backendUrl);
  console.log('Audio URI:', audioUri);

  if (!backendUrl) {
    throw new Error('Backend URL is missing. Please check your app.json configuration.');
  }

  try {
    console.log('Transcribing audio. File URI:', audioUri);
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Fetch the Blob from the audio URI
      const response = await fetch(audioUri);
      const blob = await response.blob();

      // Append the Blob to FormData
      formData.append('audio', blob, 'audio.webm');
    } else {
      // For native platforms, use expo-file-system to read the file
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      console.log('File Info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist.');
      }

      console.log('Audio file info:', fileInfo);
      const fileType = audioUri.split('.').pop() || 'mp3'; // Extract file extension
      formData.append('audio', {
        uri: audioUri,
        name: `audio.${fileType}`,
        type: `audio/${fileType}`,
      } as any); // Cast to `any` to avoid TypeScript errors
    }

    // Send the audio file to the backend for transcription
    console.log('Sending audio to backend...');
    const response = await axios.post(`${backendUrl}/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Backend Response:', response.data);

    // Return the transcribed text
    if (response.data?.transcription) {
      return response.data.transcription;
    } else {
      throw new Error('No transcription results found.');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Transcription failed: ${error.message}`);
    } else {
      throw new Error('Transcription failed. Please check your network connection.');
    }
  }
};

export { transcribeAudio };