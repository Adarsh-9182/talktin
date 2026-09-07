import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { callerKey, rateLimit, resetLimits } from "./limit.ts";

beforeEach(resetLimits);

const LIMIT = { max: 3, windowMs: 60_000 };

test("allows up to the limit, then refuses", () => {
  const now = 1_000_000;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const decision = rateLimit("a", LIMIT, now);
    assert.equal(decision.ok, true, `attempt ${attempt} should be allowed`);
    assert.equal(decision.remaining, 3 - attempt);
  }

  const refused = rateLimit("a", LIMIT, now);
  assert.equal(refused.ok, false);
  assert.equal(refused.remaining, 0);
  assert.equal(refused.retryAfter, 60);
});

test("the window slides rather than resetting on a fixed clock", () => {
  const start = 2_000_000;
  rateLimit("b", LIMIT, start);
  rateLimit("b", LIMIT, start + 30_000);
  rateLimit("b", LIMIT, start + 40_000);
  assert.equal(rateLimit("b", LIMIT, start + 41_000).ok, false);

  // The first hit has aged out by now, so exactly one slot opens up.
  assert.equal(rateLimit("b", LIMIT, start + 61_000).ok, true);
  assert.equal(rateLimit("b", LIMIT, start + 61_000).ok, false);
});

test("callers are counted separately", () => {
  const now = 3_000_000;
  for (let attempt = 0; attempt < 3; attempt++) rateLimit("c", LIMIT, now);
  assert.equal(rateLimit("c", LIMIT, now).ok, false);
  assert.equal(rateLimit("d", LIMIT, now).ok, true);
});

test("scopes keep one endpoint from spending another's budget", () => {
  const request = new Request("https://example.com", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } });
  assert.equal(callerKey(request, "speech"), "speech:1.2.3.4");
  assert.notEqual(callerKey(request, "speech"), callerKey(request, "dub"));
});

test("falls back to a shared key when no address is forwarded", () => {
  assert.equal(callerKey(new Request("https://example.com"), "speech"), "speech:unknown");
});
