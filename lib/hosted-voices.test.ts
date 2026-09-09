import assert from "node:assert/strict";
import { test } from "node:test";
import { HOSTED_VOICES, DEFAULT_HOSTED_VOICE, findHostedVoice } from "./hosted-voices.ts";
import { VOICES } from "./voices.ts";

/*
 * These two catalogues belong to two different engines and were confused for
 * one, which is how the dub route came to ask a hosted model for a voice
 * called `af_heart`. The bug was invisible because the endpoint needs a key
 * nobody had — it was waiting for the first person to add one. These tests
 * are the tripwire that stops the lists being wired to the wrong screen again.
 */
test("the hosted catalogue is well formed and its default exists", () => {
  assert.ok(HOSTED_VOICES.length > 0);
  const ids = new Set<string>();
  for (const voice of HOSTED_VOICES) {
    assert.equal(ids.has(voice.id), false, `duplicate hosted voice ${voice.id}`);
    ids.add(voice.id);
    assert.ok(voice.character.trim().length > 0, `${voice.id} has no character`);
  }
  assert.ok(findHostedVoice(DEFAULT_HOSTED_VOICE), "the default hosted voice is not in the catalogue");
  assert.equal(findHostedVoice("af_heart"), undefined, "an on-device id must not resolve as a hosted one");
});

test("no id appears in both catalogues", () => {
  const onDevice = new Set(VOICES.map((voice) => voice.id));
  for (const hosted of HOSTED_VOICES) {
    assert.equal(
      onDevice.has(hosted.id),
      false,
      `${hosted.id} is in both catalogues, so a mix-up would not be caught by these tests`,
    );
  }
});

test("the two catalogues do not share a naming shape", () => {
  // On-device ids are lowercase with an underscore (af_heart); hosted ids are
  // capitalised single words (Sulafat). Anything wired to the wrong list is
  // visible at a glance, which is the point of keeping the shapes apart.
  for (const voice of VOICES) assert.match(voice.id, /^[a-z]{2}_[a-z]+$/, `${voice.id} broke the on-device id shape`);
  for (const voice of HOSTED_VOICES) assert.match(voice.id, /^[A-Z][A-Za-z]+$/, `${voice.id} broke the hosted id shape`);
});
