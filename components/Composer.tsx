"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ErrorNote, Panel } from "@/components/Page";
import { saveAsset } from "@/lib/assets";
import { clearDraft, loadDraft, saveDraft, type Draft } from "@/lib/draft";
import { TEMPLATES, findTemplate } from "@/lib/templates";
import { DEFAULT_VOICE, VOICES, findVoice } from "@/lib/voices";

const MAX_CHARACTERS = 5_000;

/** Tools that take you elsewhere, shown as tabs beside the one you are using. */
const TABS = [
  { href: "/speech-to-text", label: "Speech to Text" },
  { href: "/dubbing", label: "Dubbing" },
  { href: "/studio", label: "Studio" },
  { href: "/agents", label: "Agents" },
];

interface Clip {
  id: string;
  url: string;
  text: string;
  voice: string;
}

function ComposerScreen({ start, restored }: { start: Draft; restored: boolean }) {
  const [text, setText] = useState(start.text);
  const [style, setStyle] = useState(start.style);
  const [voice, setVoice] = useState(start.voice);
  const [dismissed, setDismissed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);

  // Debounced, because writing on every keystroke is a lot of serialising for
  // something only read once, on the next visit.
  useEffect(() => {
    const timer = setTimeout(() => saveDraft({ text, style, voice }), 400);
    return () => clearTimeout(timer);
  }, [text, style, voice]);

  // Every object URL is recorded when it is created, inside the handler, so the
  // unmount cleanup has the full list. Revoking any earlier would kill a player
  // that is still on screen.
  const urlsRef = useRef<string[]>([]);
  useEffect(() => () => urlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

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

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      setClips((previous) => [{ id: crypto.randomUUID(), url, text: text.trim(), voice }, ...previous]);

      // Saving is a convenience, so a storage failure must not lose the clip
      // that is already playing on screen.
      void saveAsset({ kind: "speech", title: text.trim().slice(0, 90), voice, blob }).catch(() => undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setGenerating(false);
    }
  }

  const selected = findVoice(voice);

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white">
          Speech
        </span>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Panel>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, MAX_CHARACTERS))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) generate();
          }}
          placeholder="Start typing or paste text…"
          rows={8}
          className="w-full resize-none bg-transparent p-5 text-[15px] leading-relaxed outline-none placeholder:text-muted/70"
        />

        {restored && !dismissed && text.trim() && (
          <div className="flex items-center gap-3 px-5 pb-3 text-[12px] text-muted">
            <span>Picked up where you left off.</span>
            <button
              onClick={() => {
                setText("");
                setStyle("");
                setDismissed(true);
                clearDraft();
              }}
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              Clear
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {TEMPLATES.slice(0, 4).map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setText(option.text);
                setStyle(option.style);
                setVoice(option.voice);
                setDismissed(true);
              }}
              className="rounded-full border border-line px-3 py-1 text-[12.5px] text-muted transition-colors hover:text-ink"
            >
              {option.name}
            </button>
          ))}
        </div>

        <div className="border-t border-line px-5 py-3">
          <input
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            placeholder="Direction — e.g. read this slowly, like a documentary narrator"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
          <span className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-muted">
            gemini-2.5-flash-tts
          </span>

          <select
            value={voice}
            aria-label="Voice"
            onChange={(event) => setVoice(event.target.value)}
            className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] outline-none"
          >
            {VOICES.map((option) => (
              <option key={option.id} value={option.id}>{option.name} — {option.character}</option>
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
            {generating ? "Generating…" : "Generate ↑"}
          </button>
        </div>
      </Panel>

      {error && <ErrorNote message={error} />}

      {clips.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-[13px] font-medium text-muted">
            This session · also saved to <Link href="/assets" className="underline underline-offset-2">Assets</Link>
          </h2>
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

      <p className="mt-8 text-[12px] text-muted">
        Speaking as {selected?.name} · {selected?.character.toLowerCase()}
      </p>
    </>
  );
}

/** Never changes, so the store never notifies; this only distinguishes server from client. */
const subscribe = () => () => {};

/**
 * localStorage cannot be read while rendering on the server, and reading it in
 * an effect would set state a render too late. So the composer renders once
 * with server-safe values, and once hydration has happened it remounts under a
 * new key with whatever draft was left behind.
 */
export function Composer({ template, voice: initialVoice }: { template?: string; voice?: string }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const preset = template ? findTemplate(template) : undefined;

  const fallback: Draft = {
    text: preset?.text ?? "",
    style: preset?.style ?? "",
    voice: findVoice(initialVoice ?? "")?.id ?? preset?.voice ?? DEFAULT_VOICE,
  };

  // A template or voice in the URL is an explicit request and outranks a draft.
  const draft = hydrated && !preset && !initialVoice ? loadDraft() : null;
  const start: Draft = draft
    ? { text: draft.text, style: draft.style, voice: findVoice(draft.voice)?.id ?? fallback.voice }
    : fallback;

  return <ComposerScreen key={hydrated ? "client" : "server"} start={start} restored={draft !== null} />;
}
