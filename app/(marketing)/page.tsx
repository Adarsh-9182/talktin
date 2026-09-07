import Link from "next/link";
import { HeroDemo } from "@/components/HeroDemo";
import { VOICES } from "@/lib/voices";
import { LANGUAGES } from "@/lib/languages";

const TOOLS = [
  {
    href: "/text-to-speech",
    name: "Text to Speech",
    blurb: "Write a line, say how it should be read, hear it back. Direction is part of the prompt, not a slider.",
  },
  {
    href: "/dubbing",
    name: "Dubbing",
    blurb: "Drop in a clip and get it back in another language — transcribed, translated to fit the timing, and spoken.",
  },
  {
    href: "/speech-to-text",
    name: "Speech to Text",
    blurb: "Upload a recording or record one here. Speakers come back separated, not as one wall of text.",
  },
  {
    href: "/voices",
    name: "Voices",
    blurb: `${VOICES.length} voices, each with a character. Hear any of them before you write a word.`,
  },
];

const SNIPPET = `const response = await fetch("https://talktin.app/api/speech", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    text: "The first move is what sets everything in motion.",
    voice: "Achird",
    style: "Read this with quiet confidence",
  }),
});

const audio = await response.blob(); // audio/wav`;

export default function Landing() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[60px]">
              Give your words
              <br />
              a voice
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
              Speech in {LANGUAGES.length}+ languages, dubbing that keeps the timing, transcription that
              separates speakers, and agents that talk back. Built on free-tier models, in the open.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/text-to-speech"
                className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white"
              >
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

          <HeroDemo />
        </div>
      </section>

      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-lg text-[30px] font-semibold leading-tight tracking-[-0.02em]">
            Four tools on the same
            <br />
            speech foundation
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-ink/25"
              >
                <h3 className="text-[16px] font-medium">{tool.name}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{tool.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Voice Agents</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.02em]">
              Agents that talk,
              <br />
              and show their work
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Give an agent instructions and tools, then speak to it. Every tool it reached for is printed
              under the reply — because an agent that invents an order status looks exactly like one that
              looked it up.
            </p>
            <Link
              href="/agents"
              className="mt-7 inline-block rounded-full border border-line px-5 py-2.5 text-[14px] transition-colors hover:border-ink/30"
            >
              Try the support agent
            </Link>
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-canvas p-6">
            <p className="ml-auto w-fit rounded-2xl bg-ink px-4 py-2 text-[13.5px] text-white">
              Can I get a refund for TK4543490?
            </p>
            <div className="w-fit rounded-2xl bg-surface px-4 py-2 text-[13.5px]">
              Yes — that one was delivered, so it qualifies. Shall I start it?
            </div>
            <ul className="space-y-1 text-[11.5px] text-muted">
              <li className="rounded-lg border border-line bg-surface px-3 py-1.5">
                <span className="font-medium text-ink">lookup_order</span> ↳ delivered, ₹8,499
              </li>
              <li className="rounded-lg border border-line bg-surface px-3 py-1.5">
                <span className="font-medium text-ink">refund_policy</span> ↳ 30 days from delivery
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted">API</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.02em]">
              One endpoint,
              <br />
              audio back
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Every screen here is built on the same routes you can call yourself. Post text and a voice,
              get a WAV.
            </p>
          </div>

          <pre className="overflow-x-auto rounded-2xl border border-line bg-surface p-5 text-[12.5px] leading-relaxed">
            <code>{SNIPPET}</code>
          </pre>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em]">Hear it for yourself</h2>
          <Link
            href="/text-to-speech"
            className="rounded-full bg-ink px-6 py-2.5 text-[14px] font-medium text-white"
          >
            Open the studio
          </Link>
        </div>
      </section>
    </>
  );
}
