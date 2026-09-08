/**
 * The composer's unsent text, kept across navigations. Losing a paragraph
 * because you clicked Templates is a small thing that feels like a bug, and
 * localStorage is the right size of tool for it — this is a per-browser
 * convenience, not data anyone needs back later.
 */
export interface Draft {
  text: string;
  speed: number;
  voice: string;
}

const KEY = "talktin:composer-draft";

export function loadDraft(): Draft | null {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<Draft>;
    if (typeof parsed.text !== "string") return null;
    return {
      text: parsed.text,
      // Drafts saved before the engine change carry a `style` string; they
      // reopen at normal speed rather than being thrown away.
      speed: typeof parsed.speed === "number" ? parsed.speed : 1,
      voice: typeof parsed.voice === "string" ? parsed.voice : "",
    };
  } catch {
    // Private windows and blocked site data both throw here rather than
    // returning null, and neither is a reason to fail to render a text box.
    return null;
  }
}

export function saveDraft(draft: Draft): void {
  try {
    if (!draft.text.trim()) {
      localStorage.removeItem(KEY);
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* Storage is a convenience; never let it interrupt typing. */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* As above. */
  }
}
