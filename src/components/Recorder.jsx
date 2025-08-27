import React, { useState, useRef } from "react";
import Header from "./Header";
import LanguageSelector from "./LanguageSelector";

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [translatedAudioURL, setTranslatedAudioURL] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(audioBlob);
        setRecordedAudioURL(audioURL);

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("target_lang", targetLanguage);

        try {
          const response = await fetch("https://voice-translator-backend-8ruw.onrender.com/translate", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Translation failed");
          }

          const data = await response.json();
          setTranscription(data.transcription);
          setTranslation(data.translation);
          setTranslatedAudioURL(data.audio_url);
        } catch (err) {
          console.error("Error al traducir:", err);
          setTranscription("No se pudo transcribir.");
          setTranslation(`Error: ${err.message}`);
        }
      };

      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);

      // Temporizador de segundos
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error al grabar audio:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
    setRecordingSeconds(0);
  };

  return (
    <div className="recorder-container">
      <Header />
      <LanguageSelector
        selectedLang={targetLanguage}
        onChange={setTargetLanguage}
      />

      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "⏹ Detener" : "🎤 Empezar"}
      </button>

      {isRecording && <p>Grabando... ⏱ {recordingSeconds} seg</p>}

      <div className="section">
        <h3>Audio Grabado:</h3>
        {recordedAudioURL ? (
          <audio controls src={recordedAudioURL}></audio>
        ) : (
          <p>No hay audio grabado</p>
        )}
      </div>

      <div className="section">
        <h3>Texto Transcripto:</h3>
        <p>{transcription || "Esperando..."}</p>
      </div>

      <div className="section">
        <h3>Texto Traducido:</h3>
        <p>{translation || "Esperando..."}</p>
      </div>

      <div className="section">
        <h3>Audio Traducido:</h3>
        {translatedAudioURL ? (
          <audio controls src={translatedAudioURL}></audio>
        ) : (
          <p>No hay audio traducido</p>
        )}
      </div>
    </div>
  );
};

export default Recorder;
