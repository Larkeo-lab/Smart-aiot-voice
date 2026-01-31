import { NextRequest, NextResponse } from "next/server";
import { transcribeAudioService } from "@src/features/speech-to-text/speech.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file uploaded" },
        { status: 400 },
      );
    }

    console.log(`ไฟล์: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Buffer processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine audio encoding based on file type
    let encoding: "LINEAR16" | "WEBM_OPUS" = "LINEAR16";
    // Check by mimetype or extension
    if (file.type.includes("webm") || file.name.endsWith(".webm")) {
      encoding = "WEBM_OPUS";
    }

    // Call the transcription service
    const transcription = await transcribeAudioService(
      file.name,
      buffer,
      encoding,
    );

    // Send success response
    return NextResponse.json({
      status: "success",
      data: { transcription },
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio." },
      { status: 500 },
    );
  }
}
