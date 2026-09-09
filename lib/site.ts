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
export const SITE_TAGLINE = "The voice studio that runs in your browser";
export const SITE_DESCRIPTION =
  "Turn text into speech without sending it anywhere. Talktin runs an open speech model inside your own browser: 28 voices, no account, no API key, no character quota, and nothing uploaded.";
