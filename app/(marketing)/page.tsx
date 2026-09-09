import Link from "next/link";
import { ProductTabs } from "@/components/marketing/ProductTabs";
import { VOICES } from "@/lib/voices";

/*
 * This page used to sell a different product. It promised speech in 90+
 * languages, direction in plain words, and four tools on one foundation —
 * all of it describing a hosted model behind an API key that has never
 * existed in this repository. Every number was unfalsifiable and most were
 * wrong.
 *
 * What is actually here is narrower and, unusually, provable: a speech model
 * that runs inside the visitor's own browser. So the page argues the one
 * thing a metered cloud API cannot answer — your words never leave your
 * machine — and it puts the receipt in the hero rather than a testimonial.
 */

/** Four numbers, each of which a visitor could check without trusting us. */
const STATS = [
  { value: `${VOICES.length}`, label: "voices, running on your machine" },
  { value: "₹0", label: "per character, at any volume" },
  { value: "0", label: "bytes of your text uploaded" },
  { value: "once", label: "the model downloads, then never again" },
];

const LOCAL_FACTS = [
  {
    name: "It works with the Wi-Fi off",
    blurb: "Once the weights are cached, generation is a function call on your own CPU or GPU. Disconnect and press play — that is the test, and it passes.",
  },
  {
    name: "No account, no key, no quota",
    blurb: "There is no meter to run down, because there is no server doing the work. The hundredth minute of audio costs exactly what the first one did.",
  },
  {
    name: "Long-form is blocks, not batches",
    blurb: "A block per paragraph or speaker, each with its own voice and speed, joined into one file in the browser. A block that fails is retried alone.",
  },
  {
    name: `All ${VOICES.length} voices are auditionable`,
    blurb: "Every voice is on one page with the model author's own quality grade next to it, including the unflattering ones. Play before you write a word.",
  },
];

/** The honest half. These need a server and a key, and the page says so. */
const HOSTED = [
  { name: "Dubbing", blurb: "Transcribe a clip, translate it to roughly the same spoken length, and speak the result." },
  { name: "Transcription", blurb: "Speaker-separated transcripts from an audio or video file." },
  { name: "Agents", blurb: "Tool-calling conversations, with every tool the agent reached for printed under the reply." },
];

const ENGINE = [
  { name: "Kokoro-82M", detail: "82 million parameters, Apache-2.0, quantised to 8-bit. Small enough to ship to a browser, good enough that one of its voices is graded A.", meta: "onnx-community/Kokoro-82M-v1.0-ONNX" },
  { name: "ONNX Runtime Web", detail: "WebGPU where the browser has it, which is roughly an order of magnitude faster, and WASM everywhere else.", meta: "webgpu · wasm fallback" },
  { name: "American and British English", detail: "Two accents, done properly, instead of a long language list the model cannot actually deliver.", meta: "en-us · en-gb" },
];

const SAFETY = [
  { name: "Nothing to leak", blurb: "There is no server-side copy of your text or your audio, because neither was ever sent anywhere. Privacy here is an architecture, not a policy page.", icon: "circles" },
  { name: "No cloning", blurb: "Only the model's prebuilt voices are offered. There is no path here to copy a voice from a sample of someone who did not agree.", icon: "cube" },
  { name: "Provenance", blurb: "Generated audio is generated audio. Nothing here presents a synthetic voice as a recording of a real person.", icon: "cone" },
] as const;

const UPDATES = [
  { title: "Speech moved into the browser", date: "Sep 9, 2026", blurb: "Kokoro-82M replaced a hosted model that needed a key nobody had. The audio path runs for the first time." },
  { title: "The controls that did nothing are gone", date: "Sep 9, 2026", blurb: "A free-text direction field was being sent to a model with no such input. It is a speed slider now." },
  { title: "The endpoint that never ran is deleted", date: "Sep 9, 2026", blurb: "/api/speech is not documented as an endpoint that 500s. Speech is a client call, and the docs say so." },
];

function SafetyIcon({ kind }: { kind: (typeof SAFETY)[number]["icon"] }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1 } as const;
  return (
    <svg viewBox="0 0 80 80" aria-hidden className="h-20 w-20 text-ink">
      {kind === "circles" &&
        [0, 1, 2, 3, 4].map((index) => (
          <circle key={index} cx={40 + index * 3} cy={40} r={30 - index * 5} {...stroke} />
        ))}
      {kind === "cube" && (
        <>
          <rect x={16} y={16} width={48} height={48} {...stroke} />
          <line x1={16} y1={40} x2={64} y2={40} {...stroke} />
          <line x1={40} y1={16} x2={40} y2={64} {...stroke} />
          <line x1={16} y1={16} x2={64} y2={64} {...stroke} strokeDasharray="3 3" />
          <line x1={64} y1={16} x2={16} y2={64} {...stroke} strokeDasharray="3 3" />
        </>
      )}
      {kind === "cone" && (
        <>
          <ellipse cx={40} cy={58} rx={24} ry={9} {...stroke} />
          <line x1={16} y1={58} x2={40} y2={14} {...stroke} />
          <line x1={64} y1={58} x2={40} y2={14} {...stroke} />
          <line x1={8} y1={36} x2={72} y2={36} {...stroke} strokeDasharray="3 3" />
        </>
      )}
    </svg>
  );
}

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <h1 className="text-[46px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[68px]">
            Nothing you type
            <br />
            ever leaves this tab
          </h1>

          <div className="lg:pt-4">
            <p className="max-w-md text-[16.5px] leading-relaxed text-muted">
              Talktin is a voice studio whose speech model runs inside your browser. No account, no key,
              no character quota — and no upload. Press play below, then open your network tab and watch
              it make no requests.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/text-to-speech" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white">
                Open the studio
              </Link>
              <Link
                href="/voices"
                className="rounded-full border border-line px-5 py-2.5 text-[14px] transition-colors hover:border-ink/30"
              >
                Hear all {VOICES.length} voices
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <ProductTabs />
        </div>
      </section>

      {/* What it is, in numbers — the honest version of a customer logo wall */}
      <section className="border-y border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-[30px] font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-[13px] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The split: what runs here, and what does not */}
      <section id="platforms" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <h2 className="max-w-xl text-[32px] font-semibold leading-[1.15] tracking-[-0.025em]">
          Speech runs on your machine.
          <br />
          Three other things do not.
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Saying which is which is the whole point. A product that blurs the line is asking you to take
          its privacy claim on faith, and this one would rather be checkable.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-line bg-canvas p-7">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted">On your machine</p>
            <h3 className="mt-2 text-[20px] font-medium">Speech, and everything built on it</h3>
            <ul className="mt-6 space-y-5">
              {LOCAL_FACTS.map((fact) => (
                <li key={fact.name}>
                  <p className="text-[14.5px] font-medium">{fact.name}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{fact.blurb}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/text-to-speech"
              className="mt-7 inline-block rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] transition-colors hover:border-ink/30"
            >
              Open the studio
            </Link>
          </div>

          <div id="agents" className="scroll-mt-20 rounded-3xl border border-line bg-canvas p-7">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Needs a server</p>
            <h3 className="mt-2 text-[20px] font-medium">Dubbing, transcription, and agents</h3>
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
              These three send your file or your message to a hosted model, so they need a{" "}
              <code className="font-mono text-[12.5px]">GEMINI_API_KEY</code> on the server — and the
              privacy claim above does not cover them. Run your own copy and they are yours; on this
              deployment they are honest about needing one.
            </p>
            <ul className="mt-6 space-y-5">
              {HOSTED.map((tool) => (
                <li key={tool.name}>
                  <p className="text-[14.5px] font-medium">{tool.name}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{tool.blurb}</p>
                </li>
              ))}
            </ul>
            <a
              href="https://github.com/Adarsh-9182/talktin"
              className="mt-7 inline-block rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] transition-colors hover:border-ink/30"
            >
              Run your own copy
            </a>
          </div>
        </div>
      </section>

      {/* The engine, named */}
      <section id="api" className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-lg text-[32px] font-semibold leading-[1.15] tracking-[-0.025em]">
              The engine, named
              <br />
              so you can go and check it
            </h2>
            <Link
              href="/docs"
              className="rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] transition-colors hover:border-ink/30"
            >
              Explore the docs
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {ENGINE.map((part) => (
              <div key={part.name} className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="text-[15px] font-medium">{part.name}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{part.detail}</p>
                <p className="mt-4 font-mono text-[11.5px] text-muted">{part.meta}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-[13.5px] leading-relaxed text-muted">
            It is not ElevenLabs v3, and pretending otherwise would be the fastest way to lose your
            trust in the first ten seconds. It is a small, open model that is free forever, private by
            construction, and instant once it has loaded — which is a trade some work wants and no
            metered API can offer.
          </p>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <h2 className="text-[32px] font-semibold tracking-[-0.025em]">Safety, built in</h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {SAFETY.map((item) => (
            <div key={item.name} className="rounded-3xl border border-line bg-canvas p-7">
              <SafetyIcon kind={item.icon} />
              <h3 className="mt-8 text-[15px] font-medium">{item.name}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{item.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Updates */}
      <section id="research" className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[32px] font-semibold tracking-[-0.025em]">Latest updates</h2>
            <a
              href="https://github.com/Adarsh-9182/talktin/commits/main"
              className="rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] transition-colors hover:border-ink/30"
            >
              All commits
            </a>
          </div>

          {/*
            Each of these had a decorative gradient rectangle above it, standing
            in for a screenshot that was never taken. A grey box that means
            nothing is worse than no box, so the date leads instead.
          */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {UPDATES.map((update) => (
              <article key={update.title} className="rounded-2xl border border-line bg-surface p-6">
                <p className="font-mono text-[11.5px] uppercase tracking-wider text-muted">{update.date}</p>
                <h3 className="mt-3 text-[15px] font-medium leading-snug">{update.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{update.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
          <h2 className="max-w-md text-[28px] font-semibold leading-[1.15] tracking-[-0.025em]">
            No signup. Type something and press play.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-full border border-line px-5 py-2.5 text-[14px] transition-colors hover:border-ink/30"
            >
              Read the docs
            </Link>
            <Link href="/text-to-speech" className="rounded-full bg-ink px-6 py-2.5 text-[14px] font-medium text-white">
              Open the studio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
