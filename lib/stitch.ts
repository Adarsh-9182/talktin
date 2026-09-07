/**
 * Joins WAV files in the browser.
 *
 * Long-form audio used to be built in one server request, which cannot work on
 * a 60-second function limit: twenty blocks is minutes of model time. Each
 * block is its own request now, and the pieces are assembled here — which also
 * means a failure on block fifteen keeps the fourteen that worked.
 */
const HEADER_BYTES = 44;

interface Pcm {
  samples: Uint8Array;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

/**
 * Pulls the samples out of a WAV. The chunks are walked rather than assumed to
 * start at byte 44, because a file with a LIST or fact chunk is still a valid
 * WAV and slicing blindly would splice metadata into the audio.
 */
export function readWav(buffer: ArrayBuffer): Pcm {
  const view = new DataView(buffer);
  const ascii = (offset: number) =>
    String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));

  if (buffer.byteLength < 12 || ascii(0) !== "RIFF" || ascii(8) !== "WAVE") {
    throw new Error("That is not a WAV file.");
  }

  let sampleRate = 24_000;
  let channels = 1;
  let bitsPerSample = 16;
  let samples: Uint8Array | null = null;

  let offset = 12;
  while (offset + 8 <= buffer.byteLength) {
    const id = ascii(offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;

    if (id === "fmt " && body + 16 <= buffer.byteLength) {
      channels = view.getUint16(body + 2, true);
      sampleRate = view.getUint32(body + 4, true);
      bitsPerSample = view.getUint16(body + 14, true);
    } else if (id === "data") {
      // A truncated file reports more data than it holds; take what is there.
      const end = Math.min(body + size, buffer.byteLength);
      samples = new Uint8Array(buffer.slice(body, end));
    }

    // Chunks are word-aligned, so an odd size is followed by a pad byte.
    offset = body + size + (size % 2);
  }

  if (!samples) throw new Error("That WAV file has no audio in it.");
  return { samples, sampleRate, channels, bitsPerSample };
}

export function writeWav(pcm: Pcm): Blob {
  const blockAlign = (pcm.channels * pcm.bitsPerSample) / 8;
  const header = new ArrayBuffer(HEADER_BYTES);
  const view = new DataView(header);
  const write = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) view.setUint8(offset + index, text.charCodeAt(index));
  };

  write(0, "RIFF");
  view.setUint32(4, 36 + pcm.samples.length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, pcm.channels, true);
  view.setUint32(24, pcm.sampleRate, true);
  view.setUint32(28, pcm.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, pcm.bitsPerSample, true);
  write(36, "data");
  view.setUint32(40, pcm.samples.length, true);

  return new Blob([header, pcm.samples as unknown as BlobPart], { type: "audio/wav" });
}

export async function stitchWav(blobs: Blob[], gapMs = 450): Promise<Blob> {
  if (blobs.length === 0) throw new Error("There is nothing to join.");

  const parts = await Promise.all(blobs.map(async (blob) => readWav(await blob.arrayBuffer())));
  const first = parts[0]!;

  // Silence has to match the format it sits between, or the gap plays as noise.
  const gapBytes = Math.round((first.sampleRate * gapMs) / 1000) * ((first.channels * first.bitsPerSample) / 8);
  const gap = new Uint8Array(gapBytes);

  const total = parts.reduce((sum, part) => sum + part.samples.length, 0) + gap.length * (parts.length - 1);
  const samples = new Uint8Array(total);

  let cursor = 0;
  parts.forEach((part, index) => {
    if (index > 0) {
      samples.set(gap, cursor);
      cursor += gap.length;
    }
    samples.set(part.samples, cursor);
    cursor += part.samples.length;
  });

  return writeWav({ ...first, samples });
}
