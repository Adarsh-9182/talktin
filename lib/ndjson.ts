/**
 * Reads a newline-delimited JSON stream, yielding each object as it lands.
 * Split across chunk boundaries is the whole difficulty here: a chunk can end
 * mid-object, so the tail is held back until its newline arrives.
 */
export async function* readNdjson<T>(response: Response): AsyncGenerator<T> {
  const body = response.body;
  if (!body) throw new Error("The server sent no response body.");

  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += value;
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) yield JSON.parse(line) as T;
        newline = buffer.indexOf("\n");
      }
    }

    const rest = buffer.trim();
    if (rest) yield JSON.parse(rest) as T;
  } finally {
    reader.releaseLock();
  }
}
