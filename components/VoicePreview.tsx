"use client";

import { useEffect, useRef, useState } from "react";

/** Plays one line in one voice. Used on a voice's own page. */
export function VoicePreview({ voice, lines }: { voice: string; lines: { label: string; text: string; style?: string }[] }) {
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cache = useRef(new Map<number, string>());

  useEffect(() => {
    const urls = cache.current;
    return () => {
      audioRef.current?.pause();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function play() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setError(null);
    let url = cache.current.get(index);

    if (!url) {
      setState("loading");
      try {
        const response = await fetch("/api/speech", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...lines[index]!, voice }),
        });
        if (!response.ok) {
          const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(message ?? "Could not generate that just now.");
        }
        url = URL.createObjectURL(await response.blob());
        cache.current.set(index, url);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
        setState("idle");
        return;
      }
    }

    const audio = (audioRef.current ??= new Audio());
    audio.src = url;
    audio.onended = () => setState("idle");
    await audio.play().catch(() => setState("idle"));
    setState("playing");
  }

  return (
    <div className="rounded-2xl border border-line bg-canvas p-5">
      <div className="flex flex-wrap gap-2">
        {lines.map((line, position) => (
          <button
            key={line.label}
            onClick={() => {
              audioRef.current?.pause();
              setState("idle");
              setIndex(position);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
              position === index ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {line.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[15px] leading-relaxed">{lines[index]!.text}</p>

      <button
        onClick={play}
        disabled={state === "loading"}
        className="mt-5 rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
      >
        {state === "loading" ? "Generating…" : state === "playing" ? "❙❙ Pause" : "▶ Play"}
      </button>

      {error && <p className="mt-3 text-[12.5px] text-red-600">{error}</p>}
    </div>
  );
}
