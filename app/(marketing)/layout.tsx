import Link from "next/link";
import { Logo } from "@/components/Shell";

const PRODUCTS = [
  { href: "/text-to-speech", label: "Text to Speech" },
  { href: "/voices", label: "Voices" },
  { href: "/dubbing", label: "Dubbing" },
  { href: "/speech-to-text", label: "Speech to Text" },
  { href: "/agents", label: "Voice Agents" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>

          <nav className="hidden gap-6 text-[13.5px] text-muted md:flex">
            {PRODUCTS.slice(0, 4).map((product) => (
              <Link key={product.href} href={product.href} className="transition-colors hover:text-ink">
                {product.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/text-to-speech"
            className="ml-auto rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white"
          >
            Open the studio
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-[220px] text-[13px] leading-relaxed text-muted">
              An AI voice studio built on free-tier models, in the open.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-muted">Products</p>
            <ul className="space-y-2 text-[13.5px]">
              {PRODUCTS.map((product) => (
                <li key={product.href}>
                  <Link href={product.href} className="text-muted transition-colors hover:text-ink">
                    {product.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-muted">Project</p>
            <ul className="space-y-2 text-[13.5px]">
              <li>
                <a
                  href="https://github.com/Adarsh-9182/talktin"
                  className="text-muted transition-colors hover:text-ink"
                >
                  Source on GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://aistudio.google.com/apikey"
                  className="text-muted transition-colors hover:text-ink"
                >
                  Get an API key
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line px-6 py-5 text-center text-[12px] text-muted">
          Built by Adarsh Bhardwaj. Not affiliated with any other voice platform.
        </div>
      </footer>
    </div>
  );
}
