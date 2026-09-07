import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_VOICE, findVoice, VOICES } from "./voices.ts";
import { DEFAULT_LANGUAGE, languageLabel, LANGUAGES } from "./languages.ts";

test("every voice has a unique id and a character", () => {
  assert.equal(new Set(VOICES.map((voice) => voice.id)).size, VOICES.length);
  assert.ok(VOICES.every((voice) => voice.character.length > 0));
});

test("the default voice exists in the catalogue", () => {
  assert.ok(findVoice(DEFAULT_VOICE));
});

test("findVoice rejects anything not in the catalogue", () => {
  // Callers fall back to the default on undefined, which is what keeps an
  // arbitrary string from reaching the provider as a voice name.
  assert.equal(findVoice("Nonexistent"), undefined);
  assert.equal(findVoice(""), undefined);
});

test("languages are unique and the default resolves", () => {
  assert.equal(new Set(LANGUAGES.map((language) => language.code)).size, LANGUAGES.length);
  assert.equal(languageLabel(DEFAULT_LANGUAGE), "Hindi");
  assert.equal(languageLabel("xx-XX"), undefined);
});
