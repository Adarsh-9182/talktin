import Link from "next/link";
import { Logo } from "@/components/Shell";

const NAV = [
  { href: "/text-to-speech", label: "Products" },
  { href: "/#platforms", label: "Solutions" },
  { href: "/#research", label: "Research" },
  { href: "/pricing", label: "Pricing" },
];

const FOOTER = [
  {
    heading: "Studio",
    links: [
      { href: "/text-to-speech", label: "Text to Speech" },
      { href: "/speech-to-text", label: "Speech to Text" },
      { href: "/voices", label: "Voices" },
      { href: "/dubbing", label: "Dubbing" },
      { href: "/studio", label: "Long-form Studio" },
    ],
  },
  {
    heading: "Agents",
    links: [
      { href: "/agents", label: "Voice Agents" },
      { href: "/agents", label: "Tools" },
      { href: "/agents", label: "Guardrails" },
      { href: "/#agents", label: "Monitoring" },
    ],
  },
  {
    heading: "API",
    links: [
      { href: "/docs", label: "API Reference" },
      { href: "/docs#speech", label: "Text to Speech API" },
      { href: "/docs#transcribe", label: "Speech to Text API" },
      { href: "/docs#dub", label: "Dubbing API" },
      { href: "/docs#agent", label: "Agents API" },
    ],
  },
];

const META = [
  {
    heading: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#safety", label: "Safety" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "https://github.com/Adarsh-9182/talktin", label: "GitHub" },
      { href: "https://aistudio.google.com/apikey", label: "Get an API key" },
    ],
  },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>

          <nav className="hidden gap-6 text-[13.5px] text-muted lg:flex">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/docs"
              className="hidden rounded-full border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink/30 sm:block"
            >
              Docs
            </Link>
            <Link href="/text-to-speech" className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white">
              Open the studio
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-[240px] text-[13px] leading-relaxed text-muted">
              An AI voice studio built on free-tier models, in the open.
            </p>
          </div>

          {[...FOOTER, ...META].map((column) => (
            <div key={column.heading}>
              <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-muted">{column.heading}</p>
              <ul className="space-y-2 text-[13.5px]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-muted transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line px-6 py-5 text-center text-[12px] text-muted">
          Built by Adarsh Bhardwaj · not affiliated with any other voice platform
        </div>
      </footer>
    </div>
  );
}
