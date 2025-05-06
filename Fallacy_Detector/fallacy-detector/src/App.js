import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [accessKey, setAccessKey] = useState("");
  const [text, setText] = useState("");
  const [prediction, setPrediction] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob, "speech.wav");

      try {
        console.log(formData.toString());
        const res = await fetch("https://dbc-28e35821-942c.cloud.databricks.com/serving-endpoints/fallacy-classifier/invocations", {
          method: "POST",
          body: formData,
          headers: {
                Authorization: `Bearer ${accessKey}`
              }
        });
        const data = await res.json();
        setText(data.transcription); // Fill text box with result
      } catch (err) {
        console.error("Transcription failed:", err);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !accessKey.trim()) return;

    try {
      const body = {
        dataframe_split: {
          columns: ["text"],
          data: [[text]]
        },
        accessKey // include the access token here
      };

      const response = await fetch("/.netlify/functions/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      setPrediction(data.prediction || JSON.stringify(data));
    } catch (error) {
      console.error("Error:", error);
      setPrediction("Error: Could not fetch prediction.");
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">🧠 Fallacy Detector</header>

      <div className="content">
        <textarea
            className="access-key"
            rows="1"
            placeholder="databricks pat -- for beta user tracking."
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
        />
        <textarea
          className="text-input"
          rows="4"
          placeholder="Type or speak a sentence..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="button-group">
          {!isRecording ? (
            <button className="mic-button" onClick={handleStartRecording}>
              🎤 Start Recording
            </button>
          ) : (
            <button className="mic-button stop" onClick={handleStopRecording}>
              ⏹️ Stop Recording
            </button>
          )}
          <button className="submit-button" onClick={handleSubmit}>
            🔍 Go
          </button>
        </div>
        {prediction && (
          <div className="result">
            <strong>Prediction:</strong> {prediction}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
