import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API reference — Talktin",
  description: "The four endpoints every screen in Talktin is built on.",
};

const ENDPOINTS = [
  {
    id: "speech",
    method: "POST",
    path: "/api/speech",
    summary: "Turns text into speech and returns a WAV.",
    request: `{
  "text": "The first move is what sets everything in motion.",
  "voice": "Achird",
  "style": "Read this with quiet confidence"
}`,
    response: "audio/wav — 24kHz, 16-bit, mono",
    notes: [
      "text is required and capped at 5,000 characters.",
      "voice falls back to the default if the name is not in the catalogue.",
      "style is prepended to the text, because the model takes direction in words rather than as a parameter.",
    ],
  },
  {
    id: "transcribe",
    method: "POST",
    path: "/api/transcribe",
    summary: "Transcribes an audio or video file, separating speakers.",
    request: `FormData
  file: recording.m4a   // up to 15MB`,
    response: `{ "text": "Speaker 1: …", "filename": "recording.m4a", "words": 184 }`,
    notes: [
      "Size and type are checked before the file reaches the model.",
      "A file with no speech in it comes back as a 400, not an empty transcript.",
    ],
  },
  {
    id: "dub",
    method: "POST",
    path: "/api/dub",
    summary: "Transcribes a clip, translates it, and speaks the translation.",
    request: `FormData
  file: interview.mp4
  language: hi-IN
  voice: Sulafat`,
    response: `{ "transcript": "…", "translation": "…", "audio": "<base64 wav>" }`,
    notes: [
      "The three stages are sequential — each needs the previous one's words.",
      "Translation is asked for roughly the source's spoken length, so the dub still fits the original timing.",
    ],
  },
  {
    id: "agent",
    method: "POST",
    path: "/api/agent",
    summary: "Runs the agent to a reply, and reports every tool it used.",
    request: `{
  "messages": [{ "role": "user", "content": "Can I get a refund for TK4543490?" }],
  "system": "optional instructions"
}`,
    response: `{
  "reply": "That one was delivered, so it qualifies. Shall I start it?",
  "tools": [{ "name": "lookup_order", "args": { "order_id": "TK4543490" }, "result": "…" }]
}`,
    notes: [
      "The last message must be from the user.",
      "History is capped at the most recent 40 messages.",
      "An unknown tool name is reported back to the model rather than thrown, so it can pick a real one.",
    ],
  },
];

const ERRORS = [
  { code: "400", meaning: "Something about the request needs fixing. The message says what." },
  { code: "429", meaning: "The free tier's quota is spent. Wait, then retry — the request was fine." },
  { code: "500", meaning: "GEMINI_API_KEY is not set on the server." },
  { code: "502", meaning: "The model failed or returned nothing usable." },
];

export default function Docs() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-20">
      <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">API reference</h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
        Four endpoints. Every screen in the product is built on them, so anything the UI can do, a fetch
        call can do too.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2">
        {ENDPOINTS.map((endpoint) => (
          <a
            key={endpoint.id}
            href={`#${endpoint.id}`}
            className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            {endpoint.path}
          </a>
        ))}
      </nav>

      <div className="mt-14 space-y-16">
        {ENDPOINTS.map((endpoint) => (
          <section key={endpoint.id} id={endpoint.id} className="scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-white">
                {endpoint.method}
              </span>
              <h2 className="font-mono text-[17px]">{endpoint.path}</h2>
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{endpoint.summary}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted">Request</p>
                <pre className="overflow-x-auto rounded-xl border border-line bg-canvas p-4 text-[12.5px] leading-relaxed">
                  <code>{endpoint.request}</code>
                </pre>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted">Response</p>
                <pre className="overflow-x-auto rounded-xl border border-line bg-canvas p-4 text-[12.5px] leading-relaxed">
                  <code>{endpoint.response}</code>
                </pre>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {endpoint.notes.map((note) => (
                <li key={note} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
                  <span aria-hidden>—</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-line pt-10">
        <h2 className="text-[20px] font-medium">Errors</h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          Every endpoint fails the same way: a JSON body with an <code className="font-mono">error</code>{" "}
          string, and a status that says whose problem it is.
        </p>

        <dl className="mt-6 space-y-3">
          {ERRORS.map((error) => (
            <div key={error.code} className="flex gap-4 rounded-xl border border-line bg-canvas px-4 py-3">
              <dt className="font-mono text-[13px] font-medium">{error.code}</dt>
              <dd className="text-[13.5px] text-muted">{error.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
