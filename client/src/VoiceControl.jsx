import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../src/voice.css";

import {
  faMicrophone,
  faRedo,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function VoiceControl() {
  const [isRecording, setIsRecording] = useState(false);
  const [conversationState, setConversationState] = useState(0);
  const [audioData, setAudioData] = useState(null);
  const [noAudioDetected, setNoAudioDetected] = useState(false);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const recorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const speak = useCallback((text, callback) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => callback && callback();
      synth.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  }, []);

  const handleVoiceCommand = useCallback(
    (text) => {
      console.log("User said:", text);
      switch (conversationState) {
        case 0:
          if (text.toLowerCase().includes("hello")) {
            speak(
              "Welcome to The Smart Home Automation System! What would you like to do?",
              () => setConversationState(1)
            );
          }
          break;
        case 1:
          if (text.includes("see which devices are active")) {
            speak("Fetching active devices for you.", null);
          } else if (text.includes("add a device")) {
            speak("You can add a new device now.", null);
          } else if (text.includes("modify the device")) {
            speak("Tell me which device you want to modify.", null);
          }
          break;
        default:
          speak("Thank you for using our system.", null);
          setConversationState(0);
          break;
      }
    },
    [conversationState, speak]
  );

  const handleResponse = useCallback(
    (text) => {
      handleVoiceCommand(text);
    },
    [handleVoiceCommand]
  );

  const sendAudioToServer = useCallback(
    async (audioBlob) => {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      try {
        const response = await axios.post(
          "http://localhost:1337/api/transcribe",
          formData
        );
        handleResponse(response.data.text);
      } catch (error) {
        console.error("Error sending audio to server:", error);
      }
    },
    [handleResponse]
  );

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(recordingTimeoutRef.current);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!window.speechSynthesis.speaking) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        recorderRef.current = new MediaRecorder(stream);
        recorderRef.current.start();
        setNoAudioDetected(false);
        audioChunksRef.current = [];

        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = setTimeout(() => {
          if (audioChunksRef.current.length === 0) {
            stopRecording();
            setNoAudioDetected(true);
            speak(
              "I could not hear your voice, please feel free to try again.",
              null
            );
          }
        }, 5000);

        recorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 100) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorderRef.current.onstop = async () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            setAudioData(audioBlob);
            await sendAudioToServer(audioBlob);
          } else {
            console.log("No audio data captured.");
          }
        };

        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }
  }, [sendAudioToServer, speak, stopRecording]);

  const speakAndStartRecording = useCallback(() => {
    if (!hasSpokenWelcome) {
      speak(
        "Hey user, welcome to the smart home automation system. How may I help you?",
        () => {
          setHasSpokenWelcome(true);
          startRecording();
        }
      );
    }
  }, [speak, startRecording, hasSpokenWelcome]);

  useEffect(() => {
    // Request microphone permissions when component mounts
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => console.log("Microphone access granted"))
      .catch((err) => console.error("Error accessing microphone:", err));
  }, []);

  return (
    <div className="voice-control-container">
      <div className="voice-header">
        <div className="navigation">
          <Link to="/home">Home</Link>
          <Link to="/device">Devices</Link>
          <Link to="/voice">Voice</Link>
          <label className="voice-popup" htmlFor="voice-profile-popup">
            <div className="voice-burger" tabIndex="0">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <input type="checkbox" id="voice-profile-popup" />
            <nav className="voice-popup-window">
              <ul>
                <li>
                  <button onClick={handleLogoutClick}>
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </label>
        </div>
      </div>
      {noAudioDetected && (
        <p className="no-audio-message">No audio detected. Please try again.</p>
      )}
      <button
        onClick={speakAndStartRecording}
        disabled={isRecording}
        className="record-button"
      >
        <FontAwesomeIcon icon={faMicrophone} />
        <span>Start Interaction</span>
      </button>
      <button
        onClick={startRecording}
        disabled={isRecording}
        className="record-button"
      >
        <FontAwesomeIcon icon={faRedo} />
        <span>Try Again</span>
      </button>
      <button
        onClick={stopRecording}
        disabled={!isRecording}
        className="record-button"
      >
        <FontAwesomeIcon icon={faStop} />
        <span>Stop Recording</span>
      </button>
      <br></br>
      {audioData && <audio src={URL.createObjectURL(audioData)} controls />}
    </div>
  );
}

export default VoiceControl;
