"use client";

import { useRef, useState } from "react";

export function Dropzone({
  file,
  onFile,
  disabled,
  hint = "Audio or video, up to 15MB",
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (disabled) return;
        const dropped = event.dataTransfer.files[0];
        if (dropped) onFile(dropped);
      }}
      className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
        over ? "border-ink bg-canvas" : "border-line bg-surface"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        className="sr-only"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-[14px]">{file.name}</span>
          <span className="text-[12.5px] text-muted">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
          <button
            onClick={() => {
              onFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={disabled}
            className="text-[12.5px] text-muted underline underline-offset-2 transition-colors hover:text-ink"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="rounded-full border border-line px-4 py-1.5 text-[13px] transition-colors hover:border-ink/30"
          >
            Choose a file
          </button>
          <p className="mt-2.5 text-[12.5px] text-muted">or drop it here · {hint}</p>
        </>
      )}
    </div>
  );
}

/** Records from the microphone and hands back a file the API can accept. */
export function useRecorder(onDone: (file: File) => void) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => event.data.size > 0 && chunks.push(event.data);
      recorder.onstop = () => {
        // Release the mic, or the browser keeps showing the recording indicator.
        stream.getTracks().forEach((track) => track.stop());
        const type = recorder.mimeType || "audio/webm";
        onDone(new File([new Blob(chunks, { type })], "recording.webm", { type }));
        setRecording(false);
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access was blocked. Allow it in your browser settings.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  return { recording, error, start, stop };
}
