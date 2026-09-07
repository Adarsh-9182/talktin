import { GoogleGenAI } from "@google/genai";

/** Inline request payloads are capped well below this, but audio gets large fast. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const ACCEPTED_AUDIO = [
  "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a",
  "audio/x-m4a", "audio/aac", "audio/ogg", "audio/webm", "audio/flac",
  "video/mp4", "video/webm", "video/quicktime",
];

/** A problem with what the caller sent, rather than with the provider. */
export class BadRequest extends Error {}

export function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server.");
  return new GoogleGenAI({ apiKey });
}

/** Turns a thrown provider error into something a person can act on. */
export function explain(error: unknown): { message: string; status: number } {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof BadRequest) return { message, status: 400 };
  if (/GEMINI_API_KEY/.test(message)) return { message, status: 500 };
  if (/\b429\b|quota|rate.?limit/i.test(message)) {
    return { message: "Free-tier quota reached. Wait a minute and try again.", status: 429 };
  }
  return { message, status: 502 };
}

/**
 * Reads the uploaded file off a multipart form, checking the things that
 * otherwise fail deep inside the provider with an unhelpful message.
 */
export async function readUpload(request: Request, field = "file") {
  const form = await request.formData();
  const file = form.get(field);
  if (!(file instanceof File)) throw new BadRequest("Attach an audio or video file.");
  if (file.size === 0) throw new BadRequest("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new BadRequest(`That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 15MB.`);
  }

  // Browsers sometimes send an empty or generic type; fall back to the extension.
  const mimeType = ACCEPTED_AUDIO.includes(file.type)
    ? file.type
    : guessMime(file.name) ?? file.type;
  if (!mimeType) throw new BadRequest("Could not tell what kind of file that is.");

  return {
    form,
    file,
    mimeType,
    base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
  };
}

const EXTENSIONS: Record<string, string> = {
  wav: "audio/wav", mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac",
  ogg: "audio/ogg", opus: "audio/ogg", flac: "audio/flac", webm: "audio/webm",
  mp4: "video/mp4", mov: "video/quicktime",
};

export function guessMime(filename: string): string | undefined {
  return EXTENSIONS[filename.split(".").pop()?.toLowerCase() ?? ""];
}

/** Asks the model for a plain transcript — no commentary, no markdown. */
export async function transcribe(base64: string, mimeType: string): Promise<string> {
  const response = await client().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          {
            text:
              "Transcribe this recording word for word. Return only the transcript text. " +
              "If more than one person speaks, prefix each turn with a speaker label like 'Speaker 1:'. " +
              "Do not summarise, translate, add timestamps, or wrap the result in code fences.",
          },
        ],
      },
    ],
  });

  const text = response.text?.trim();
  if (!text) throw new BadRequest("No speech was found in that file.");
  return text;
}

/**
 * Translates a transcript for dubbing. The instruction leans on keeping the
 * length close to the original, because a translation that runs twice as long
 * as the source no longer fits the video it came from.
 */
export async function translate(text: string, language: string): Promise<string> {
  const response = await client().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      systemInstruction:
        `Translate the user's transcript into ${language}. Keep the speaker labels, the tone, ` +
        "and roughly the same spoken length, so it still fits the original timing. Idiom should " +
        "sound native rather than literal. Return only the translation, with no notes or quotes.",
    },
  });

  const translated = response.text?.trim();
  if (!translated) throw new Error("The translation came back empty.");
  return translated;
}

/** Generates speech and returns raw PCM, ready to be wrapped as a WAV. */
export async function speak(text: string, voice: string): Promise<Buffer> {
  const response = await client().models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  });

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("The model returned no audio.");
  return Buffer.from(base64, "base64");
}
