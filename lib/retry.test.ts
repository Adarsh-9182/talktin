import assert from "node:assert/strict";
import test from "node:test";
import { isTransient, retryProvider } from "./audio.ts";

/** Records the backoff instead of sleeping it. */
function recorder() {
  const waits: number[] = [];
  return { waits, wait: async (ms: number) => void waits.push(ms) };
}

test("a rate limit is retried until it succeeds", async () => {
  const { waits, wait } = recorder();
  let attempts = 0;

  const result = await retryProvider(async () => {
    attempts += 1;
    if (attempts < 3) throw Object.assign(new Error("Too Many Requests"), { status: 429 });
    return "audio";
  }, { wait });

  assert.equal(result, "audio");
  assert.equal(attempts, 3);
  assert.equal(waits.length, 2);
  // Exponential, with jitter on top of each step.
  assert.ok(waits[0]! >= 1_000 && waits[0]! < 1_500, `first wait was ${waits[0]}`);
  assert.ok(waits[1]! >= 2_000 && waits[1]! < 2_500, `second wait was ${waits[1]}`);
});

test("a bad request is not retried — it would fail identically every time", async () => {
  const { waits, wait } = recorder();
  let attempts = 0;

  await assert.rejects(
    () =>
      retryProvider(async () => {
        attempts += 1;
        throw Object.assign(new Error("Invalid argument"), { status: 400 });
      }, { wait }),
    /Invalid argument/,
  );

  assert.equal(attempts, 1);
  assert.equal(waits.length, 0);
});

test("gives up after the last attempt and rethrows the real error", async () => {
  const { wait } = recorder();
  let attempts = 0;

  await assert.rejects(
    () =>
      retryProvider(async () => {
        attempts += 1;
        throw Object.assign(new Error("503 Service Unavailable"), { status: 503 });
      }, { wait, maxAttempts: 3 }),
    /503/,
  );

  assert.equal(attempts, 3);
});

test("recognises transient failures by status and by message", () => {
  assert.equal(isTransient({ status: 429 }), true);
  assert.equal(isTransient({ status: 503 }), true);
  assert.equal(isTransient({ status: 400 }), false);
  assert.equal(isTransient(new Error("Resource has been exhausted (quota)")), true);
  assert.equal(isTransient(new Error("The model is overloaded")), true);
  assert.equal(isTransient(new Error("Invalid voice name")), false);
});

test("succeeds first time without waiting at all", async () => {
  const { waits, wait } = recorder();
  assert.equal(await retryProvider(async () => "fine", { wait }), "fine");
  assert.equal(waits.length, 0);
});
