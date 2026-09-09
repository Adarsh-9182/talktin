export interface NavItem {
  href: string;
  label: string;
  hint: string;
  /**
   * True for the tools that call a hosted model. On a deployment with no key
   * they are marked in the sidebar rather than silently leading somewhere
   * that cannot work — the page itself explains the rest.
   */
  hosted?: true;
}

/** The workspace itself: places, not tools. */
export const WORKSPACE: NavItem[] = [
  { href: "/home", label: "Home", hint: "Write something and hear it" },
  { href: "/voices", label: "Voices", hint: "Audition every voice, on your machine" },
  { href: "/studio", label: "Studio", hint: "Long-form, block by block" },
  { href: "/templates", label: "Templates", hint: "Starting points for the composer" },
  { href: "/assets", label: "Assets", hint: "Everything you have generated" },
];

/** The tools, which in the reference product live under a "Pinned" heading. */
export const TOOLS: NavItem[] = [
  { href: "/home", label: "Text to Speech", hint: "Text in, speech out" },
  { href: "/speech-to-text", label: "Speech to Text", hint: "Recording in, transcript out", hosted: true },
  { href: "/dubbing", label: "Dubbing", hint: "A clip in another language", hosted: true },
  { href: "/agents", label: "Voice Agents", hint: "An agent that talks and uses tools", hosted: true },
];

export const ALL_NAV: NavItem[] = [
  ...WORKSPACE,
  ...TOOLS.filter((tool) => !WORKSPACE.some((item) => item.href === tool.href)),
  { href: "/docs", label: "API reference", hint: "The on-device call, and the server routes" },
  { href: "/pricing", label: "Pricing", hint: "What this costs to run" },
  { href: "/", label: "Landing page", hint: "The public site" },
];
