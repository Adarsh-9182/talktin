"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";
import { DEFAULT_VOICE, VOICES } from "@/lib/voices";

interface Block {
  id: string;
  text: string;
  voice: string;
  style: string;
}

const MAX_BLOCKS = 20;
const MAX_TOTAL = 10_000;

function blank(voice = DEFAULT_VOICE): Block {
  return { id: crypto.randomUUID(), text: "", voice, style: "" };
}

const SAMPLE: Omit<Block, "id">[] = [
  { text: "Welcome back to the show. Today we are talking about the one thing nobody warns you about when you start building.", voice: "Charon", style: "Read this like a podcast host opening an episode" },
  { text: "Which is what, exactly? Because I remember you saying the hard part was the code.", voice: "Leda", style: "Read this with friendly curiosity" },
  { text: "That is what I thought too. The hard part is deciding what not to build.", voice: "Charon", style: "Read this thoughtfully" },
];

export function StudioScreen() {
  const [blocks, setBlocks] = useState<Block[]>([blank()]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const total = blocks.reduce((sum, block) => sum + block.text.trim().length, 0);
  const ready = blocks.some((block) => block.text.trim()) && total <= MAX_TOTAL;

  function update(id: string, patch: Partial<Block>) {
    setBlocks((previous) => previous.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((previous) => {
      const next = [...previous];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function generate() {
    if (!ready || working) return;
    setWorking(true);
    setError(null);

    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          blocks: blocks
            .filter((block) => block.text.trim())
            .map(({ text, voice, style }) => ({ text, voice, style })),
        }),
      });

      if (!response.ok) {
        const { error: message } = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(message ?? `Generation failed (${response.status})`);
      }

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(await response.blob());
      setUrl(urlRef.current);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title="Studio"
        subtitle="Long-form work: a block per paragraph or speaker, each with its own voice, stitched into one file."
      />

      <div className="mt-8 space-y-3">
        {blocks.map((block, index) => (
          <Panel key={block.id}>
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[12px] text-muted">Block {index + 1}</span>

              <select
                value={block.voice}
            aria-label={`Voice for block ${index + 1}`}
                onChange={(event) => update(block.id, { voice: event.target.value })}
                className="rounded-full border border-line bg-canvas px-3 py-1 text-[12.5px] outline-none"
              >
                {VOICES.map((option) => (
                  <option key={option.id} value={option.id}>{option.name} — {option.character}</option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-1 text-[12px] text-muted">
                <button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="px-1.5 disabled:opacity-30">↑</button>
                <button onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Move down" className="px-1.5 disabled:opacity-30">↓</button>
                <button
                  onClick={() => setBlocks((previous) => (previous.length === 1 ? [blank()] : previous.filter((candidate) => candidate.id !== block.id)))}
                  aria-label="Remove block"
                  className="px-1.5 transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
            </div>

            <textarea
              value={block.text}
              onChange={(event) => update(block.id, { text: event.target.value })}
              placeholder="What should this block say?"
              rows={3}
              className="w-full resize-none bg-transparent px-4 py-3 text-[14.5px] leading-relaxed outline-none placeholder:text-muted/70"
            />

            <input
              value={block.style}
              onChange={(event) => update(block.id, { style: event.target.value })}
              placeholder="Direction for this block — optional"
              className="w-full border-t border-line bg-transparent px-4 py-2.5 text-[12.5px] outline-none placeholder:text-muted/70"
            />
          </Panel>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setBlocks((previous) => [...previous, blank(previous.at(-1)?.voice)])}
          disabled={blocks.length >= MAX_BLOCKS}
          className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] transition-colors hover:border-ink/30 disabled:opacity-40"
        >
          Add block
        </button>

        <button
          onClick={() => setBlocks(SAMPLE.map((block) => ({ ...block, id: crypto.randomUUID() })))}
          className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-muted transition-colors hover:text-ink"
        >
          Load a two-voice sample
        </button>

        <span className={`text-[12px] ${total > MAX_TOTAL ? "text-red-600" : "text-muted"}`}>
          {total.toLocaleString()} / {MAX_TOTAL.toLocaleString()} characters
        </span>

        <button
          onClick={generate}
          disabled={!ready || working}
          className="ml-auto rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-35"
        >
          {working ? "Generating…" : "Generate all"}
        </button>
      </div>

      {working && (
        <p aria-live="polite" className="mt-3 text-[12.5px] text-muted">
          Blocks are generated one at a time, so a long piece takes a while — that is what keeps the free
          tier from rate-limiting halfway through.
        </p>
      )}

      {error && <ErrorNote message={error} />}

      {url && (
        <Panel className="mt-8 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-medium text-muted">Full recording</h2>
            <a href={url} download="talktin-studio.wav" className="text-[12.5px] text-muted transition-colors hover:text-ink">
              Download
            </a>
          </div>
          <audio controls src={url} className="h-10 w-full" />
        </Panel>
      )}
    </div>
  );
}
