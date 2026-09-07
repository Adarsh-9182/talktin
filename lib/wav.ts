/**
 * The speech model returns headerless 16-bit PCM. Browsers won't play that, so
 * we prepend the 44-byte RIFF header that turns the same samples into a WAV.
 */
export function pcmToWav(pcm: Buffer, sampleRate = 24_000, channels = 1, bitsPerSample = 16): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4); // file size minus the first 8 bytes
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM format chunk is 16 bytes
  header.writeUInt16LE(1, 20); // 1 = uncompressed PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28); // byte rate
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

/** A run of silent samples, used to space long-form blocks apart. */
export function silence(milliseconds: number, sampleRate = 24_000, bytesPerSample = 2): Buffer {
  return Buffer.alloc(Math.round((sampleRate * milliseconds) / 1000) * bytesPerSample);
}
