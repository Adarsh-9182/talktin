import { NextResponse } from "next/server";
import { BadRequest, explain, speak } from "@/lib/audio";
import { DEFAULT_VOICE, findVoice } from "@/lib/voices";
import { pcmToWav } from "@/lib/wav";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARACTERS = 5_000;

export async function POST(request: Request) {
  try {
    // Validate before touching the provider, so a caller with a bad request
    // is told what to fix rather than what our server is missing.
    const body = (await request.json().catch(() => null)) as
      | { text?: unknown; voice?: unknown; style?: unknown }
      | null;
    if (!body) throw new BadRequest("Expected a JSON body.");

    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) throw new BadRequest("Give me something to say.");
    if (text.length > MAX_CHARACTERS) {
      throw new BadRequest(`That's ${text.length} characters. The limit is ${MAX_CHARACTERS}.`);
    }

    const voice = findVoice(typeof body.voice === "string" ? body.voice : "")?.id ?? DEFAULT_VOICE;
    const style = typeof body.style === "string" ? body.style.trim().slice(0, 200) : "";

    // The model takes direction in the prompt itself — there is no separate
    // emotion parameter — so "read this sarcastically" is prepended to the text.
    const wav = pcmToWav(await speak(style ? `${style}: ${text}` : text, voice));

    return new NextResponse(new Uint8Array(wav), {
      headers: {
        "content-type": "audio/wav",
        "content-length": String(wav.length),
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const { message, status } = explain(error);
    return NextResponse.json({ error: message }, { status });
  }
}
