"use client";

import { useEffect, useRef, useState } from "react";
import { VOICES } from "@/lib/voices";

const LINES = [
  { style: "Read this warmly, like a storyteller", text: "In the ancient land of Eldoria, the skies shimmered and the forests kept their secrets." },
  { style: "Read this dryly, like you are unimpressed", text: "I told my computer I needed a break. Now it will not stop sending me holiday adverts." },
  { style: "Read this slowly and gently", text: "Let your shoulders drop. There is nothing to solve in the next sixty seconds." },
];

const PICKS = ["Achird", "Sulafat", "Charon", "Leda", "Algenib"];

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
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...LINES[line]!, voice }),
      });
      if (!response.ok) {
        const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(message ?? "Could not generate that just now.");
      }

      const url = URL.createObjectURL(await response.blob());
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
      <p className="mt-2 text-[12.5px] text-muted">{current.style}</p>

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
