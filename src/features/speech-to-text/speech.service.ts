import { SpeechClient } from "@google-cloud/speech";
import * as fs from "fs";
import { publishCommand, isConnected, connectMQTT } from "../mqtt/mqtt.service";
import { matchCommand, matchCommandByKeywords } from "../mqtt/mqtt.helper";

export async function transcribeAudioService(
  fileName: string,
  buffer: Buffer,
  encoding?: "LINEAR16" | "WEBM_OPUS",
): Promise<string> {
  const client = new SpeechClient();

  // In Next.js App Router we might receive a Buffer directly instead of a file path if we process it in memory.
  // But Google Cloud SDK accepts audio content as string base64 or bytes.

  const audioBytes = buffer.toString("base64");

  // Configure the audio and recognition settings
  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: encoding || "LINEAR16",
    // sampleRateHertz: 16000, // Optional: Can be auto-detected by Google Cloud
    languageCode: "lo-LA", // Lao language
  };

  const request = {
    audio: audio,
    config: config,
  };

  // Perform speech recognition
  console.log("🎤 Sending to Google Speech API...");
  const [response] = await client.recognize(request);

  console.log(
    "📝 Speech Recognition Response Alternatives:",
    response.results?.[0]?.alternatives?.length,
  );

  if (!response.results || response.results.length === 0) {
    return "No transcription results found.";
  }

  const transcription = response.results
    .map((result: any) =>
      result.alternatives ? result.alternatives[0].transcript : "",
    )
    .join("\n");

  console.log("📝 Transcription:", transcription);

  // ตรวจสอบและส่งคำสั่ง MQTT
  if (transcription) {
    // ลองใช้ Fuzzy Matching ก่อน (threshold 60%)
    let mqttCommand = matchCommand(transcription, 0.6);

    // ถ้าไม่เจอ ลองใช้ Keyword Matching
    if (!mqttCommand) {
      mqttCommand = matchCommandByKeywords(transcription);
    }

    // ถ้าเจอคำสั่ง ส่งผ่าน MQTT
    if (mqttCommand) {
      try {
        // Check if MQTT is connected
        if (!isConnected()) {
          console.log("⚠️ MQTT not connected yet. Attempting to connect...");
          await connectMQTT();
        }

        const success = await publishCommand(mqttCommand);

        if (success) {
          console.log(`✅ MQTT Command "${mqttCommand}" sent successfully!`);
        } else {
          console.error(`❌ Failed to send MQTT command: ${mqttCommand}`);
        }
      } catch (error) {
        console.error("❌ Error sending MQTT command:", error);
      }
    } else {
      console.log("❌ No matching command found for transcription");
    }
  }

  return transcription;
}
