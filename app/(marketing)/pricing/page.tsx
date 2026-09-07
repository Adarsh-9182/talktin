import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Talktin",
  description: "What Talktin costs to run, and what the models underneath it cost.",
};

const TIERS = [
  {
    name: "Self-hosted",
    price: "Free",
    note: "What this repository is",
    blurb: "Clone it, bring your own Gemini key, and run the whole product locally or on a free Vercel plan.",
    features: [
      "Every tool: speech, dubbing, transcription, agents",
      "All 30 voices",
      "Your API key, your quota, your data",
      "No account, no billing, no limits we impose",
    ],
    action: { href: "https://github.com/Adarsh-9182/talktin", label: "Clone the repo" },
    emphasis: true,
  },
  {
    name: "Hosted",
    price: "Not yet",
    note: "Honest about what does not exist",
    blurb: "There is no hosted plan to sell you. When there is an account system and a billing integration, it will be listed here.",
    features: [
      "Saved projects and history",
      "Team access",
      "Usage dashboards",
      "Support commitments",
    ],
    action: { href: "/text-to-speech", label: "Use the studio meanwhile" },
    emphasis: false,
  },
];

const COSTS = [
  { item: "Speech generation", cost: "Free tier, then per million audio tokens", who: "Google AI Studio" },
  { item: "Transcription and translation", cost: "Free tier, then per million tokens", who: "Google AI Studio" },
  { item: "Speech recognition in agents", cost: "Free — it runs in your browser", who: "Web Speech API" },
  { item: "Hosting", cost: "Free tier", who: "Vercel" },
];

export default function Pricing() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-24">
        <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
          Pricing
        </h1>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
          Talktin is free because it does not host anything for you. You bring a key, the models bill you
          directly, and most people never leave the free tier.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
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
