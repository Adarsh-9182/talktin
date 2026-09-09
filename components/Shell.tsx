"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandPalette } from "./CommandPalette";
import { TOOLS, WORKSPACE, type NavItem } from "./nav";

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

function NavLink({ item, active, gated = false }: { item: NavItem; active: boolean; gated?: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] transition-colors ${
        active ? "bg-canvas font-medium text-ink" : "text-muted hover:text-ink"
      }`}
    >
      <span>{item.label}</span>
      {gated && (
        // Marked, not hidden. Someone running their own copy can turn this on,
        // and hiding it would make the product look smaller than it is.
        <span
          title="Needs a server key, which this deployment does not have"
          className="rounded-full border border-line px-1.5 py-px text-[10px] font-normal text-muted"
        >
          key
        </span>
      )}
    </Link>
  );
}

/**
 * `hostedConfigured` is read on the server and passed down, because the answer
 * lives in an environment variable a client component must never touch. When
 * it is false the three hosted tools carry a marker.
 */
export function Shell({ children, hostedConfigured }: { children: React.ReactNode; hostedConfigured: boolean }) {
  const pathname = usePathname();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearching((previous) => !previous);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const title =
    [...WORKSPACE, ...TOOLS].find((item) => item.href === pathname)?.label ?? "Talktin";

  return (
    <div className="flex min-h-dvh">
      {/* Lets keyboard users past the sidebar without tabbing through every tool. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:text-white"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        <Link href="/home" className="mb-7 px-2">
          <Logo />
        </Link>

        <nav className="flex-1 space-y-6 overflow-y-auto">
          <ul className="space-y-0.5">
            {WORKSPACE.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={pathname === item.href} />
              </li>
            ))}
          </ul>

          <div>
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Pinned</p>
            <ul className="space-y-0.5">
              {TOOLS.map((item) => (
                <li key={item.label}>
                  <NavLink
                    item={item}
                    active={pathname === item.href}
                    gated={item.hosted === true && !hostedConfigured}
                  />
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mt-4 rounded-xl border border-line bg-canvas p-3">
          <p className="text-[12.5px] font-medium">Run it yourself</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
            Speech already runs on your machine. A key adds the other three.
          </p>
          <a
            href="https://github.com/Adarsh-9182/talktin"
            className="mt-2 inline-block text-[11.5px] text-muted underline underline-offset-2 transition-colors hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface/85 px-4 py-2.5 backdrop-blur md:px-6">
          <Link href="/home" className="md:hidden">
            <Logo />
          </Link>
          <span className="hidden text-[13.5px] font-medium md:block">{title}</span>

          <button
            onClick={() => setSearching(true)}
            className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-ink/20"
          >
            Search everything…
            <kbd className="ml-auto rounded border border-line bg-surface px-1.5 py-0.5 text-[11px]">⌘K</kbd>
          </button>

          <Link href="/docs" className="hidden text-[13px] text-muted transition-colors hover:text-ink sm:block">
            Docs
          </Link>
        </header>

        <main id="main" className="min-w-0 flex-1">{children}</main>
      </div>

      {searching && <CommandPalette onClose={() => setSearching(false)} />}
    </div>
  );
}

/** Horizontal nav for narrow screens, where the sidebar is hidden. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 pb-1 md:hidden">
      {[...WORKSPACE, ...TOOLS.slice(1)].map((item) => (
        <Link
          key={item.label}
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
