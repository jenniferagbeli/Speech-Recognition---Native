import React, { useState, useEffect } from "react";
import { View, Text, Button, PermissionsAndroid, Platform } from "react-native";
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from "@react-native-voice/voice";

const VoiceToText = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Request permission for Android
  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const onSpeechResults = (event: SpeechResultsEvent) => {
      setText(event.value?.[0] || "");
    };

    const onSpeechError = (event: SpeechErrorEvent) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.log("Microphone permission denied");
      return;
    }

    try {
      await Voice.start("en-US");
      setIsListening(true);
    } catch (error) {
      console.error("Voice start error:", error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Voice stop error:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{text || "Press button and speak"}</Text>
      <Button title="Start Listening" onPress={startListening} disabled={isListening} />
      <Button title="Stop Listening" onPress={stopListening} disabled={!isListening} />
    </View>
  );
};

export default VoiceToText;
