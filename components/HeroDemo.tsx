"use client";

import { useEffect, useRef, useState } from "react";
import { VOICES } from "@/lib/voices";
import { speak } from "@/lib/kokoro";

const LINES = [
  { speed: 0.95, text: "In the ancient land of Eldoria, the skies shimmered and the forests kept their secrets." },
  { speed: 1, text: "I told my computer I needed a break. Now it will not stop sending me holiday adverts." },
  { speed: 0.8, text: "Let your shoulders drop. There is nothing to solve in the next sixty seconds." },
];

/*
 * The demo picks from the top of the catalogue, not across it. These are the
 * four voices the model author grades B- or better; the rest are in the
 * picker for people who go looking, but the one line a visitor hears before
 * deciding whether this product works should not be a D.
 *
 * The previous list — Achird, Sulafat, Charon — named Gemini voices that no
 * longer exist in VOICES, so the selector was choosing ids the engine would
 * have rejected even if the endpoint behind it had ever answered.
 */
const PICKS = ["af_heart", "af_bella", "af_nicole", "bf_emma"];

/**
 * What one generation actually cost the network, read off the browser's own
 * resource timeline rather than asserted in marketing copy.
 *
 * The claim this page makes — that the text never leaves the machine — is the
 * kind of thing every product says and nobody can check. So it is measured
 * here instead: every resource entry the browser records between the start
 * and end of a generation is counted. The first press downloads the model and
 * honestly says so. The second press is zero, and a visitor who does not
 * believe it can open DevTools, or pull the Wi-Fi, and get the same answer.
 *
 * Byte counts are deliberately not shown. transferSize is zeroed for
 * cross-origin responses without Timing-Allow-Origin, and the CDN the weights
 * come from does not send one, so a byte figure here would read as "0 bytes"
 * during an 80MB download. A request count has no such hole.
 */
type Cost = { requests: number; ms: number };

async function measure<T>(work: () => Promise<T>): Promise<[T, Cost | null]> {
  // Older Safari has no resource timeline; the demo still works, it just
  // cannot make the claim, and an unproven claim is not shown at all.
  if (typeof performance?.getEntriesByType !== "function") return [await work(), null];

  const before = performance.getEntriesByType("resource").length;
  const started = performance.now();
  const result = await work();

  return [
    result,
    {
      requests: performance.getEntriesByType("resource").length - before,
      ms: Math.round(performance.now() - started),
    },
  ];
}

export function HeroDemo() {
  const [line, setLine] = useState(0);
  const [voice, setVoice] = useState(PICKS[0]!);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
  /** Percent of the one-time weight download, or null when nothing is loading. */
  const [load, setLoad] = useState<number | null>(null);
  const [cost, setCost] = useState<Cost | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  async function play() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const [blob, measured] = await measure(() =>
        speak(LINES[line]!.text, {
          voice,
          speed: LINES[line]!.speed,
          onProgress: (progress) => setLoad(progress.percent),
        }),
      );
      setLoad(null);
      setCost(measured);

      const url = URL.createObjectURL(blob);
      const audio = (audioRef.current ??= new Audio());
      audio.src = url;
      audio.onended = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
      setState("playing");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setLoad(null);
      setState("idle");
    }
  }

  const current = LINES[line]!;

  return (
    <div className="rounded-2xl border border-line bg-canvas p-5">
      <p className="text-[15px] leading-relaxed">{current.text}</p>
      <p className="mt-2 text-[12.5px] text-muted">Generated in your browser · {current.speed.toFixed(2)}× speed</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={play}
          disabled={state === "loading"}
          className="rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
        >
          {state !== "loading"
            ? state === "playing"
              ? "❙❙ Pause"
              : "▶ Play"
            : load !== null
              ? `Loading voice… ${load}%`
              : "Generating…"}
        </button>

        <select
          value={voice}
            aria-label="Voice"
          onChange={(event) => setVoice(event.target.value)}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] outline-none"
        >
          {PICKS.map((id) => {
            const match = VOICES.find((candidate) => candidate.id === id);
            return (
              <option key={id} value={id}>
                {match?.name} — {match?.character}
              </option>
            );
          })}
        </select>

        <button
          onClick={() => {
            audioRef.current?.pause();
            setState("idle");
            setLine((previous) => (previous + 1) % LINES.length);
          }}
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
        >
          Another line
        </button>
      </div>

      {/*
        The receipt. Shown only once there is a real measurement to show —
        a number the browser produced, not a promise this page made.
      */}
      {cost && (
        <p aria-live="polite" className="mt-4 border-t border-line pt-3 font-mono text-[11.5px] text-muted">
          {cost.requests === 0
            ? `${cost.ms}ms · 0 network requests · nothing left this machine`
            : `${cost.ms}ms · ${cost.requests} requests to fetch the model, once · the next one is 0`}
        </p>
      )}

      {error && <p className="mt-3 text-[12.5px] text-red-600">{error}</p>}
    </div>
  );
}
