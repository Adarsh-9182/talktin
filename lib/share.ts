/**
 * SHARE LINKS THAT DO NOT UPLOAD THE THING BEING SHARED
 *
 * The product's one claim is that your words never leave your machine. A
 * share feature is where that claim usually quietly dies: the obvious design
 * is `/hear?text=…`, and a query string is sent to the server on every
 * request, written into its access log, and handed to any proxy or analytics
 * script in between. The words would leave the machine — not to be generated,
 * but on the way to a page whose whole point is that they do not.
 *
 * So the payload lives in the URL fragment instead. Browsers never transmit
 * anything after the `#`. The link works, the recipient hears the sentence,
 * and no server involved — ours included — ever sees a character of it.
 *
 * The trade is real and worth naming: a fragment is invisible to the server,
 * so a shared link cannot have a preview card showing the sentence, and it
 * cannot be rendered without JavaScript. Both are a fair price for the claim
 * being true rather than nearly true.
 */
import { DEFAULT_VOICE, findVoice } from "./voices.ts";

export interface SharedLine {
  text: string;
  voice: string;
  speed: number;
}

/** How much text a link may carry. Browsers cope with far more; this is about
 *  a link staying pasteable rather than about any technical ceiling. */
export const MAX_SHARED_CHARACTERS = 600;

/** Builds the fragment for a link. Returns the part after the `#`, no prefix. */
export function encodeShared({ text, voice, speed }: SharedLine): string {
  const parameters = new URLSearchParams();
  parameters.set("t", text.trim().slice(0, MAX_SHARED_CHARACTERS));
  parameters.set("v", voice);
  // Two decimals is every value the slider can produce, and it keeps a link
  // from carrying `0.9500000000000001`.
  parameters.set("s", speed.toFixed(2));
  return parameters.toString();
}

/**
 * Reads a fragment back. Returns null rather than a half-filled object when
 * there is no text, because a share page with nothing to say should show its
 * empty state instead of a play button that fails.
 */
export function decodeShared(fragment: string): SharedLine | null {
  const parameters = new URLSearchParams(fragment.replace(/^#/, ""));

  const text = (parameters.get("t") ?? "").trim().slice(0, MAX_SHARED_CHARACTERS);
  if (!text) return null;

  // A link is untrusted input like any other: the voice must exist in the
  // catalogue and the speed must be inside the range the engine accepts,
  // otherwise a hand-edited URL becomes an exception in the audio path.
  const voice = findVoice(parameters.get("v") ?? "")?.id ?? DEFAULT_VOICE;

  // The null check is not redundant: `Number(null)` is 0, not NaN, so a link
  // with no speed at all would have been read as 0 and clamped to the slowest
  // the engine allows. Every shared link without an `s` would have drawled.
  const raw = parameters.get("s");
  const parsed = raw === null ? Number.NaN : Number(raw);
  const speed = Number.isFinite(parsed) ? Math.min(2, Math.max(0.5, parsed)) : 1;

  return { text, voice, speed };
}

/** The full link to hand someone, given the origin the page is running on. */
export function shareUrl(origin: string, line: SharedLine): string {
  return `${origin.replace(/\/$/, "")}/hear#${encodeShared(line)}`;
}
