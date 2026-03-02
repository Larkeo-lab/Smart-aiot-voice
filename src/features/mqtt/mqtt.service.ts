import * as mqtt from "mqtt";
import { setStatusFromJSON } from "./mqtt.helper";

// MQTT Configuration
const MQTT_BROKER = "mqtt://broker.mqttdashboard.com:1883";
const CONTROL_TOPIC = "WOKWI_VOID_CONTROL";
const STATUS_TOPIC = "WOKWI_SATATUS"; // Note: Typo in topic name maintained from original code

// MQTT Client instance
let client: mqtt.MqttClient | null = null;
let isConnecting = false;

/**
 * Connect to MQTT Broker
 */
export async function connectMQTT(): Promise<void> {
  if (client?.connected) return;
  if (isConnecting) return; // Prevent multiple connection attempts

  isConnecting = true;
  return new Promise((resolve, reject) => {
    try {
      client = mqtt.connect(MQTT_BROKER, {
        clientId: `voice-server-${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      client.on("connect", () => {
        console.log("✅ MQTT Connected to:", MQTT_BROKER);
        isConnecting = false;

        // Subscribe to status topic
        client?.subscribe(STATUS_TOPIC, (err) => {
          if (err) {
            console.error("❌ MQTT Subscribe Error:", err);
          } else {
            console.log(`📡 Subscribed to: ${STATUS_TOPIC}`);
          }
        });

        resolve();
      });

      client.on("error", (error) => {
        console.error("❌ MQTT Error:", error);
        isConnecting = false;
        // Don't reject here effectively to allow retries, but if it's initial connection we might want to know.
        // For singleton pattern, logging is often enough if retry is enabled.
      });

      client.on("message", (topic, message) => {
        const messageStr = message.toString();
        // console.log(`📨 MQTT Message [${topic}]: ${messageStr}`);

        // Update status from Arduino
        if (topic === STATUS_TOPIC) {
          try {
            setStatusFromJSON(messageStr);
          } catch (error) {
            console.error("❌ Error processing status message:", error);
          }
        }
      });

      client.on("offline", () => {
        console.log("⚠️ MQTT Client is offline");
      });

      client.on("reconnect", () => {
        console.log("🔄 MQTT Reconnecting...");
      });
    } catch (error) {
      isConnecting = false;
      reject(error);
    }
  });
}

/**
 * Publish command to Arduino
 */
export async function publishCommand(command: string): Promise<boolean> {
  if (!client || !client.connected) {
    console.error("❌ MQTT not connected. Cannot publish command.");
    // Try to reconnect?
    if (!isConnecting) {
      connectMQTT().catch((e) => console.error("Failed to reconnect", e));
    }
    return false;
  }

  return new Promise((resolve) => {
    client?.publish(CONTROL_TOPIC, command, { qos: 1 }, (error) => {
      if (error) {
        console.error("❌ MQTT Publish Error:", error);
        resolve(false);
      } else {
        console.log(`✅ MQTT Command Sent [${CONTROL_TOPIC}]: ${command}`);
        resolve(true);
      }
    });
  });
}

/**
 * Disconnect from MQTT Broker
 */
export async function disconnectMQTT(): Promise<void> {
  return new Promise((resolve) => {
    if (client) {
      client.end(false, {}, () => {
        console.log("🔌 MQTT Disconnected");
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Check if MQTT is connected
 */
export function isConnected(): boolean {
  return client !== null && client.connected;
}

/**
 * Initialize MQTT Service (ensure connection)
 */
export async function initializeMQTT(): Promise<void> {
  if (!isConnected()) {
    await connectMQTT();
  }
}
