export interface NavItem {
  href: string;
  label: string;
  hint: string;
}

/** The workspace itself: places, not tools. */
export const WORKSPACE: NavItem[] = [
  { href: "/home", label: "Home", hint: "Write something and hear it" },
  { href: "/voices", label: "Voices", hint: "Audition all 30 voices" },
  { href: "/studio", label: "Studio", hint: "Long-form, block by block" },
  { href: "/templates", label: "Templates", hint: "Starting points for the composer" },
  { href: "/assets", label: "Assets", hint: "Everything you have generated" },
];

/** The tools, which in the reference product live under a "Pinned" heading. */
export const TOOLS: NavItem[] = [
  { href: "/home", label: "Text to Speech", hint: "Text in, speech out" },
  { href: "/speech-to-text", label: "Speech to Text", hint: "Recording in, transcript out" },
  { href: "/dubbing", label: "Dubbing", hint: "A clip in another language" },
  { href: "/agents", label: "Voice Agents", hint: "An agent that talks and uses tools" },
];

export const ALL_NAV: NavItem[] = [
  ...WORKSPACE,
  ...TOOLS.filter((tool) => !WORKSPACE.some((item) => item.href === tool.href)),
  { href: "/docs", label: "API reference", hint: "The four endpoints" },
  { href: "/pricing", label: "Pricing", hint: "What this costs to run" },
  { href: "/", label: "Landing page", hint: "The public site" },
];
