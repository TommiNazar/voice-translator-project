import React, { useState, useRef } from "react";

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [translatedAudioURL, setTranslatedAudioURL] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
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
        formData.append("audio", audioBlob);
        formData.append("target_language", "en");

        try {
          const response = await fetch("http://localhost:8000/translate", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          setTranscription(data.transcription);
          setTranslation(data.translation);
          setTranslatedAudioURL(data.audio_url);
        } catch (err) {
          console.error("Error al traducir:", err);
          setTranscription("No se pudo transcribir.");
          setTranslation("No se pudo traducir.");
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
      <h1>🎙 Traductor de Voz</h1>
      <p>Idioma de destino: <strong>Inglés</strong></p>

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
