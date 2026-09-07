"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ALL_NAV } from "./nav";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ALL_NAV;
    return ALL_NAV.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(term));
  }, [query]);

  // Derived, not stored: the list shrinks as you type, and clamping in an
  // effect would re-render a second time to fix what render already knew.
  const active = Math.min(cursor, Math.max(0, results.length - 1));

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setCursor((previous) => Math.min(previous + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setCursor((previous) => Math.max(previous - 1, 0));
            }
            if (event.key === "Enter" && results[active]) go(results[active]!.href);
          }}
          placeholder="Search everything…"
          className="w-full border-b border-line px-5 py-4 text-[15px] outline-none placeholder:text-muted/70"
        />

        {results.length === 0 ? (
          <p className="px-5 py-6 text-[13.5px] text-muted">Nothing matches “{query.trim()}”.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-2">
            {results.map((item, index) => (
              <li key={`${item.href}-${item.label}`}>
                <button
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => go(item.href)}
                  className={`flex w-full items-baseline gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    index === active ? "bg-canvas" : ""
                  }`}
                >
                  <span className="text-[13.5px]">{item.label}</span>
                  <span className="truncate text-[12px] text-muted">{item.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
