"use client";

import Link from "next/link";
import { useState } from "react";
import { HeroDemo } from "@/components/HeroDemo";
import { ResolutionChart } from "./ResolutionChart";

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

const TABS = [
  { id: "studio", label: "Studio", dot: "bg-orange-400" },
  { id: "agents", label: "Agents", dot: "bg-emerald-500" },
  { id: "api", label: "API", dot: "bg-zinc-400" },
] as const;

export function ProductTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("studio");

  return (
    <div className="rounded-3xl border border-line bg-canvas p-2">
      <div role="tablist" aria-label="Products" className="grid grid-cols-3 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] transition-colors ${
              active === tab.id ? "bg-surface font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : "text-muted"
            }`}
          >
            <span aria-hidden className={`h-2 w-2 rounded-full ${tab.dot}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-2 rounded-2xl bg-surface p-5 sm:p-7">
        {active === "studio" && (
          <div>
            <p className="mb-4 text-[13px] text-muted">
              Ultra-realistic speech, directed in words rather than sliders.
            </p>
            <HeroDemo />
          </div>
        )}

        {active === "agents" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2.5">
              <p className="ml-auto w-fit rounded-2xl bg-ink px-4 py-2 text-[13.5px] text-white">
                Can I get a refund?
              </p>
              <p className="w-fit rounded-2xl bg-canvas px-4 py-2 text-[13.5px]">
                Sure — can you share your order number?
              </p>
              <p className="ml-auto w-fit rounded-2xl bg-ink px-4 py-2 text-[13.5px] text-white">TK4543490</p>
              <p className="w-fit rounded-2xl bg-canvas px-4 py-2 text-[13.5px]">
                That one was delivered, so it qualifies. Shall I start it?
              </p>
              <ul className="space-y-1 pt-1 text-[11.5px] text-muted">
                <li className="rounded-lg border border-line px-3 py-1.5">
                  <span className="font-medium text-ink">lookup_order</span> ↳ delivered, ₹8,499
                </li>
                <li className="rounded-lg border border-line px-3 py-1.5">
                  <span className="font-medium text-ink">refund_policy</span> ↳ 30 days from delivery
                </li>
              </ul>
            </div>
            <ResolutionChart />
          </div>
        )}

        {active === "api" && (
          <div>
            <p className="mb-4 text-[13px] text-muted">
              Every screen here is built on the same routes you can call yourself.
            </p>
            <pre className="overflow-x-auto rounded-2xl border border-line bg-canvas p-5 text-[12.5px] leading-relaxed">
              <code>{SNIPPET}</code>
            </pre>
            <Link href="/docs" className="mt-4 inline-block text-[13px] text-muted transition-colors hover:text-ink">
              Read the API reference →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
