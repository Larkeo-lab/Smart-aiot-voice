import { addClient, removeClient } from "@src/features/mqtt/mqtt.helper";
import { initializeMQTT } from "@src/features/mqtt/mqtt.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Ensure MQTT is running
  initializeMQTT().catch(console.error);

  const customReadable = new ReadableStream({
    start(controller) {
      addClient(controller);

      // Keep-alive or initial data
      // controller.enqueue(encoder.encode('data: {"status":"connected"}\n\n'));
    },
    cancel(controller) {
      removeClient(controller);
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
