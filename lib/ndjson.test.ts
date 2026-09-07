import assert from "node:assert/strict";
import test from "node:test";
import { readNdjson } from "./ndjson.ts";

/** Builds a Response whose body arrives in exactly these chunks. */
function streamed(chunks: string[]): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
  );
}

async function collect<T>(response: Response): Promise<T[]> {
  const out: T[] = [];
  for await (const event of readNdjson<T>(response)) out.push(event);
  return out;
}

test("reads one object per line", async () => {
  const events = await collect<{ stage: string }>(
    streamed(['{"stage":"transcribing"}\n{"stage":"translating"}\n']),
  );
  assert.deepEqual(events.map((event) => event.stage), ["transcribing", "translating"]);
});

test("reassembles an object split across chunks", async () => {
  // The case that breaks a naive reader: a chunk ends mid-object.
  const events = await collect<{ stage: string; n: number }>(
    streamed(['{"stage":"a","n"', ":1}\n{", '"stage":"b","n":2}\n']),
  );
  assert.deepEqual(events, [
    { stage: "a", n: 1 },
    { stage: "b", n: 2 },
  ]);
});

test("yields a final object that arrived without a trailing newline", async () => {
  const events = await collect<{ stage: string }>(streamed(['{"stage":"done"}']));
  assert.deepEqual(events, [{ stage: "done" }]);
});

test("ignores blank lines rather than throwing on them", async () => {
  const events = await collect<{ ok: boolean }>(streamed(['\n{"ok":true}\n\n']));
  assert.deepEqual(events, [{ ok: true }]);
});

test("a response with no body is an error, not an empty stream", async () => {
  await assert.rejects(() => collect(new Response(null, { status: 204 })), /no response body/);
});
