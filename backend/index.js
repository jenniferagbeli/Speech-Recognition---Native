const express = require('express');
const multer = require('multer');
const cors = require('cors');
const speech = require('@google-cloud/speech');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: '*', // Allow all origins (replace with your frontend URL in production)
  methods: ['POST'],
}));

const client = new speech.SpeechClient({
  keyFilename: path.join(__dirname, 'speech-recognition-452018-89c855e3b944[1].json'),
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received.');
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    console.log('Received file:', req.file); 

    const filePath = req.file.path;

    // Read the audio file
    const audioBytes = await fs.promises.readFile(filePath, { encoding: 'base64' });

    // Configure the request for GCP Speech-to-Text
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS', 
        sampleRateHertz: 48000, 
        languageCode: 'en-US',
      },
    };

    console.log('Sending request to Google Speech-to-Text...');
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    console.log('Transcription:', transcription); 
    res.json({ transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error); 
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});