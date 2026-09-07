"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, PageHeader, Panel } from "@/components/Page";
import { DEFAULT_SYSTEM, type ChatMessage, type ToolRun } from "@/lib/agent";
import { DEFAULT_VOICE, VOICES } from "@/lib/voices";
import { useSpeechInput } from "@/components/useSpeechInput";

interface Turn extends ChatMessage {
  tools?: ToolRun[];
}

const OPENERS = ["Can I get a refund?", "Where is order TK4551002?", "What is your refund policy?"];

export function AgentsScreen() {
  const [system, setSystem] = useState(DEFAULT_SYSTEM);
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const speech = useSpeechInput((heard) => void send(heard));

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  useEffect(() => () => audioRef.current?.pause(), []);

  async function say(text: string) {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!response.ok) return; // A silent reply still reads fine on screen.
      const url = URL.createObjectURL(await response.blob());
      const audio = (audioRef.current ??= new Audio());
      audio.pause();
      audio.src = url;
      audio.onended = () => URL.revokeObjectURL(url);
      void audio.play().catch(() => undefined);
    } catch {
      /* Speaking is a bonus; never let it break the conversation. */
    }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || thinking) return;

    setError(null);
    setDraft("");
    const next: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(next);
    setThinking(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ system, messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const payload = (await response.json()) as { reply?: string; tools?: ToolRun[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? `The agent failed (${response.status})`);

      const reply = payload.reply ?? "";
      setTurns((previous) => [...previous, { role: "assistant", content: reply, tools: payload.tools }]);
      if (speakReplies && reply) void say(reply);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-10">
      <PageHeader
        title="Voice Agents"
        subtitle="An agent that talks, uses tools, and shows you every tool it reached for."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel className="h-fit p-5">
          <h2 className="mb-3 text-[13px] font-medium">Configuration</h2>

          <label className="block text-[12.5px] text-muted">
            Instructions
            <textarea
              value={system}
              onChange={(event) => setSystem(event.target.value)}
              rows={10}
              className="mt-1.5 w-full resize-none rounded-xl border border-line bg-canvas p-3 text-[12.5px] leading-relaxed text-ink outline-none"
            />
          </label>

          <label className="mt-4 block text-[12.5px] text-muted">
            Voice
            <select
              value={voice}
              onChange={(event) => setVoice(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-[13px] text-ink outline-none"
            >
              {VOICES.map((option) => (
                <option key={option.id} value={option.id}>{option.name} — {option.character}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 flex items-center gap-2 text-[12.5px] text-muted">
            <input
              type="checkbox"
              checked={speakReplies}
              onChange={(event) => setSpeakReplies(event.target.checked)}
            />
            Speak replies out loud
          </label>

          <button
            onClick={() => { setTurns([]); setError(null); audioRef.current?.pause(); }}
            className="mt-5 w-full rounded-full border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink/30"
          >
            Reset conversation
          </button>
        </Panel>

        <Panel className="flex min-h-[520px] flex-col">
          <div ref={feedRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {turns.length === 0 && (
              <div className="pt-16 text-center">
                <p className="text-[13.5px] text-muted">Try one of these, or press the mic and speak.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {OPENERS.map((opener) => (
                    <button
                      key={opener}
                      onClick={() => void send(opener)}
                      className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
                    >
                      {opener}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((turn, index) => (
              <div key={index} className={turn.role === "user" ? "flex justify-end" : ""}>
                <div className={turn.role === "user" ? "max-w-[80%]" : "max-w-[85%]"}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                      turn.role === "user" ? "bg-ink text-white" : "bg-canvas"
                    }`}
                  >
                    {turn.content}
                  </div>

                  {turn.tools && turn.tools.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {turn.tools.map((tool, toolIndex) => (
                        <li key={toolIndex} className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] text-muted">
                          <span className="font-medium text-ink">{tool.name}</span>
                          {Object.keys(tool.args).length > 0 && ` (${JSON.stringify(tool.args)})`}
                          <span className="block truncate">↳ {tool.result}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {thinking && <p aria-live="polite" className="text-[13px] text-muted">Thinking…</p>}
          </div>

          {(error || speech.error) && <div className="px-5"><ErrorNote message={error ?? speech.error!} /></div>}

          <div className="flex items-center gap-2 border-t border-line p-3">
            <button
              onClick={speech.listening ? speech.stop : speech.start}
              disabled={thinking}
              aria-label={speech.listening ? "Stop listening" : "Speak"}
              className={`h-9 w-9 shrink-0 rounded-full border text-[13px] transition-colors ${
                speech.listening ? "border-ink bg-ink text-white" : "border-line hover:border-ink/30"
              }`}
            >
              {speech.listening ? "■" : "🎙"}
            </button>

            <input
              value={speech.listening ? speech.heard || "Listening…" : draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void send(draft)}
              readOnly={speech.listening}
              placeholder="Type a message, or use the mic"
              className="min-w-0 flex-1 bg-transparent px-2 text-[13.5px] outline-none placeholder:text-muted/70"
            />

            <button
              onClick={() => void send(draft)}
              disabled={thinking || !draft.trim()}
              className="shrink-0 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-35"
            >
              Send
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
