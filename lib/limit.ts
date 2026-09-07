/**
 * A sliding-window rate limit, held in memory.
 *
 * On serverless this counts per instance rather than globally, so a burst
 * spread across cold starts can exceed the number below. That is a real
 * limitation and the reason this is a guard rather than a quota: it stops one
 * open tab from draining a free tier, which is the failure that actually
 * happens, without pretending to be a distributed limiter.
 */
interface Window {
  hits: number[];
}

const WINDOWS = new Map<string, Window>();
const SWEEP_AFTER = 5_000;
let lastSweep = 0;

export interface Limit {
  /** Requests allowed inside the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface Decision {
  ok: boolean;
  remaining: number;
  /** Seconds until the caller may retry. Zero when they are not limited. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: Limit, now = Date.now()): Decision {
  sweep(now, limit.windowMs);

  const window = WINDOWS.get(key) ?? { hits: [] };
  const cutoff = now - limit.windowMs;
  window.hits = window.hits.filter((hit) => hit > cutoff);

  if (window.hits.length >= limit.max) {
    WINDOWS.set(key, window);
    const oldest = window.hits[0]!;
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + limit.windowMs - now) / 1000)),
    };
  }

  window.hits.push(now);
  WINDOWS.set(key, window);
  return { ok: true, remaining: limit.max - window.hits.length, retryAfter: 0 };
}

/** Drops windows nobody has touched, so the map cannot grow without bound. */
function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_AFTER) return;
  lastSweep = now;
  const cutoff = now - windowMs;
  for (const [key, window] of WINDOWS) {
    if (window.hits.every((hit) => hit <= cutoff)) WINDOWS.delete(key);
  }
}

/** Best guess at who is calling, behind whatever proxy is in front of us. */
export function callerKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

/** Only exported for tests, which must not inherit another test's counters. */
export function resetLimits() {
  WINDOWS.clear();
  lastSweep = 0;
}

/**
 * Per-endpoint budgets, sized by what one request actually costs. Dubbing runs
 * three model calls and Studio can run twenty, so they cannot share a number
 * with a single line of speech.
 */
export const BUDGETS = {
  speech: { max: 30, windowMs: 5 * 60_000 },
  agent: { max: 40, windowMs: 5 * 60_000 },
  transcribe: { max: 10, windowMs: 10 * 60_000 },
  dub: { max: 5, windowMs: 10 * 60_000 },
} as const satisfies Record<string, Limit>;

/** Returns a 429 to send back, or null when the caller is within budget. */
export function guard(request: Request, scope: keyof typeof BUDGETS): Response | null {
  const decision = rateLimit(callerKey(request, scope), BUDGETS[scope]);
  if (decision.ok) return null;

  return new Response(
    JSON.stringify({
      error: `Too many requests. Try again in ${decision.retryAfter} second${decision.retryAfter === 1 ? "" : "s"}.`,
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(decision.retryAfter),
      },
    },
  );
}
