import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API reference — Talktin",
  description: "The on-device speech engine, and the three endpoints behind everything else.",
};

const ENDPOINTS = [
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
    summary: "Transcribes a clip, translates it, and speaks the translation — reporting each stage as it starts.",
    request: `FormData
  file: interview.mp4
  language: hi-IN
  voice: Sulafat`,
    response: `application/x-ndjson — one JSON object per line

{"stage":"transcribing"}
{"stage":"translating","transcript":"…"}
{"stage":"speaking","translation":"…"}
{"stage":"done","audio":"<base64 wav>","language":"Hindi","voice":"Sulafat"}`,
    notes: [
      "The three stages are sequential — each needs the previous one's words — so progress is streamed rather than withheld until the end.",
      "Validation answers with an ordinary status code before the stream opens; a failure after that arrives as a final {\"stage\":\"failed\",\"error\":\"…\"} line.",
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
  { code: "500", meaning: "GEMINI_API_KEY is not set on the server. Speech is unaffected — it does not use one." },
  { code: "502", meaning: "The model failed or returned nothing usable." },
];

export default function Docs() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-20">
      <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">API reference</h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
        Speech is generated in the browser, so it is a function call rather than an endpoint. The three
        things that do need a server are documented below it.
      </p>

      <section id="speech" className="mt-14 scroll-mt-24 border-t border-line pt-10">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-white">CLIENT</span>
          <h2 className="font-mono text-[17px]">speak()</h2>
        </div>
        <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
          There used to be a <code className="font-mono">POST /api/speech</code> here. It is gone, because
          the speech model now runs in the tab: Kokoro-82M, fetched once from the Hugging Face CDN, cached
          by the browser, executed through ONNX Runtime Web. Nothing to authenticate, nothing to meter,
          and the text never leaves the machine that typed it.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted">Call</p>
            <pre className="overflow-x-auto rounded-xl border border-line bg-canvas p-4 text-[12.5px] leading-relaxed">
              <code>{`import { speak } from "@/lib/kokoro";

const wav = await speak(
  "The first move is what sets everything in motion.",
  { voice: "af_heart", speed: 1 },
);`}</code>
            </pre>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted">Returns</p>
            <pre className="overflow-x-auto rounded-xl border border-line bg-canvas p-4 text-[12.5px] leading-relaxed">
              <code>{`Blob — audio/wav, 24kHz mono

URL.createObjectURL(wav)`}</code>
            </pre>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {[
            "voice is a Kokoro id such as af_heart or bf_emma — the ids on the Voices page, not display names.",
            "speed is 0.5 to 2, and it is the only delivery control the model has. There is no style or emotion argument, so none is offered.",
            "The first call downloads roughly 80MB of weights; pass onProgress to report that, then never again on this browser.",
            "Generation runs on WebGPU where the browser has it and falls back to WASM where it does not.",
          ].map((note) => (
            <li key={note} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
              <span aria-hidden>—</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mt-20 text-[20px] font-medium">Server endpoints</h2>

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
