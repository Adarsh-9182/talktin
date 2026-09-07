"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, PageHeader } from "@/components/Page";
import { VOICES } from "@/lib/voices";

const SAMPLE = "Hello — this is what I sound like. I can read anything you write, in any tone you ask for.";

export default function Voices() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One element for the whole page, so starting a preview stops the last one.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Previews cost a request each, so keep the ones already generated.
  const cache = useRef(new Map<string, string>());

  useEffect(() => {
    const urls = cache.current;
    return () => {
      audioRef.current?.pause();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function preview(voice: string) {
    setError(null);
    audioRef.current?.pause();

    if (playing === voice) {
      setPlaying(null);
      return;
    }

    let url = cache.current.get(voice);
    if (!url) {
      setLoading(voice);
      try {
        const response = await fetch("/api/speech", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: SAMPLE, voice }),
        });
        if (!response.ok) {
          const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(message ?? `Preview failed (${response.status})`);
        }
        url = URL.createObjectURL(await response.blob());
        cache.current.set(voice, url);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
        return;
      } finally {
        setLoading(null);
      }
    }

    const audio = (audioRef.current ??= new Audio());
    audio.src = url;
    audio.onended = () => setPlaying(null);
    setPlaying(voice);
    void audio.play().catch(() => setPlaying(null));
  }

  const term = query.trim().toLowerCase();
  const shown = term
    ? VOICES.filter((v) => `${v.name} ${v.character}`.toLowerCase().includes(term))
    : VOICES;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-24 pt-10">
      <PageHeader
        title="Voices"
        subtitle="Thirty prebuilt voices. Play one to hear it before you write a word."
      />

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or character — try “warm”"
        className="mt-8 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[14px] outline-none placeholder:text-muted/70"
      />

      {error && <ErrorNote message={error} />}

      {shown.length === 0 ? (
        <p className="mt-10 text-[14px] text-muted">No voice matches “{query.trim()}”.</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((voice) => {
            const isPlaying = playing === voice.id;
            const isLoading = loading === voice.id;
            return (
              <li key={voice.id}>
                <button
                  onClick={() => preview(voice.id)}
                  aria-label={`Preview ${voice.name}`}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-ink/25"
                >
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] ${
                      isPlaying ? "bg-ink text-white" : "bg-canvas text-ink"
                    }`}
                  >
                    {isLoading ? "···" : isPlaying ? "❙❙" : "▶"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{voice.name}</span>
                    <span className="block text-[12.5px] text-muted">{voice.character}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
