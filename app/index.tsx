import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";

const VoiceToText = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      setText(event.value?.[0] || "");
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start("en-US");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{text || "Press button and speak"}</Text>
      <Button title="Start Listening" onPress={startListening} />
    </View>
  );
};

export default VoiceToText;
