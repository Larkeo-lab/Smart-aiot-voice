# Smart AIoT Dashboard

This project is a centralized Next.js application that integrates both the frontend and backend of the AIoT system.

## Features

- **Voice Control**: Speak commands to control LED lights and Buzzer.
- **Microphone Integration**: Records audio directly from the browser.
- **Real-time Status**: Uses Server-Sent Events (SSE) to update the UI with the latest device status from MQTT.
- **Google Cloud Speech-to-Text**: High-accuracy transcription for voice commands.
- **MQTT Integration**: Communicates with ESP32/IoT devices via MQTT.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Ensure you have a `service-account.json` file in the root directory for Google Cloud credentials.
   The `.env` file should point to it:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/page.tsx`: Main frontend UI (Client Connection, Recording, Status).
- `app/api/v1/speech/transcribe`: API route for processing audio uploads.
- `app/api/v1/status/stream`: API route for SSE status streaming.
- `src/features/mqtt`: MQTT Service and Logic.
- `src/features/speech-to-text`: Speech Recognition Service.

## Technologies

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Custom Animations
- **Protocols**: MQTT, HTTP/2 (SSE)
- **Language**: TypeScript
