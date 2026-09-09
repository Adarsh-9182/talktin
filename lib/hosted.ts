/**
 * WHICH HALF OF THIS PRODUCT NEEDS A SERVER
 *
 * Speech runs in the browser and needs nothing. Dubbing, transcription and
 * agents call a hosted model and need `GEMINI_API_KEY`. On a deployment
 * without one, those three pages used to render their full interface — a
 * dropzone, a record button, a chat box — and hand back a 500 the moment
 * anyone used them. That is the worst of both: it looks finished, and it
 * fails at exactly the moment someone decided to trust it.
 *
 * So the pages ask this first and say plainly that the feature is off here,
 * what it does, and how to switch it on. A visitor learns the truth before
 * spending effort rather than after.
 *
 * Server-only. The answer must never be bundled into client JavaScript — not
 * because the boolean is secret, but because reading it there would mean
 * importing a module that touches process.env into the browser.
 */
import "server-only";

/** True when the hosted half of the product can actually run. */
export const HOSTED_CONFIGURED = Boolean(process.env.GEMINI_API_KEY);

/** The three tools that are gated, described the way each page describes itself. */
export const HOSTED_TOOLS = {
  dubbing: {
    name: "Dubbing",
    does: "Transcribes a clip, translates it to roughly the same spoken length so the timing still fits, and speaks the translation back.",
  },
  transcription: {
    name: "Speech to Text",
    does: "Turns an audio or video file into text, with each speaker labelled rather than run together.",
  },
  agents: {
    name: "Voice Agents",
    does: "Holds a conversation, calls tools to look things up, and prints every tool it reached for under the reply.",
  },
} as const;

export type HostedTool = keyof typeof HOSTED_TOOLS;
