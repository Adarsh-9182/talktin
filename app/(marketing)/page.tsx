import Link from "next/link";
import { ProductTabs } from "@/components/marketing/ProductTabs";
import { LANGUAGES } from "@/lib/languages";
import { VOICES } from "@/lib/voices";

const STATS = [
  { value: `${VOICES.length}`, label: "prebuilt voices" },
  { value: `${LANGUAGES.length}+`, label: "languages to dub into" },
  { value: "4", label: "tools on one foundation" },
  { value: "₹0", label: "to run it yourself" },
];

const STUDIO_FEATURES = [
  { name: "Direction, not sliders", blurb: "Say “read this like a documentary narrator”. The model takes performance notes in words, so that is where the control lives." },
  { name: "Dubbing that fits", blurb: "Translation is asked for the same spoken length as the source, so the dub still lands inside the video it came from." },
  { name: "Speakers separated", blurb: "Transcripts come back with each voice labelled, not as one undivided wall of text." },
  { name: "Previews before you write", blurb: `All ${VOICES.length} voices are auditionable on one page, and each preview is cached for the session.` },
];

const AGENT_FEATURES = [
  { name: "Testing", blurb: "Talk to the agent with the instructions you are about to ship, and watch which tools it reaches for." },
  { name: "Guardrails", blurb: "Tools decide what is possible. A refund cannot be started on an order the tool says is still in transit." },
  { name: "Workflows", blurb: "Tools are ordinary functions, so an agent can look something up, check a policy, and act in one turn." },
];

const MODELS = [
  { name: "Speech", detail: "Low-latency speech in 90+ languages, directed in plain words.", meta: "gemini-2.5-flash-preview-tts" },
  { name: "Transcription", detail: "Speaker-separated transcripts from audio or video files.", meta: "gemini-2.5-flash" },
  { name: "Agents", detail: "Tool-calling conversations with every call recorded.", meta: "gemini-2.5-flash" },
];

const SAFETY = [
  { name: "Provenance", blurb: "Generated audio is generated audio. Nothing here presents a synthetic voice as a recording of a real person.", icon: "circles" },
  { name: "No cloning", blurb: "Only the model's prebuilt voices are offered. There is no path here to copy a voice from a sample.", icon: "cube" },
  { name: "Accountability", blurb: "Agents show every tool they called, so a wrong answer can be traced instead of argued about.", icon: "cone" },
] as const;

const UPDATES = [
  { title: "Dubbing keeps the timing", date: "Sep 7, 2026", blurb: "Translation now asks for the same spoken length as the source." },
  { title: "Agents show their tools", date: "Sep 7, 2026", blurb: "Every tool call is printed under the reply that used it." },
  { title: "Validation before the provider", date: "Sep 7, 2026", blurb: "Bad requests get a 400 that says what to fix, not a 502." },
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
            Give your words
            <br />
            a voice
          </h1>

          <div className="lg:pt-4">
            <p className="max-w-md text-[16.5px] leading-relaxed text-muted">
              Speech in 90+ languages, dubbing that keeps the timing, transcription that separates
              speakers, and agents that talk back. Built on free-tier models, in the open.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/text-to-speech" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white">
                Open the studio
              </Link>
              <Link
                href="/agents"
                className="rounded-full border border-line px-5 py-2.5 text-[14px] transition-colors hover:border-ink/30"
              >
                Talk to an agent
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

      {/* Two platforms */}
      <section id="platforms" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <h2 className="max-w-lg text-[32px] font-semibold leading-[1.15] tracking-[-0.025em]">
          Two platforms built on the
          <br />
          same speech foundation
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-line bg-canvas p-7">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Studio</p>
            <h3 className="mt-2 text-[20px] font-medium">Create, dub, and transcribe in one place</h3>
            <ul className="mt-6 space-y-5">
              {STUDIO_FEATURES.map((feature) => (
                <li key={feature.name}>
                  <p className="text-[14.5px] font-medium">{feature.name}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{feature.blurb}</p>
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
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Agents</p>
            <h3 className="mt-2 text-[20px] font-medium">Deploy agents that talk, and take action</h3>
            <ul className="mt-6 space-y-5">
              {AGENT_FEATURES.map((feature) => (
                <li key={feature.name}>
                  <p className="text-[14.5px] font-medium">{feature.name}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{feature.blurb}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/agents"
              className="mt-7 inline-block rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] transition-colors hover:border-ink/30"
            >
              Try the support agent
            </Link>
          </div>
        </div>
      </section>

      {/* API */}
      <section id="api" className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-lg text-[32px] font-semibold leading-[1.15] tracking-[-0.025em]">
              Or build anything
              <br />
              on the same endpoints
            </h2>
            <Link
              href="/docs"
              className="rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] transition-colors hover:border-ink/30"
            >
              Explore the docs
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {MODELS.map((model) => (
              <div key={model.name} className="rounded-2xl border border-line bg-surface p-6">
                <h3 className="text-[15px] font-medium">{model.name}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{model.detail}</p>
                <p className="mt-4 font-mono text-[11.5px] text-muted">{model.meta}</p>
              </div>
            ))}
          </div>
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

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {UPDATES.map((update) => (
              <article key={update.title} className="rounded-2xl border border-line bg-surface p-6">
                <div aria-hidden className="mb-5 h-28 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200" />
                <h3 className="text-[15px] font-medium leading-snug">{update.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{update.blurb}</p>
                <p className="mt-4 text-[12px] text-muted">{update.date}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
          <h2 className="text-[28px] font-semibold tracking-[-0.025em]">AI voice platform</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-full border border-line px-5 py-2.5 text-[14px] transition-colors hover:border-ink/30"
            >
              Read the docs
            </Link>
            <Link href="/agents" className="rounded-full bg-ink px-6 py-2.5 text-[14px] font-medium text-white">
              Create an agent
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
