"use client";

import { useEffect, useRef, useState } from "react";
// import "./index.css"; // Handled by globals.css

interface ArduinoStatus {
  led_green: boolean;
  led_blue: boolean;
  led_yello: boolean;
  buzzer: boolean;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected";
type RecordingStatus =
  | "ready"
  | "recording"
  | "processing"
  | "transcribing"
  | "done"
  | "error";

function App() {
  // Arduino Status State
  const [arduinoStatus, setArduinoStatus] = useState<ArduinoStatus>({
    led_green: false,
    led_blue: false,
    led_yello: false,
    buzzer: false,
  });
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("ready");
  const [transcription, setTranscription] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE Connection for Arduino Status
  useEffect(() => {
    const connectToArduinoStatus = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setConnectionStatus("connecting");

      // Changed URL to Next.js API route
      const eventSource = new EventSource("/api/v1/status/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE Connected");
        setConnectionStatus("connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const status: ArduinoStatus = JSON.parse(event.data);
          console.log("📊 Arduino Status:", status);
          setArduinoStatus(status);
        } catch (error) {
          console.error("❌ Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE Error:", error);
        setConnectionStatus("disconnected");
        if (eventSource.readyState === EventSource.CLOSED) {
          // Only reconnect if closed
          setTimeout(() => {
            console.log("🔄 Reconnecting to SSE...");
            connectToArduinoStatus();
          }, 3000);
        }
      };
    };

    connectToArduinoStatus();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Start Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      }); // Explicit mimetype if possible
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });
        console.log("🎙️ Recording file:", file);
        await sendAudio(file);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus("recording");
      setStatusMessage("🎙️ Recording...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingStatus("error");
      setStatusMessage("❌ Error: Please allow microphone permissions.");
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingStatus("processing");
      setStatusMessage("⏳ Processing recording...");
    }
  };

  // Send Audio to Server
  const sendAudio = async (file: File) => {
    const formData = new FormData();
    formData.append("audio", file);

    setRecordingStatus("transcribing");
    setStatusMessage("✨ Transcribing...");
    setTranscription("");
    console.log("📤 Sending audio:", formData);

    try {
      const response = await fetch("/api/v1/speech/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message || "Unknown error");
      }

      const transcriptionText = result.data.transcription;
      setTranscription(transcriptionText);
      setRecordingStatus("done");
      setStatusMessage("✅ Done!");
    } catch (error) {
      console.error("❌ Error:", error);
      setRecordingStatus("error");
      setStatusMessage(`❌ Error: ${(error as Error).message}`);
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    // You could add a toast notification here
  };

  // Get connection status text
  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected to Arduino";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
    }
  };

  // Get status message color (Tailwind classes)
  const getStatusClass = () => {
    switch (recordingStatus) {
      case "recording":
      case "error":
        return "text-danger";
      case "processing":
      case "transcribing":
        return "text-primary";
      case "done":
        return "text-success";
      default:
        return "text-text-muted";
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-5 font-sans bg-bg text-text mx-auto">
      <h1 className="text-center mb-8 font-semibold text-4xl tracking-tight">
        Smart AIoT
      </h1>

      {/* Arduino Control Panel */}
      <div className="w-full bg-gradient-to-br from-bg-card to-bg p-8 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-border mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="w-3 h-3 bg-success rounded-full animate-pulse"></span>
          Arduino Control Panel
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 mb-6">
          {/* LED Green */}
          <div
            className={`bg-bg-card/50 p-5 rounded-2xl border ${
              arduinoStatus.led_green
                ? "border-success bg-success/10"
                : "border-border"
            } flex flex-col items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5`}
            id="led-green-card"
          >
            <div
              className={`led-indicator green ${arduinoStatus.led_green ? "on" : ""}`}
              id="led-green-indicator"
            ></div>
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1">LED Green</h3>
              <p
                className={`text-xs font-semibold transition-all duration-300 ${
                  arduinoStatus.led_green ? "text-success" : "text-text-muted"
                }`}
                id="led-green-status"
              >
                {arduinoStatus.led_green ? "ON" : "OFF"}
              </p>
            </div>
          </div>

          {/* LED Blue */}
          <div
            className={`bg-bg-card/50 p-5 rounded-2xl border ${
              arduinoStatus.led_blue
                ? "border-success bg-success/10"
                : "border-border"
            } flex flex-col items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5`}
            id="led-blue-card"
          >
            <div
              className={`led-indicator blue ${arduinoStatus.led_blue ? "on" : ""}`}
              id="led-blue-indicator"
            ></div>
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1">LED Blue</h3>
              <p
                className={`text-xs font-semibold transition-all duration-300 ${
                  arduinoStatus.led_blue ? "text-success" : "text-text-muted"
                }`}
                id="led-blue-status"
              >
                {arduinoStatus.led_blue ? "ON" : "OFF"}
              </p>
            </div>
          </div>

          {/* LED Yellow */}
          <div
            className={`bg-bg-card/50 p-5 rounded-2xl border ${
              arduinoStatus.led_yello
                ? "border-success bg-success/10"
                : "border-border"
            } flex flex-col items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5`}
            id="led-yello-card"
          >
            <div
              className={`led-indicator yellow ${arduinoStatus.led_yello ? "on" : ""}`}
              id="led-yello-indicator"
            ></div>
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1">LED Yellow</h3>
              <p
                className={`text-xs font-semibold transition-all duration-300 ${
                  arduinoStatus.led_yello ? "text-success" : "text-text-muted"
                }`}
                id="led-yello-status"
              >
                {arduinoStatus.led_yello ? "ON" : "OFF"}
              </p>
            </div>
          </div>

          {/* Buzzer */}
          <div
            className={`bg-bg-card/50 p-5 rounded-2xl border ${
              arduinoStatus.buzzer
                ? "border-success bg-success/10"
                : "border-border"
            } flex flex-col items-center gap-3 transition-all duration-300 hover:border-primary hover:-translate-y-0.5`}
            id="buzzer-card"
          >
            <div
              className={`buzzer-indicator ${arduinoStatus.buzzer ? "on" : ""}`}
              id="buzzer-indicator"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
                <path
                  d="M15 8C16.5 9.5 16.5 14.5 15 16M17.5 5.5C20.5 8.5 20.5 15.5 17.5 18.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1">Buzzer</h3>
              <p
                className={`text-xs font-semibold transition-all duration-300 ${
                  arduinoStatus.buzzer ? "text-success" : "text-text-muted"
                }`}
                id="buzzer-status"
              >
                {arduinoStatus.buzzer ? "ON" : "OFF"}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-center gap-2 p-3 bg-bg-card/50 rounded-xl text-sm ${connectionStatus}`}
          id="connection-status"
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              connectionStatus === "connected"
                ? "bg-success animate-pulse"
                : connectionStatus === "disconnected"
                  ? "bg-danger"
                  : "bg-text-muted"
            }`}
          ></span>
          <span id="connection-text">{getConnectionText()}</span>
        </div>
      </div>

      {/* Recording Section */}
      <div className="w-full bg-bg-card p-10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-border max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            id="recordBtn"
            className="flex-1 px-6 py-3 bg-success text-white border-none rounded-xl cursor-pointer text-base font-semibold transition-all duration-200 hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleStartRecording}
            disabled={isRecording}
          >
            Start Recording
          </button>
          <button
            id="stopBtn"
            className="flex-1 px-6 py-3 bg-danger text-white border-none rounded-xl cursor-pointer text-base font-semibold transition-all duration-200 hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleStopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </button>
        </div>
      </div>

      <div
        id="status"
        className={`my-6 text-center text-sm min-h-5 ${getStatusClass()}`}
      >
        {statusMessage}
      </div>

      {/* Transcription Result */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl mb-4 font-semibold">Transcription Result</h2>
        <div className="relative">
          <textarea
            id="transcriptionOutput"
            readOnly
            placeholder="Transcription will appear here..."
            value={transcription}
            className="w-full h-45 p-5 bg-bg-card text-text border border-border rounded-2xl resize-none text-base leading-6 outline-none focus:border-primary"
          />
          <button
            id="copyBtn"
            className="absolute top-2.5 right-2.5 px-3 py-1.5 text-xs bg-bg border border-border rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:bg-border text-text"
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
