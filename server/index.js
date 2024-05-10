require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const DeviceData = require('./models/device');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const speech = require('@google-cloud/speech');
const fs = require('fs');
const client = new speech.SpeechClient({
    keyFilename: '/Users/nikhilasornapudi/voice-auto91-422306-1653971ea798.json'
});

app.use(cors())
app.use(express.json());

mongoose.connect('mongodb+srv://nikhila2410:fMoca4ZXU8bjenoL@users.taxkcn4.mongodb.net/Users?retryWrites=true&w=majority', {
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Connection Error:', err);
});

app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            name: req.body.name,
            email: req.body.username,
            password: hashedPassword,
        });
        res.json({status: 'ok'});
    } catch (err) {
        res.json({status: 'error', error: 'Duplicate email'});
    }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.username,
    });

    if (!user) {
        res.json({status: 'error', error: 'Invalid login'});
    } else {
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({
                name: user.name,
                email: user.email
            }, 'secret123');
            res.json({status: 'ok', user: token});
        } else {
            res.json({status: 'error', user: false});
        }
    }
});

app.get('/api/devices', async (req, res) => {
    try {
        const devices = await DeviceData.find({});
        res.json({status: 'ok', data: devices || []});
    } catch (error) {
        res.status(500).json({status: 'error', error: 'Internal server error'});
    }
});

app.post('/api/devices', async (req, res) => {
    const { devicename, devicetype, devicestatus } = req.body;
    try {
        const existingDevice = await DeviceData.findOne({ devicename });
        if (existingDevice) {
            res.status(409).json({status: 'error', error: 'A device with this name already exists'});
        } else {
            const newDevice = new DeviceData({ devicename, devicetype, devicestatus });
            await newDevice.save();
            res.json({status: 'ok', message: 'Device added successfully'});
        }
    } catch (error) {
        res.status(500).json({status: 'error', error: 'Internal server error'});
    }
});

app.patch('/api/devices/update/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const device = await DeviceData.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!device) {
            res.status(404).json({ status: 'error', error: 'Device not found' });
        } else {
            res.json({ message: 'Device updated successfully', device });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
});

app.delete('/api/devices/:deviceId', async (req, res) => {
    try {
        const device = await DeviceData.findByIdAndDelete(req.params.deviceId);
        if (!device) {
            res.status(404).json({status: 'error', error: 'Device not found'});
        } else {
            res.json({status: 'ok', message: 'Device deleted successfully'});
        }
    } catch (error) {
        res.status(500).json({status: 'error', error: 'Internal server error'});
    }
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    console.log('Incoming Request:', req);  // Log the entire request object
    console.log('Audio file:', req.file);
    console.log('File buffer:', req.file.buffer);
    try {
      const audioBytes = req.file.buffer.toString('base64');
      console.log('Audio Bytes length:', audioBytes.length); 
      console.log('Audio content (first 50 chars):', audioBytes.slice(0, 50));
      const audio = { content: audioBytes };
      const config = { encoding: 'LINEAR16', languageCode: 'en-US' };
      const request = { audio, config };
      console.log('Sending request to Google Speech-to-Text'); // Log before the API call

      const [response] = await client.recognize(request);
      console.log('Google Speech-to-Text Response:', response); // Log the API response

  
      const text = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
  
    if (!text) {
        res.status(400).send('No speech detected'); // Send as text
    } else {
        res.status(200).send(text); // Send as text
    }
    } catch (error) {
      console.error('Transcription error:', error);
      console.error('Error Details:', error.details);
      res.status(500).json({ error: 'Error transcribing audio' });
    }
  });
  

app.listen(1337, () => {
    console.log('Server is running on port 1337');
});
