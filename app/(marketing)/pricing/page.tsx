import Link from "next/link";
import type { Metadata } from "next";
import { VOICES } from "@/lib/voices";

export const metadata: Metadata = {
  title: "Pricing — Talktin",
  description:
    "Speech is free with no account and no key, because it runs on your machine. Here is exactly where that stops being true.",
};

/*
 * This page used to open by telling every visitor to bring an API key. That is
 * no longer true of the thing most of them came for: speech runs in the
 * browser, so it costs nothing and needs nothing. A key only buys the three
 * tools that still call a hosted model, and the tiers are shaped to say so
 * rather than to bury it.
 */
const TIERS = [
  {
    name: "Just use it",
    price: "Free",
    note: "No account, nothing to enter",
    blurb: "Open the studio and generate. The model downloads once to your browser and the work happens there, so there is nothing for us to meter.",
    features: [
      "Text to speech and long-form Studio",
      `All ${VOICES.length} voices, with the model author's grades shown`,
      "Unlimited characters — there is no counter",
      "Your text never leaves the tab",
    ],
    action: { href: "/text-to-speech", label: "Open the studio" },
    emphasis: true,
  },
  {
    name: "Self-hosted",
    price: "Free + your key",
    note: "What this repository is",
    blurb: "Clone it and add a Gemini key to unlock the three tools that still need a server. The key is yours, so the bill and the data are too.",
    features: [
      "Everything above, unchanged",
      "Dubbing, transcription, and agents",
      "Your API key, your quota, your logs",
      "Runs on a free Vercel plan",
    ],
    action: { href: "https://github.com/Adarsh-9182/talktin", label: "Clone the repo" },
    emphasis: false,
  },
  {
    name: "Hosted accounts",
    price: "Not yet",
    note: "Honest about what does not exist",
    blurb: "There is no paid plan to sell you. When there is an account system and a billing integration, it will be listed here.",
    features: [
      "Saved projects and history",
      "Team access",
      "Usage dashboards",
      "Support commitments",
    ],
    action: { href: "/docs", label: "Read the docs meanwhile" },
    emphasis: false,
  },
];

const COSTS = [
  { item: "Speech generation", cost: "Free, at any volume — it runs on your machine", who: "Kokoro-82M, Apache-2.0" },
  { item: "The one-time model download", cost: "Roughly 80MB, cached by your browser", who: "Hugging Face CDN" },
  { item: "Speech recognition in agents", cost: "Free — it runs in your browser", who: "Web Speech API" },
  { item: "Dubbing, transcription, agent replies", cost: "Free tier, then per million tokens", who: "Google AI Studio" },
  { item: "Hosting", cost: "Free tier", who: "Vercel" },
];

export default function Pricing() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-24">
        <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
          Pricing
        </h1>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
          Speech costs nothing here and never will, because we are not the ones generating it — your
          browser is. A key buys the three tools that still call a hosted model, and nothing else. The
          table below is the whole of it.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border p-7 ${tier.emphasis ? "border-ink bg-canvas" : "border-line bg-surface"}`}
            >
              <p className="text-[12px] font-medium uppercase tracking-wider text-muted">{tier.note}</p>
              <h2 className="mt-3 text-[20px] font-medium">{tier.name}</h2>
              <p className="mt-4 text-[36px] font-semibold tracking-tight">{tier.price}</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{tier.blurb}</p>

              <ul className="mt-6 space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-[13.5px]">
                    <span aria-hidden className="text-muted">—</span>
                    <span className={tier.emphasis ? "" : "text-muted"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.action.href}
                className={`mt-8 inline-block rounded-full px-5 py-2.5 text-[13.5px] font-medium ${
                  tier.emphasis ? "bg-ink text-white" : "border border-line transition-colors hover:border-ink/30"
                }`}
              >
                {tier.action.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em]">What actually costs money</h2>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
            Nothing here is billed by Talktin. These are the services underneath, so you can see exactly
            where a bill could come from.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] uppercase tracking-wider text-muted">
                  <th className="pb-3 font-medium">Part</th>
                  <th className="pb-3 font-medium">Cost</th>
                  <th className="pb-3 font-medium">Billed by</th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map((row) => (
                  <tr key={row.item} className="border-b border-line">
                    <td className="py-3.5 text-[13.5px]">{row.item}</td>
                    <td className="py-3.5 text-[13.5px] text-muted">{row.cost}</td>
                    <td className="py-3.5 text-[13.5px] text-muted">{row.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
