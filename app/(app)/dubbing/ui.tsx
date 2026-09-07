"use client";

import { useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";
import { DEFAULT_LANGUAGE, LANGUAGES, languageLabel } from "@/lib/languages";
import { readNdjson } from "@/lib/ndjson";
import { DEFAULT_VOICE, VOICES } from "@/lib/voices";

interface Dub {
  language: string;
  voice: string;
  transcript: string;
  translation: string;
  /** Null when transcription and translation succeeded but speech did not. */
  url: string | null;
}

const STEPS = ["Transcribing", "Translating", "Speaking"] as const;

type Event =
  | { stage: "transcribing" }
  | { stage: "translating"; transcript: string }
  | { stage: "speaking"; translation: string }
  | { stage: "done"; audio: string; language: string; voice: string }
  | { stage: "failed"; error: string };

const STEP_INDEX: Record<string, number> = { transcribing: 0, translating: 1, speaking: 2 };

export function DubbingScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [dub, setDub] = useState<Dub | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const working = step >= 0;

  async function run() {
    if (!file || working) return;
    setError(null);
    setDub(null);
    setStep(0);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("language", language);
      body.append("voice", voice);

      const response = await fetch("/api/dub", { method: "POST", body });

      // Validation failures answer with a normal status before the stream opens.
      if (!response.ok) {
        const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(message ?? `Dubbing failed (${response.status})`);
      }

      // The server reports each stage as it starts, so the progress shown is
      // what is actually happening rather than a guess from a timer.
      let transcript = "";
      let translation = "";

      for await (const event of readNdjson<Event>(response)) {
        if (event.stage === "translating") transcript = event.transcript;
        if (event.stage === "speaking") translation = event.translation;

        if (event.stage === "failed") {
          // Speech is the last of three calls. If it fails, the transcript and
          // translation already succeeded and are worth keeping on screen —
          // throwing here would bin work the caller has already paid for.
          if (transcript) {
            setDub({ language: languageLabel(language) ?? language, voice, transcript, translation, url: null });
          }
          throw new Error(event.error);
        }

        if (event.stage === "done") {
          const bytes = Uint8Array.from(atob(event.audio), (character) => character.charCodeAt(0));
          if (urlRef.current) URL.revokeObjectURL(urlRef.current);
          urlRef.current = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
          setDub({ language: event.language, voice: event.voice, transcript, translation, url: urlRef.current });
        } else {
          setStep(STEP_INDEX[event.stage] ?? 0);
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setStep(-1);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title="Dubbing"
        subtitle="Drop in a clip and get it back in another language — transcribed, translated, and spoken."
      />

      <div className="mt-8 space-y-3">
        <Dropzone file={file} onFile={(next) => { setFile(next); setDub(null); }} disabled={working} />

        <Panel className="flex flex-wrap items-center gap-3 px-5 py-3">
          <label className="text-[13px] text-muted">
            Into
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              disabled={working}
              className="ml-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] text-ink outline-none"
            >
              {LANGUAGES.map((option) => (
                <option key={option.code} value={option.code}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="text-[13px] text-muted">
            Voice
            <select
              value={voice}
              onChange={(event) => setVoice(event.target.value)}
              disabled={working}
              className="ml-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] text-ink outline-none"
            >
              {VOICES.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>

          <button
            onClick={run}
            disabled={!file || working}
            className="ml-auto rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-35"
          >
            {working ? `${STEPS[step]}…` : "Dub"}
          </button>
        </Panel>
      </div>

      {working && (
        <ol aria-live="polite" className="mt-4 flex gap-2 text-[12.5px]">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={`rounded-full border px-3 py-1 ${
                index < step ? "border-line text-muted" : index === step ? "border-ink text-ink" : "border-line text-muted/50"
              }`}
            >
              {label}
            </li>
          ))}
        </ol>
      )}

      {error && <ErrorNote message={error} />}

      {dub && (
        <div className="mt-8 space-y-4">
          {dub.url && (
            <Panel className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-medium text-muted">{dub.language} · {dub.voice}</h2>
                <a
                  href={dub.url}
                  download={`dub-${dub.language.toLowerCase().replace(/\W+/g, "-")}.wav`}
                  className="text-[12.5px] text-muted transition-colors hover:text-ink"
                >
                  Download
                </a>
              </div>
              <audio controls src={dub.url} className="h-10 w-full" />
            </Panel>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel className="p-5">
              <h3 className="mb-2 text-[12.5px] font-medium text-muted">Original</h3>
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{dub.transcript}</p>
            </Panel>
            <Panel className="p-5">
              <h3 className="mb-2 text-[12.5px] font-medium text-muted">{dub.language}</h3>
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{dub.translation}</p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
