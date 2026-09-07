import assert from "node:assert/strict";
import test from "node:test";
import { ago } from "./assets.ts";

test("describes recent timestamps in words", () => {
  const now = Date.UTC(2026, 8, 7, 12, 0, 0);
  assert.equal(ago(now - 5_000, now), "just now");
  assert.equal(ago(now - 60_000, now), "1 minute ago");
  assert.equal(ago(now - 45 * 60_000, now), "45 minutes ago");
  assert.equal(ago(now - 3 * 3_600_000, now), "3 hours ago");
  assert.equal(ago(now - 50 * 3_600_000, now), "2 days ago");
});

test("a timestamp in the future reads as just now, not negative", () => {
  const now = Date.UTC(2026, 8, 7, 12, 0, 0);
  assert.equal(ago(now + 10_000, now), "just now");
});
