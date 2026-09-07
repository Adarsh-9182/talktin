"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";
import { saveAsset } from "@/lib/assets";
import { stitchWav } from "@/lib/stitch";
import { DEFAULT_VOICE, VOICES } from "@/lib/voices";

interface Block {
  id: string;
  text: string;
  voice: string;
  style: string;
  status: "idle" | "generating" | "done" | "failed";
  blob?: Blob;
  url?: string;
  error?: string;
}

const MAX_BLOCKS = 20;
const MAX_TOTAL = 10_000;

function blank(voice = DEFAULT_VOICE): Block {
  return { id: crypto.randomUUID(), text: "", voice, style: "", status: "idle" };
}

const SAMPLE: Pick<Block, "text" | "voice" | "style">[] = [
  { text: "Welcome back to the show. Today we are talking about the one thing nobody warns you about when you start building.", voice: "Charon", style: "Read this like a podcast host opening an episode" },
  { text: "Which is what, exactly? Because I remember you saying the hard part was the code.", voice: "Leda", style: "Read this with friendly curiosity" },
  { text: "That is what I thought too. The hard part is deciding what not to build.", voice: "Charon", style: "Read this thoughtfully" },
];

export function StudioScreen() {
  const [blocks, setBlocks] = useState<Block[]>([blank()]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullUrl, setFullUrl] = useState<string | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const total = blocks.reduce((sum, block) => sum + block.text.trim().length, 0);
  const filled = blocks.filter((block) => block.text.trim());
  const ready = filled.length > 0 && total <= MAX_TOTAL;
  const done = filled.length > 0 && filled.every((block) => block.status === "done");

  function update(id: string, patch: Partial<Block>) {
    setBlocks((previous) => previous.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function edit(id: string, patch: Partial<Block>) {
    // Editing invalidates whatever was generated from the old words.
    update(id, { ...patch, status: "idle", blob: undefined, url: undefined, error: undefined });
    setFullUrl(null);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((previous) => {
      const next = [...previous];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
    setFullUrl(null);
  }

  /** One request per block, so a 60-second function limit is never the ceiling. */
  async function speak(block: Block): Promise<boolean> {
    update(block.id, { status: "generating", error: undefined });

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: block.text, voice: block.voice, style: block.style }),
      });

      if (!response.ok) {
        const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(message ?? `Failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      update(block.id, { status: "done", blob, url });
      return true;
    } catch (caught) {
      update(block.id, {
        status: "failed",
        error: caught instanceof Error ? caught.message : String(caught),
      });
      return false;
    }
  }

  async function generateAll() {
    if (!ready || running) return;
    setRunning(true);
    setError(null);
    setFullUrl(null);

    // Sequential, and pending blocks only: a run that stopped halfway should
    // resume rather than pay for the blocks that already worked.
    const pending = blocks.filter((block) => block.text.trim() && block.status !== "done");
    let failed = 0;
    for (const block of pending) {
      const ok = await speak(block);
      if (!ok) failed += 1;
    }

    if (failed > 0) {
      setError(
        `${failed} block${failed === 1 ? "" : "s"} did not generate. The ones that worked are kept — press Generate again to retry just those.`,
      );
    }

    setRunning(false);
  }

  async function join() {
    const pieces = blocks.filter((block) => block.text.trim() && block.blob).map((block) => block.blob!);
    if (pieces.length === 0) return;

    try {
      const joined = await stitchWav(pieces);
      const url = URL.createObjectURL(joined);
      urls.current.push(url);
      setFullUrl(url);
      void saveAsset({
        kind: "studio",
        title: blocks.find((block) => block.text.trim())?.text.slice(0, 90) ?? "Studio recording",
        voice: `${pieces.length} blocks`,
        blob: joined,
      }).catch(() => undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  const progress = filled.filter((block) => block.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title="Studio"
        subtitle="Long-form work: a block per paragraph or speaker, each with its own voice, joined into one file."
      />

      <div className="mt-8 space-y-3">
        {blocks.map((block, index) => (
          <Panel key={block.id}>
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[12px] text-muted">Block {index + 1}</span>

              <select
                value={block.voice}
                aria-label={`Voice for block ${index + 1}`}
                onChange={(event) => edit(block.id, { voice: event.target.value })}
                className="rounded-full border border-line bg-canvas px-3 py-1 text-[12.5px] outline-none"
              >
                {VOICES.map((option) => (
                  <option key={option.id} value={option.id}>{option.name} — {option.character}</option>
                ))}
              </select>

              {block.status === "generating" && <span className="text-[11.5px] text-muted">generating…</span>}
              {block.status === "done" && <span className="text-[11.5px] text-muted">ready</span>}
              {block.status === "failed" && (
                <button
                  onClick={() => void speak(block)}
                  disabled={running}
                  className="text-[11.5px] text-red-600 underline underline-offset-2"
                >
                  failed — retry
                </button>
              )}

              <div className="ml-auto flex items-center gap-1 text-[12px] text-muted">
                <button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="px-1.5 disabled:opacity-30">↑</button>
                <button onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Move down" className="px-1.5 disabled:opacity-30">↓</button>
                <button
                  onClick={() => {
                    setBlocks((previous) => (previous.length === 1 ? [blank()] : previous.filter((candidate) => candidate.id !== block.id)));
                    setFullUrl(null);
                  }}
                  aria-label={`Remove block ${index + 1}`}
                  className="px-1.5 transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
            </div>

            <textarea
              value={block.text}
              onChange={(event) => edit(block.id, { text: event.target.value })}
              placeholder="What should this block say?"
              rows={3}
              className="w-full resize-none bg-transparent px-4 py-3 text-[14.5px] leading-relaxed outline-none placeholder:text-muted/70"
            />

            <input
              value={block.style}
              onChange={(event) => edit(block.id, { style: event.target.value })}
              placeholder="Direction for this block — optional"
              className="w-full border-t border-line bg-transparent px-4 py-2.5 text-[12.5px] outline-none placeholder:text-muted/70"
            />

            {block.url && (
              <div className="border-t border-line px-4 py-2.5">
                <audio controls src={block.url} className="h-8 w-full" />
              </div>
            )}

            {block.error && <p className="border-t border-line px-4 py-2 text-[12px] text-red-600">{block.error}</p>}
          </Panel>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setBlocks((previous) => [...previous, blank(previous.at(-1)?.voice)])}
          disabled={blocks.length >= MAX_BLOCKS || running}
          className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] transition-colors hover:border-ink/30 disabled:opacity-40"
        >
          Add block
        </button>

        <button
          onClick={() => {
            setBlocks(SAMPLE.map((block) => ({ ...blank(), ...block })));
            setFullUrl(null);
          }}
          disabled={running}
          className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          Load a two-voice sample
        </button>

        <span className={`text-[12px] ${total > MAX_TOTAL ? "text-red-600" : "text-muted"}`}>
          {total.toLocaleString()} / {MAX_TOTAL.toLocaleString()} characters
        </span>

        <button
          onClick={generateAll}
          disabled={!ready || running}
          className="ml-auto rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-35"
        >
          {running ? `Generating ${progress + 1} of ${filled.length}…` : done ? "All blocks ready" : "Generate"}
        </button>
      </div>

      {running && (
        <p aria-live="polite" className="mt-3 text-[12.5px] text-muted">
          One request per block, so nothing runs into a function timeout — and a block that fails does not
          cost you the ones that already worked.
        </p>
      )}

      {error && <ErrorNote message={error} />}

      {done && (
        <Panel className="mt-8 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[13px] font-medium text-muted">
              {filled.length} block{filled.length === 1 ? "" : "s"} ready
            </h2>
            {fullUrl ? (
              <a href={fullUrl} download="talktin-studio.wav" className="text-[12.5px] text-muted transition-colors hover:text-ink">
                Download
              </a>
            ) : (
              <button
                onClick={() => void join()}
                className="rounded-full bg-ink px-4 py-1.5 text-[12.5px] font-medium text-white"
              >
                Join into one file
              </button>
            )}
          </div>
          {fullUrl && <audio controls src={fullUrl} className="h-10 w-full" />}
        </Panel>
      )}
    </div>
  );
}
