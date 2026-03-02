import { compareTwoStrings } from "string-similarity";

// ========================================
// Types & Interfaces
// ========================================

export interface CommandMapping {
  patterns: string[];
  mqttCommand: string;
}

export interface DeviceStatus {
  buzzer: boolean;
  led_green: boolean;
  led_blue: boolean;
  led_yello: boolean;
}

// ========================================
// Command Matcher Utilities
// ========================================

const COMMAND_MAPPINGS: CommandMapping[] = [
  // LED Green
  {
    patterns: [
      "ເປີດໄຟສີຂຽວ",
      "ເປີດໄຟຊີຂຽວ",
      "ເປີດໄຟຂຽວ",
      "ເປີດ ໄຟສີ ຂຽວ",
      "ປີດໄຟສີຂຽວ",
      "ເປີດໄຟສີເຂຽວ",
      "ເປີດໄຟຄຽວ",
      "ເປີດໄຟຂີວ",
      // ເປິດໃຊ້ variations
      "ເປິດໃຊ້ສີຂຽວ",
      "ເປິດໃຊ້ຂຽວ",
      "ເປີດໃຊ້ສີຂຽວ",
      "ເປີດໃຊ້ຂຽວ",
    ],
    mqttCommand: "led_green_on",
  },
  {
    patterns: [
      "ປິດໄຟສີຂຽວ",
      "ປິດໄຟຊີຂຽວ",
      "ປິດໄຟຂຽວ",
      "ປິດ ໄຟສີ ຂຽວ",
      "ບິດໄຟສີຂຽວ",
      "ປິດໄຟສີເຂຽວ",
      "ປິດໄຟຄຽວ",
      "ປິດໄຟຂີວ",
      // ປິດໃຊ້ variations
      "ປິດໃຊ້ສີຂຽວ",
      "ປິດໃຊ້ຂຽວ",
    ],
    mqttCommand: "led_green_off",
  },

  // LED Blue
  {
    patterns: [
      "ເປີດໄຟສີຟ້າ",
      "ເປີດໄຟຊີຟ້າ",
      "ເປີດໄຟຟ້າ",
      "ເປີດ ໄຟ สີ ຟ້າ",
      "ປີດໄຟສີຟ້າ",
      "ເປີດໄຟຟາ",
      "ເປີດໄຟສີຟາ",
      // ເປິດໃຊ້ variations
      "ເປິດໃຊ້ສີຟ້າ",
      "ເປິດໃຊ້ຟ້າ",
      "ເປີດໃຊ້ສີຟ້າ",
      "ເປີດໃຊ້ຟ້າ",
    ],
    mqttCommand: "led_blue_on",
  },
  {
    patterns: [
      "ປິດໄຟສີຟ້າ",
      "ປິດໄຟຊີຟ້າ",
      "ປິດໄຟຟ້າ",
      "ປິດ ໄຟ สີ ຟ້າ",
      "ບິດໄຟສີຟ້າ",
      "ປິດໄຟຟາ",
      "ປິດໄຟສີຟາ",
      // ປິດໃຊ້ variations
      "ປິດໃຊ້ສີຟ້າ",
      "ປິດໃຊ້ຟ້າ",
    ],
    mqttCommand: "led_blue_off",
  },

  // LED Yellow
  {
    patterns: [
      "ເປີດໄຟສີເຫລືອງ",
      "ເປີດໄຟຊີເຫລືອງ",
      "ເປີດໄຟເຫລືອງ",
      "ເປີດ ໄຟສີ ເຫລືອງ",
      "ເປີດໄຟສີເລືອງ",
      "ເປີດໄຟຊີເລືອງ",
      "ເປີດໄຟເລືອງ",
      "ປີດໄຟສີເຫລືອງ",
      "ເປີດໄຟສີເຫຼືອງ",
      "ເປີດໄຟລືອງ",
      "ເປີດໄຟຊີລືອງ",
      "ເປີດໄຟສີລືອງ",
      // ເປິດໃຊ້ variations
      "ເປິດໃຊ້ສີເຫລືອງ",
      "ເປິດໃຊ້ເຫລືອງ",
      "ເປີດໃຊ້ສີເຫລືອງ",
      "ເປີດໃຊ້ເຫລືອງ",
      "ເປິດໃຊ້ສີເຫຼືອງ",
    ],
    mqttCommand: "led_yello_on",
  },
  {
    patterns: [
      "ປິດໄຟສີເຫລືອງ",
      "ປິດໄຟຊີເຫລືອງ",
      "ປິດໄຟເຫລືອງ",
      "ປິດ ໄຟສີ ເຫລືອງ",
      "ປິດໄຟສີເລືອງ",
      "ປິດໄຟຊີເລືອງ",
      "ປິດໄຟເລືອງ",
      "ບິດໄຟສີເຫລືອງ",
      "ປິດໄຟລືອງ",
      "ປິດໄຟຊີລືອງ",
      "ປິດໄຟສີລືອງ",
      // ປິດໃຊ້ variations
      "ປິດໃຊ້ສີເຫລືອງ",
      "ປິດໃຊ້ເຫລືອງ",
      "ປິດໃຊ້ສີເຫຼືອງ",
    ],
    mqttCommand: "led_yello_off",
  },

  // Buzzer
  {
    patterns: [
      "ເປີດສຽງ",
      "ເປີດ สຽງ",
      "ເປີດສຽງດັງ",
      "ປີດສຽງ",
      "ເປີດສຽງດັງ",
      // ເປິດໃຊ້ variations
      "ເປິດໃຊ້ສຽງ",
      "ເປີດໃຊ້ສຽງ",
    ],
    mqttCommand: "buzzer_on",
  },
  {
    patterns: [
      "ປິດສຽງ",
      "ປິດ สຽງ",
      "ປິດສຽງດັງ",
      "ບິດສຽງ",
      // ປິດໃຊ້ variations
      "ປິດໃຊ້ສຽງ",
    ],
    mqttCommand: "buzzer_off",
  },
];

/**
 * Match command using Fuzzy Matching
 */
export function matchCommand(
  transcript: string,
  threshold: number = 0.6,
): string | null {
  if (!transcript) return null;

  let bestMatch: { command: string; score: number } | null = null;
  const cleanTranscript = transcript.trim().toLowerCase();

  for (const mapping of COMMAND_MAPPINGS) {
    for (const pattern of mapping.patterns) {
      const similarity = compareTwoStrings(
        cleanTranscript,
        pattern.toLowerCase(),
      );

      if (
        similarity >= threshold &&
        (!bestMatch || similarity > bestMatch.score)
      ) {
        bestMatch = {
          command: mapping.mqttCommand,
          score: similarity,
        };
      }
    }
  }

  if (bestMatch) {
    console.log(
      `🎯 Matched: "${transcript}" → "${bestMatch.command}" (${(bestMatch.score * 100).toFixed(1)}% similarity)`,
    );
    return bestMatch.command;
  }

  console.log(`❌ No match found for: "${transcript}"`);
  return null;
}

/**
 * Match command using Keywords (Fallback method)
 */
export function matchCommandByKeywords(transcript: string): string | null {
  if (!transcript) return null;

  const text = transcript.toLowerCase();
  console.log("🎯 Matching command by keywords:", transcript);
  const isOpen =
    text.includes("ເປີດ") || text.includes("เปิด") || text.includes("ປີດ");
  const isClose =
    text.includes("ປິດ") || text.includes("ปิด") || text.includes("ບິດ");

  if (!isOpen && !isClose) return null;

  // Check colors/devices
  if (
    text.includes("ຂຽວ") ||
    text.includes("เขียว") ||
    text.includes("green") ||
    text.includes("ຄຽວ") ||
    text.includes("ຂີວ")
  ) {
    return isOpen ? "led_green_on" : "led_green_off";
  }

  if (
    text.includes("ຟ້າ") ||
    text.includes("ฟ้า") ||
    text.includes("blue") ||
    text.includes("ຟາ")
  ) {
    return isOpen ? "led_blue_on" : "led_blue_off";
  }

  if (
    text.includes("ເຫລືອງ") ||
    text.includes("เหลือง") ||
    text.includes("yellow") ||
    text.includes("ເລືອງ") ||
    text.includes("ລືອງ") ||
    text.includes("ເຫຼືອງ")
  ) {
    return isOpen ? "led_yello_on" : "led_yello_off";
  }

  if (
    text.includes("สຽງ") ||
    text.includes("เสียง") ||
    text.includes("buzzer")
  ) {
    return isOpen ? "buzzer_on" : "buzzer_off";
  }

  return null;
}

// ========================================
// Status Manager (Adapted for Next.js SSE)
// ========================================

const clients = new Set<ReadableStreamDefaultController>();
let currentStatus: DeviceStatus = {
  buzzer: false,
  led_green: false,
  led_blue: false,
  led_yello: false,
};

function broadcast(status: DeviceStatus): void {
  clients.forEach((client) => sendToClient(client, status));
}

function sendToClient(
  controller: ReadableStreamDefaultController,
  status: DeviceStatus,
): void {
  try {
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));
  } catch (error) {
    console.error("❌ Error sending to client:", error);
    removeClient(controller);
  }
}

export function addClient(controller: ReadableStreamDefaultController): void {
  clients.add(controller);
  console.log(`✅ SSE Client connected. Total: ${clients.size}`);
  console.log("📊 Status from Arduino:", controller);
  sendToClient(controller, currentStatus);
}

export function removeClient(
  controller: ReadableStreamDefaultController,
): void {
  clients.delete(controller);
  console.log(`❌ SSE Client disconnected. Total: ${clients.size}`);
}

export function updateStatus(status: Partial<DeviceStatus>): void {
  currentStatus = { ...currentStatus, ...status };
  console.log("📊 Status updated:", currentStatus);
  broadcast(currentStatus);
}

export function setStatusFromJSON(jsonString: string): void {
  try {
    const status = JSON.parse(jsonString);
    currentStatus = {
      buzzer: status.buzzer === true || status.buzzer === "true",
      led_green: status.led_green === true || status.led_green === "true",
      led_blue: status.led_blue === true || status.led_blue === "true",
      led_yello: status.led_yello === true || status.led_yello === "true",
    };
    console.log("📊 Status from Arduino:", currentStatus);
    broadcast(currentStatus);
  } catch (error) {
    console.error("❌ Error parsing status JSON:", error);
  }
}

export function getCurrentStatus(): DeviceStatus {
  return { ...currentStatus };
}
