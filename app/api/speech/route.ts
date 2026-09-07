import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { DEFAULT_VOICE, findVoice } from "@/lib/voices";
import { pcmToWav } from "@/lib/wav";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARACTERS = 5_000;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set on the server." }, { status: 500 });
  }

  let body: { text?: unknown; voice?: unknown; style?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Give me something to say." }, { status: 400 });
  if (text.length > MAX_CHARACTERS) {
    return NextResponse.json(
      { error: `That's ${text.length} characters. The limit is ${MAX_CHARACTERS}.` },
      { status: 400 },
    );
  }

  const voice = findVoice(typeof body.voice === "string" ? body.voice : "")?.id ?? DEFAULT_VOICE;
  const style = typeof body.style === "string" ? body.style.trim().slice(0, 200) : "";

  // The model takes direction in the prompt itself, which is how "read this
  // sarcastically" reaches it — there is no separate emotion parameter.
  const prompt = style ? `${style}: ${text}` : text;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });

    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) {
      return NextResponse.json({ error: "The model returned no audio. Try rewording the text." }, { status: 502 });
    }

    const wav = pcmToWav(Buffer.from(base64, "base64"));
    return new NextResponse(new Uint8Array(wav), {
      headers: {
        "content-type": "audio/wav",
        "content-length": String(wav.length),
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // A quota error is a wait, not a bad request — say so plainly.
    const rateLimited = /\b429\b|quota|rate.?limit/i.test(message);
    return NextResponse.json(
      { error: rateLimited ? "Free-tier quota reached. Wait a minute and try again." : message },
      { status: rateLimited ? 429 : 502 },
    );
  }
}
