import { NextResponse } from "next/server";
import { BadRequest, explain, readUpload, speak, transcribe, translate } from "@/lib/audio";
import { languageLabel } from "@/lib/languages";
import { DEFAULT_VOICE, findVoice } from "@/lib/voices";
import { pcmToWav } from "@/lib/wav";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { form, base64, mimeType, file } = await readUpload(request);

    const language = languageLabel(String(form.get("language") ?? ""));
    if (!language) throw new BadRequest("Pick a language to dub into.");
    const voice = findVoice(String(form.get("voice") ?? ""))?.id ?? DEFAULT_VOICE;

    // Three steps, deliberately sequential: each one needs the last one's words.
    const transcript = await transcribe(base64, mimeType);
    const translation = await translate(transcript, language);
    const wav = pcmToWav(await speak(translation, voice));

    return NextResponse.json({
      filename: file.name,
      language,
      voice,
      transcript,
      translation,
      audio: wav.toString("base64"),
    });
  } catch (error) {
    const { message, status } = explain(error);
    return NextResponse.json({ error: message }, { status });
  }
}
