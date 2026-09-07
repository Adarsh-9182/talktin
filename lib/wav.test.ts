import assert from "node:assert/strict";
import test from "node:test";
import { pcmToWav } from "./wav.ts";

test("writes a RIFF/WAVE header in front of the samples", () => {
  const pcm = Buffer.alloc(100, 7);
  const wav = pcmToWav(pcm);
  assert.equal(wav.length, 144);
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.readUInt32LE(4), 136);
  assert.equal(wav.readUInt32LE(40), 100);
  assert.equal(wav[44], 7);
});

test("records the sample rate and byte rate it was given", () => {
  const wav = pcmToWav(Buffer.alloc(8), 48_000, 2, 16);
  assert.equal(wav.readUInt32LE(24), 48_000);
  assert.equal(wav.readUInt32LE(28), 48_000 * 4);
  assert.equal(wav.readUInt16LE(32), 4);
});
