"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";
import { saveAsset } from "@/lib/assets";
import { speak as synthesise } from "@/lib/kokoro";
import { stitchWav } from "@/lib/stitch";
import { DEFAULT_VOICE, VOICES } from "@/lib/voices";

interface Block {
  id: string;
  text: string;
  voice: string;
  /** 0.5-2. The one delivery control the engine actually has; see Composer. */
  speed: number;
  status: "idle" | "generating" | "done" | "failed";
  blob?: Blob;
  url?: string;
  error?: string;
}

const MAX_BLOCKS = 20;
const MAX_TOTAL = 10_000;

function blank(voice = DEFAULT_VOICE): Block {
  return { id: crypto.randomUUID(), text: "", voice, speed: 1, status: "idle" };
}

/*
 * Two voices, both graded B- or better, and from different accents so a
 * listener can tell them apart without being told. The previous sample named
 * Charon and Leda — Gemini voices that are not in the catalogue any more — so
 * pressing the sample button produced two blocks the engine would reject.
 */
const SAMPLE: Pick<Block, "text" | "voice" | "speed">[] = [
  { text: "Welcome back to the show. Today we are talking about the one thing nobody warns you about when you start building.", voice: "af_heart", speed: 1 },
  { text: "Which is what, exactly? Because I remember you saying the hard part was the code.", voice: "bf_emma", speed: 1.05 },
  { text: "That is what I thought too. The hard part is deciding what not to build.", voice: "af_heart", speed: 0.95 },
];

export function StudioScreen() {
  const [blocks, setBlocks] = useState<Block[]>([blank()]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullUrl, setFullUrl] = useState<string | null>(null);
  /** Percent of the one-time weight download, or null when nothing is loading. */
  const [load, setLoad] = useState<number | null>(null);
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

  /*
   * A block at a time, in this tab. Splitting long-form into blocks was
   * originally a workaround for a 60-second function limit; now that the
   * engine is local that ceiling is gone, and the split survives for the
   * reason it should have existed all along — a block is a paragraph or a
   * speaker, and one that fails can be retried without redoing the rest.
   */
  async function speak(block: Block): Promise<boolean> {
    update(block.id, { status: "generating", error: undefined });

    try {
      const blob = await synthesise(block.text, {
        voice: block.voice,
        speed: block.speed,
        onProgress: (progress) => setLoad(progress.percent),
      });
      setLoad(null);
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      update(block.id, { status: "done", blob, url });
      return true;
    } catch (caught) {
      setLoad(null);
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
    // resume rather than redo the blocks that already worked. Sequential also
    // matters more now than it did over HTTP — the engine is one model in one
    // tab, so parallel calls would queue behind each other anyway.
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

            {/*
              A free-text "Direction" box used to sit here and was prepended to
              the text for a model that took performance notes in the prompt.
              The engine has no such input, so the field was a control that
              silently did nothing. Speed is what it does expose.
            */}
            <div className="flex items-center gap-3 border-t border-line px-4 py-2.5">
              <label htmlFor={`speed-${block.id}`} className="text-[12.5px] text-muted">Speed</label>
              <input
                id={`speed-${block.id}`}
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={block.speed}
                onChange={(event) => edit(block.id, { speed: Number(event.target.value) })}
                className="h-1 flex-1 accent-ink"
              />
              <span className="w-12 text-right font-mono text-[11.5px] text-muted tabular-nums">
                {block.speed.toFixed(2)}×
              </span>
            </div>

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
          {!running
            ? done
              ? "All blocks ready"
              : "Generate"
            : load !== null
              ? `Loading voice… ${load}%`
              : `Generating ${progress + 1} of ${filled.length}…`}
        </button>
      </div>

      {running && (
        <p aria-live="polite" className="mt-3 text-[12.5px] text-muted">
          {load !== null
            ? "Downloading the voice model once. It is cached after this, and every block after it is instant."
            : "Generating on this machine — no upload, no quota, and a block that fails does not cost you the ones that already worked."}
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
