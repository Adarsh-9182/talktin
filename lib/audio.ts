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

const MAX_ATTEMPTS = 4;

/**
 * Retries rate limits and transient server errors with exponential backoff.
 *
 * On a free tier a 429 means "wait", not "this request was wrong", and the two
 * are worth separating: dubbing spends a transcription and a translation before
 * it ever asks for speech, so failing the third call outright throws away two
 * successful ones.
 */
export interface RetryOptions {
  maxAttempts?: number;
  /** Injectable so tests can assert the backoff without waiting for it. */
  wait?: (milliseconds: number) => Promise<void>;
}

export async function retryProvider<T>(work: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const wait = options.wait ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  let last: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await work();
    } catch (error) {
      last = error;
      if (!isTransient(error) || attempt === maxAttempts - 1) throw error;
      // Jittered, so parallel callers do not all retry on the same tick.
      await wait(Math.min(1_000 * 2 ** attempt, 15_000) + Math.random() * 400);
    }
  }

  throw last;
}

/** Exported for tests: the judgement call that decides whether to retry at all. */
export { isTransient };

function isTransient(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  if (typeof status === "number") return status === 429 || status >= 500;
  const message = String((error as Error)?.message ?? error);
  return /\b(429|5\d\d)\b|rate.?limit|quota|overloaded|unavailable|timeout/i.test(message);
}

export function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server.");
  return new GoogleGenAI({ apiKey });
}

/** Turns a thrown provider error into something a person can act on. */
export function explain(error: unknown): { message: string; status: number } {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof BadRequest) return { message, status: 400 };
  // 503, not 500. A missing key is a deployment that was never configured for
  // this half of the product, which is a different thing from a server that
  // broke — and the three pages that need one now say so before you get here.
  if (/GEMINI_API_KEY/.test(message)) return { message, status: 503 };
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
  const response = await retryProvider(() =>
    client().models.generateContent({
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
    }),
  );

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
  const response = await retryProvider(() =>
    client().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      systemInstruction:
        `Translate the user's transcript into ${language}. Keep the speaker labels, the tone, ` +
        "and roughly the same spoken length, so it still fits the original timing. Idiom should " +
        "sound native rather than literal. Return only the translation, with no notes or quotes.",
    },
    }),
  );

  const translated = response.text?.trim();
  if (!translated) throw new Error("The translation came back empty.");
  return translated;
}

/** Generates speech and returns raw PCM, ready to be wrapped as a WAV. */
export async function speak(text: string, voice: string): Promise<Buffer> {
  const response = await retryProvider(() =>
    client().models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
    }),
  );

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("The model returned no audio.");
  return Buffer.from(base64, "base64");
}
