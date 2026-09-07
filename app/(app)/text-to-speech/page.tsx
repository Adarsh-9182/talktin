"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";
import { DEFAULT_VOICE, VOICES } from "@/lib/voices";

const MAX_CHARACTERS = 5_000;

const PROMPTS = [
  {
    label: "Narrate a story",
    style: "Read this warmly, like a bedtime story",
    text: "In the ancient land of Eldoria, where the skies shimmered and forests whispered secrets to the wind, lived a dragon named Zephyros.",
  },
  {
    label: "Record an ad",
    style: "Read this with bright, confident energy",
    text: "Switching is the easy part. Bring your team over in an afternoon, keep every file where it was, and pay nothing until you are sure.",
  },
  {
    label: "Tell a joke",
    style: "Read this dryly, like you are unimpressed",
    text: "I told my computer I needed a break. Now it will not stop sending me vacation ads.",
  },
  {
    label: "Guide a meditation",
    style: "Read this slowly and gently, with long pauses",
    text: "Let your shoulders drop. Notice the weight of your hands. There is nothing to solve in the next sixty seconds.",
  },
];

interface Clip {
  id: string;
  url: string;
  text: string;
  voice: string;
}

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [style, setStyle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const clipsRef = useRef<Clip[]>([]);

  clipsRef.current = clips;
  // Object URLs outlive the component unless we let them go.
  useEffect(() => () => clipsRef.current.forEach((clip) => URL.revokeObjectURL(clip.url)), []);

  async function generate() {
    if (!text.trim() || generating) return;
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, voice, style }),
      });

      if (!response.ok) {
        const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(message ?? `Generation failed (${response.status})`);
      }

      const url = URL.createObjectURL(await response.blob());
      setClips((previous) => [{ id: crypto.randomUUID(), url, text: text.trim(), voice }, ...previous]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title="Text to Speech"
        subtitle="Type anything, pick a voice, and say how it should be read. 30 voices across 90+ languages."
      />

      <Panel className="mt-8">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, MAX_CHARACTERS))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) generate();
          }}
          placeholder="Start typing or paste text…"
          rows={7}
          className="w-full resize-none bg-transparent p-5 text-[15px] leading-relaxed outline-none placeholder:text-muted/70"
        />

        <div className="border-t border-line px-5 py-3">
          <input
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            placeholder="Direction — e.g. read this slowly, like a documentary narrator"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
          <select
            value={voice}
            onChange={(event) => setVoice(event.target.value)}
            className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] outline-none"
          >
            {VOICES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} — {option.character}
              </option>
            ))}
          </select>

          <span className="text-[12px] text-muted">
            {text.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
          </span>

          <button
            onClick={generate}
            disabled={generating || !text.trim()}
            className="ml-auto rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-35"
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </Panel>

      {error && <ErrorNote message={error} />}

      <div className="mt-5 flex flex-wrap gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => {
              setText(prompt.text);
              setStyle(prompt.style);
            }}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {clips.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-[13px] font-medium text-muted">History</h2>
          <ul className="space-y-3">
            {clips.map((clip) => (
              <li key={clip.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <p className="line-clamp-2 text-[13px] leading-relaxed">{clip.text}</p>
                  <span className="shrink-0 text-[12px] text-muted">{clip.voice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <audio controls src={clip.url} className="h-9 w-full" />
                  <a
                    href={clip.url}
                    download={`talktin-${clip.id.slice(0, 8)}.wav`}
                    className="shrink-0 text-[12px] text-muted transition-colors hover:text-ink"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
