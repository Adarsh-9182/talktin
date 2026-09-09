"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { speak } from "@/lib/kokoro";
import { ErrorNote, Panel } from "@/components/Page";
import { saveAsset } from "@/lib/assets";
import { clearDraft, loadDraft, saveDraft, type Draft } from "@/lib/draft";
import { TEMPLATES, findTemplate } from "@/lib/templates";
import { DEFAULT_VOICE, VOICES, findVoice } from "@/lib/voices";
import { MAX_SHARED_CHARACTERS, shareUrl } from "@/lib/share";

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
  speed: number;
}

/**
 * Copies a link that carries the words in its fragment, so sharing a sentence
 * does not upload it. Falls back to selecting nothing and saying so, rather
 * than pretending: clipboard access is refused outright in some contexts, and
 * a button that silently did nothing would be the worst outcome here.
 */
function ShareButton({ clip }: { clip: Clip }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const tooLong = clip.text.length > MAX_SHARED_CHARACTERS;

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        shareUrl(window.location.origin, { text: clip.text, voice: clip.voice, speed: clip.speed }),
      );
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      onClick={() => void copy()}
      title={
        tooLong
          ? `Only the first ${MAX_SHARED_CHARACTERS} characters travel in a link.`
          : "A link that plays this sentence. The words ride in the fragment, so they are never uploaded."
      }
      className="shrink-0 text-[12px] text-muted transition-colors hover:text-ink"
    >
      {failed ? "Copy blocked" : copied ? "Link copied" : tooLong ? "Copy link (first part)" : "Copy link"}
    </button>
  );
}

function ComposerScreen({ start, restored }: { start: Draft; restored: boolean }) {
  const [text, setText] = useState(start.text);
  const [speed, setSpeed] = useState(start.speed);
  const [voice, setVoice] = useState(start.voice);
  const [dismissed, setDismissed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Percent of the one-time model download, or null when nothing is loading. */
  const [load, setLoad] = useState<number | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);

  // Debounced, because writing on every keystroke is a lot of serialising for
  // something only read once, on the next visit.
  useEffect(() => {
    const timer = setTimeout(() => saveDraft({ text, speed, voice }), 400);
    return () => clearTimeout(timer);
  }, [text, speed, voice]);

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
      // Generated here rather than at /api/speech. The engine is a 82M-parameter
      // model running in this tab, so there is no request to fail, no quota to
      // exhaust and no 60-second function ceiling to split long text around.
      // The first call downloads the weights; setLoad reports that once.
      const blob = await speak(text, {
        voice,
        speed,
        onProgress: (progress) => setLoad(progress.percent),
      });
      setLoad(null);
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      setClips((previous) => [{ id: crypto.randomUUID(), url, text: text.trim(), voice, speed }, ...previous]);

      // Saving is a convenience, so a storage failure must not lose the clip
      // that is already playing on screen.
      void saveAsset({ kind: "speech", title: text.trim().slice(0, 90), voice, blob }).catch(() => undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setLoad(null);
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
                setSpeed(1);
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
                setSpeed(option.speed);
                setVoice(option.voice);
                setDismissed(true);
              }}
              className="rounded-full border border-line px-3 py-1 text-[12.5px] text-muted transition-colors hover:text-ink"
            >
              {option.name}
            </button>
          ))}
        </div>

        {/*
          This was a free-text "Direction" field, which worked by prepending
          "read this like a documentary narrator" to the text for a model that
          took performance notes in the prompt. Kokoro has no equivalent input,
          so keeping the field would have been a control that silently did
          nothing. Speed is what the model actually exposes, so speed is what
          is offered.
        */}
        <div className="flex items-center gap-3 border-t border-line px-5 py-3">
          <label htmlFor="speed" className="text-[13px] text-muted">Speed</label>
          <input
            id="speed"
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="h-1 flex-1 accent-ink"
          />
          <span className="w-12 text-right font-mono text-[12px] text-muted tabular-nums">
            {speed.toFixed(2)}×
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
          <span className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-muted">
            kokoro-82m · on-device
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
            {!generating
              ? "Generate ↑"
              : load !== null
                ? `Loading voice… ${load}%`
                : "Generating…"}
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
                  <ShareButton clip={clip} />
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
    speed: preset?.speed ?? 1,
    voice: findVoice(initialVoice ?? "")?.id ?? preset?.voice ?? DEFAULT_VOICE,
  };

  // A template or voice in the URL is an explicit request and outranks a draft.
  const draft = hydrated && !preset && !initialVoice ? loadDraft() : null;
  const start: Draft = draft
    ? { text: draft.text, speed: draft.speed, voice: findVoice(draft.voice)?.id ?? fallback.voice }
    : fallback;

  return <ComposerScreen key={hydrated ? "client" : "server"} start={start} restored={draft !== null} />;
}
