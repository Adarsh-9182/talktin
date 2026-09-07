import assert from "node:assert/strict";
import test from "node:test";
import { readWav, stitchWav, writeWav } from "./stitch.ts";

function wav(samples: number[], sampleRate = 24_000): ArrayBuffer {
  const blob = writeWav({
    samples: new Uint8Array(samples),
    sampleRate,
    channels: 1,
    bitsPerSample: 16,
  });
  return blob as unknown as ArrayBuffer;
}

test("what is written can be read back", async () => {
  const blob = writeWav({ samples: new Uint8Array([1, 2, 3, 4]), sampleRate: 24_000, channels: 1, bitsPerSample: 16 });
  const parsed = readWav(await blob.arrayBuffer());
  assert.deepEqual([...parsed.samples], [1, 2, 3, 4]);
  assert.equal(parsed.sampleRate, 24_000);
  assert.equal(parsed.channels, 1);
});

test("finds the data chunk even when another chunk comes first", async () => {
  // A LIST chunk between fmt and data is legal, and a reader that assumes byte
  // 44 would splice the metadata into the audio.
  const source = await (
    writeWav({ samples: new Uint8Array([9, 9]), sampleRate: 24_000, channels: 1, bitsPerSample: 16 })
  ).arrayBuffer();

  const original = new Uint8Array(source);
  const list = new Uint8Array([0x4c, 0x49, 0x53, 0x54, 4, 0, 0, 0, 1, 2, 3, 4]); // "LIST", 4 bytes
  const rebuilt = new Uint8Array(original.length + list.length);
  rebuilt.set(original.subarray(0, 36), 0);
  rebuilt.set(list, 36);
  rebuilt.set(original.subarray(36), 36 + list.length);
  new DataView(rebuilt.buffer).setUint32(4, rebuilt.length - 8, true);

  assert.deepEqual([...readWav(rebuilt.buffer).samples], [9, 9]);
});

test("rejects something that is not a WAV at all", () => {
  const notAudio = new TextEncoder().encode("this is a JSON error body").buffer;
  assert.throws(() => readWav(notAudio), /not a WAV/);
});

test("joins clips with a silent gap between them", async () => {
  const a = new Blob([wav([1, 1, 1, 1])], { type: "audio/wav" });
  const b = new Blob([wav([2, 2, 2, 2])], { type: "audio/wav" });

  const joined = readWav(await (await stitchWav([a, b], 10)).arrayBuffer());
  const gapBytes = Math.round((24_000 * 10) / 1000) * 2;

  assert.equal(joined.samples.length, 4 + gapBytes + 4);
  assert.deepEqual([...joined.samples.subarray(0, 4)], [1, 1, 1, 1]);
  assert.ok(joined.samples.subarray(4, 4 + gapBytes).every((byte) => byte === 0));
  assert.deepEqual([...joined.samples.subarray(4 + gapBytes)], [2, 2, 2, 2]);
});

test("a single clip comes back with no gap bolted on", async () => {
  const only = new Blob([wav([7, 7])], { type: "audio/wav" });
  const joined = readWav(await (await stitchWav([only], 450)).arrayBuffer());
  assert.deepEqual([...joined.samples], [7, 7]);
});

test("joining nothing is an error, not an empty file", async () => {
  await assert.rejects(() => stitchWav([]), /nothing to join/);
});
