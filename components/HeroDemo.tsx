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

export function HeroDemo() {
  const [line, setLine] = useState(0);
  const [voice, setVoice] = useState(PICKS[0]!);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
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
      const blob = await speak(LINES[line]!.text, { voice, speed: LINES[line]!.speed });

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
          {state === "loading" ? "Generating…" : state === "playing" ? "❙❙ Pause" : "▶ Play"}
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

      {error && <p className="mt-3 text-[12.5px] text-red-600">{error}</p>}
    </div>
  );
}
