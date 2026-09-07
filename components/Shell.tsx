"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { heading: string; items: { href: string; label: string; soon?: boolean }[] }[] = [
  {
    heading: "Create",
    items: [
      { href: "/text-to-speech", label: "Text to Speech" },
      { href: "/voices", label: "Voices" },
      { href: "/dubbing", label: "Dubbing" },
      { href: "/speech-to-text", label: "Speech to Text" },
    ],
  },
  {
    heading: "Agents",
    items: [{ href: "/agents", label: "Voice Agents" }],
  },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="flex h-5 items-end gap-[3px]">
        {[8, 15, 20, 11].map((height, index) => (
          <span key={index} className="w-[3px] rounded-full bg-ink" style={{ height }} />
        ))}
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Talktin</span>
    </span>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        <Link href="/" className="mb-8 px-2">
          <Logo />
        </Link>

        <nav className="flex-1 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                {section.heading}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[13.5px] transition-colors ${
                          active ? "bg-canvas font-medium text-ink" : "text-muted hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <a
          href="https://github.com/Adarsh-9182/talktin"
          className="px-2 text-[12px] text-muted transition-colors hover:text-ink"
        >
          Source on GitHub
        </a>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-line px-6 py-3 md:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}

/** Horizontal nav for narrow screens, where the sidebar is hidden. */
export function MobileNav() {
  const pathname = usePathname();
  const items = SECTIONS.flatMap((section) => section.items);

  return (
    <nav className="-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 pb-1 md:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
            pathname === item.href ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
