/**
 * The site's own address. Vercel exposes the production domain at build time;
 * everything else falls back to localhost so links still work in development.
 */
export const SITE_URL = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
})();

export const SITE_NAME = "Talktin";
export const SITE_TAGLINE = "AI voice studio";
export const SITE_DESCRIPTION =
  "Turn text into natural speech in 90+ languages, dub video into any language, transcribe recordings, and deploy agents that talk.";
