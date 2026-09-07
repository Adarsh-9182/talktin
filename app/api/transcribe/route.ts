import { NextResponse } from "next/server";
import { explain, readUpload, transcribe } from "@/lib/audio";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { base64, mimeType, file } = await readUpload(request);
    const text = await transcribe(base64, mimeType);
    return NextResponse.json({ text, filename: file.name, words: text.split(/\s+/).length });
  } catch (error) {
    const { message, status } = explain(error);
    return NextResponse.json({ error: message }, { status });
  }
}
