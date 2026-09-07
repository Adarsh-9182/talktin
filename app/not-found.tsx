import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Shell";

export const metadata: Metadata = { title: "Page not found" };

const ELSEWHERE = [
  { href: "/home", label: "Text to Speech" },
  { href: "/voices", label: "Voices" },
  { href: "/dubbing", label: "Dubbing" },
  { href: "/agents", label: "Voice Agents" },
  { href: "/docs", label: "API reference" },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-20">
      <Logo />
      <h1 className="mt-8 text-[40px] font-semibold leading-[1.1] tracking-[-0.03em]">
        There is nothing here
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        That address does not match any page. These are all of them.
      </p>

      <ul className="mt-8 space-y-2">
        {ELSEWHERE.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-line bg-surface px-4 py-3 text-[14px] transition-colors hover:border-ink/25"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
