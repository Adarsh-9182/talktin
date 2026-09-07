import { NextResponse } from "next/server";
import { guard } from "@/lib/limit";
import { explain, readUpload, transcribe } from "@/lib/audio";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { base64, mimeType, file } = await readUpload(request);
    // Counted here rather than at the top of the handler: a malformed
    // request costs nothing, so it should not spend the caller's budget.
    const limited = guard(request, "transcribe");
    if (limited) return limited;

    const text = await transcribe(base64, mimeType);
    return NextResponse.json({ text, filename: file.name, words: text.split(/\s+/).length });
  } catch (error) {
    const { message, status } = explain(error);
    return NextResponse.json({ error: message }, { status });
  }
}
