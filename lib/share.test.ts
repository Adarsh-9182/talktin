import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeShared, encodeShared, shareUrl, MAX_SHARED_CHARACTERS } from "./share.ts";
import { DEFAULT_VOICE } from "./voices.ts";

test("a line survives the round trip", () => {
  const line = { text: "Hello — this is what I sound like.", voice: "bf_emma", speed: 1.05 };
  const back = decodeShared(encodeShared(line));
  assert.deepEqual(back, line);
});

test("text with the characters that break naive encoding survives", () => {
  // & and # are exactly what a hand-rolled `t=` + concatenation would lose.
  const line = { text: "Tom & Jerry #1 — 100% of it, a=b, c+d, é 日本語", voice: DEFAULT_VOICE, speed: 1 };
  assert.equal(decodeShared(encodeShared(line))?.text, line.text);
});

test("nothing to say is null, not a half-filled object", () => {
  assert.equal(decodeShared(""), null);
  assert.equal(decodeShared("#"), null);
  assert.equal(decodeShared("v=af_heart&s=1"), null);
  assert.equal(decodeShared("t=%20%20%20"), null);
});

/*
 * A link is untrusted input. Somebody will hand-edit one, and the audio path
 * must not be where that is discovered.
 */
test("a hand-edited link cannot put a bad value into the engine", () => {
  assert.equal(decodeShared("t=hi&v=not-a-voice")?.voice, DEFAULT_VOICE);
  assert.equal(decodeShared("t=hi&v=Sulafat")?.voice, DEFAULT_VOICE, "a hosted id is not an on-device one");
  assert.equal(decodeShared("t=hi&s=99")?.speed, 2);
  assert.equal(decodeShared("t=hi&s=-4")?.speed, 0.5);
  assert.equal(decodeShared("t=hi&s=banana")?.speed, 1);
  assert.equal(decodeShared("t=hi")?.speed, 1);
});

test("text is capped so a link stays pasteable", () => {
  const long = "a".repeat(MAX_SHARED_CHARACTERS + 500);
  assert.equal(decodeShared(encodeShared({ text: long, voice: DEFAULT_VOICE, speed: 1 }))?.text.length, MAX_SHARED_CHARACTERS);
});

/*
 * The whole point of the feature: the words sit after the `#`, which browsers
 * never transmit. If this ever becomes a query string the privacy claim on
 * the landing page silently stops being true.
 */
test("the payload is in the fragment and never in the query", () => {
  const url = shareUrl("https://talktin.app/", { text: "secret words", voice: DEFAULT_VOICE, speed: 1 });
  const [beforeHash, afterHash] = url.split("#");

  assert.equal(beforeHash, "https://talktin.app/hear");
  assert.equal(beforeHash.includes("?"), false, "a query string would be sent to the server");
  assert.ok(afterHash?.includes("secret"), "the words belong in the fragment");
});
