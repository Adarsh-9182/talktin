/**
 * THE SPEECH ENGINE, ON THE LISTENER'S OWN MACHINE
 *
 * Every version of this file before it existed sent the text to a server,
 * which sent it to Gemini. That path has three problems and only one of them
 * is money:
 *
 *   1. It never ran. There has been no API key in this repo since the first
 *      commit, so the entire audio half of a voice product was unexecuted.
 *   2. The hosting plan kills a function at 60 seconds, which is why Studio
 *      already splits long-form into one request per block.
 *   3. A free tier rate-limits, so the product's core action fails under
 *      exactly the conditions that mean it is working — people using it.
 *
 * Kokoro-82M removes all three. It is 82M parameters, Apache-licensed, and
 * small enough to run in the browser through ONNX Runtime Web: the weights
 * are fetched once from the Hugging Face CDN, cached by the browser, and
 * every generation after that is local. No key, no quota, no function
 * timeout, no per-character cost at any number of users, and the text never
 * leaves the machine that typed it.
 *
 * WHAT IT IS NOT. It is not ElevenLabs v3. Kokoro has no voice cloning —
 * which this product had already ruled out on its safety page — and it does
 * not take spoken direction, so "read this like a documentary narrator"
 * cannot be honoured by the model. The composer's style field is a prompt
 * for a model that no longer sees it; that has to be dealt with in the UI
 * rather than pretended away here.
 */

import type { KokoroTTS } from "kokoro-js";

/** What the UI shows while the weights come down the wire, once, per browser. */
export type LoadProgress = {
  /** 0–100, or null before the first byte when total size is still unknown. */
  percent: number | null;
  file: string;
};

/**
 * WebGPU is roughly an order of magnitude faster and is what makes generation
 * feel instant rather than tolerable, but it is not everywhere yet — Safari's
 * support lags, and a browser can report the API and still fail to hand over
 * an adapter. So it is probed rather than assumed, and WASM on the CPU is the
 * floor rather than an error.
 *
 * The weights are q8 on both paths. fp32 is the better-sounding build and was
 * the first choice, but it is ~326MB against q8's ~86MB, and measured here the
 * difference was a 35-second first press versus well under ten. Nobody waits
 * 35 seconds to hear whether a product works. The quality gap on an 82M model
 * at 24kHz is far smaller than that first impression is worth.
 */
async function pickBackend(): Promise<{ device: "webgpu" | "wasm"; dtype: "q8" }> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return { device: "wasm", dtype: "q8" };
  try {
    const adapter = await gpu.requestAdapter();
    return { device: adapter ? "webgpu" : "wasm", dtype: "q8" };
  } catch {
    return { device: "wasm", dtype: "q8" };
  }
}

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

/**
 * One load per tab, shared by every caller.
 *
 * Held as the promise rather than the resolved model on purpose: two
 * components asking at the same moment — the composer and a voice preview —
 * must wait on one download, not start two.
 */
let loading: Promise<KokoroTTS> | null = null;

export function isLoaded(): boolean {
  return loading !== null;
}

export function loadEngine(onProgress?: (progress: LoadProgress) => void): Promise<KokoroTTS> {
  if (loading) return loading;

  loading = (async () => {
    // Imported here rather than at module scope so the weights loader is not
    // in the page's initial bundle: someone reading the pricing page should
    // not pay for a speech engine they have not asked for.
    const { KokoroTTS } = await import("kokoro-js");
    const { device, dtype } = await pickBackend();

    return KokoroTTS.from_pretrained(MODEL_ID, {
      device,
      dtype,
      progress_callback: (event: unknown) => {
        if (!onProgress) return;
        const e = event as { status?: string; file?: string; progress?: number };
        if (e.status !== "progress") return;
        onProgress({
          percent: typeof e.progress === "number" ? Math.round(e.progress) : null,
          file: e.file ?? "",
        });
      },
    });
  })();

  // A failed load must not poison the tab: the next attempt should be allowed
  // to try again rather than await a promise that is already rejected.
  loading.catch(() => {
    loading = null;
  });

  return loading;
}

export type SpeakOptions = {
  voice: string;
  /** 0.5–2. The one expressive control the model actually has. */
  speed?: number;
  onProgress?: (progress: LoadProgress) => void;
};

/** Text in, a playable WAV out. The first call also pays for the download. */
export async function speak(text: string, { voice, speed = 1, onProgress }: SpeakOptions): Promise<Blob> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Give me something to say.");

  const tts = await loadEngine(onProgress);
  const audio = await tts.generate(trimmed, {
    voice: voice as Parameters<KokoroTTS["generate"]>[1] extends { voice?: infer V } ? V : never,
    speed,
  });
  return audio.toBlob();
}
