import { BadRequest, explain, readUpload, speak, transcribe, translate } from "@/lib/audio";
import { languageLabel } from "@/lib/languages";
import { guard } from "@/lib/limit";
import { DEFAULT_VOICE, findVoice } from "@/lib/voices";
import { pcmToWav } from "@/lib/wav";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Dubbing takes three model calls and the better part of a minute, so it
 * reports progress as newline-delimited JSON instead of going quiet and
 * returning everything at the end. The client can then show which stage is
 * actually running rather than guessing from a timer.
 */
type Event =
  | { stage: "transcribing" }
  | { stage: "translating"; transcript: string }
  | { stage: "speaking"; translation: string }
  | { stage: "done"; audio: string; language: string; voice: string }
  | { stage: "failed"; error: string };

export async function POST(request: Request) {
  let language: string | undefined;
  let voice = DEFAULT_VOICE;
  let base64: string;
  let mimeType: string;

  // Validation happens before the stream opens, so a bad request still gets a
  // plain status code rather than a 200 carrying an error event.
  try {
    const upload = await readUpload(request);
    base64 = upload.base64;
    mimeType = upload.mimeType;

    language = languageLabel(String(upload.form.get("language") ?? ""));
    if (!language) throw new BadRequest("Pick a language to dub into.");
    voice = findVoice(String(upload.form.get("voice") ?? ""))?.id ?? DEFAULT_VOICE;
  } catch (error) {
    const { message, status } = explain(error);
    return Response.json({ error: message }, { status });
  }

  const limited = guard(request, "dub");
  if (limited) return limited;

  const target = language;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        send({ stage: "transcribing" });
        const transcript = await transcribe(base64, mimeType);

        send({ stage: "translating", transcript });
        const translation = await translate(transcript, target);

        send({ stage: "speaking", translation });
        const wav = pcmToWav(await speak(translation, voice));

        send({ stage: "done", audio: wav.toString("base64"), language: target, voice });
      } catch (error) {
        // The response is already a 200 by now, so failures have to arrive as
        // an event; the client reads this exactly like a non-200 body.
        send({ stage: "failed", error: explain(error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      // Proxies that buffer would defeat the point of streaming at all.
      "x-accel-buffering": "no",
    },
  });
}
