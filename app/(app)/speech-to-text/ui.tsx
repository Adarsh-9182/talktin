"use client";

import { useState } from "react";
import { Dropzone, useRecorder } from "@/components/Dropzone";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";

export function SpeechToTextScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recorder = useRecorder((recorded) => {
    setFile(recorded);
    setTranscript(null);
  });

  async function run() {
    if (!file || working) return;
    setWorking(true);
    setError(null);
    setTranscript(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/transcribe", { method: "POST", body });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? `Transcription failed (${response.status})`);
      setTranscript(payload.text ?? "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title="Speech to Text"
        subtitle="Upload a recording or record one here, and get the words back — with speakers separated."
      />

      <div className="mt-8 space-y-3">
        <Dropzone file={file} onFile={(next) => { setFile(next); setTranscript(null); }} disabled={working} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={recorder.recording ? recorder.stop : recorder.start}
            disabled={working}
            className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] transition-colors hover:border-ink/30 disabled:opacity-40"
          >
            {recorder.recording ? "■ Stop recording" : "● Record"}
          </button>

          <button
            onClick={run}
            disabled={!file || working}
            className="ml-auto rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-35"
          >
            {working ? "Transcribing…" : "Transcribe"}
          </button>
        </div>
      </div>

      {recorder.error && <ErrorNote message={recorder.error} />}
      {error && <ErrorNote message={error} />}

      {transcript !== null && (
        <Panel className="mt-8 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-medium text-muted">Transcript</h2>
            <div className="flex gap-3 text-[12.5px] text-muted">
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(transcript);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="transition-colors hover:text-ink"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={URL.createObjectURL(new Blob([transcript], { type: "text/plain" }))}
                download="transcript.txt"
                className="transition-colors hover:text-ink"
              >
                Download
              </a>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{transcript}</p>
        </Panel>
      )}
    </div>
  );
}
