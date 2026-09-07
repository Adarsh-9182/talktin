import { NextResponse } from "next/server";
import { BadRequest, explain, speak } from "@/lib/audio";
import { DEFAULT_VOICE, findVoice } from "@/lib/voices";
import { pcmToWav, silence } from "@/lib/wav";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BLOCKS = 20;
const MAX_TOTAL_CHARACTERS = 10_000;
const GAP_MS = 450;

interface Block {
  text: string;
  voice: string;
  style?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { blocks?: unknown } | null;
    if (!body) throw new BadRequest("Expected a JSON body.");

    const raw = Array.isArray(body.blocks) ? body.blocks : [];
    const blocks: Block[] = raw
      .map((entry) => {
        const record = (entry ?? {}) as Record<string, unknown>;
        return {
          text: typeof record.text === "string" ? record.text.trim() : "",
          voice: findVoice(typeof record.voice === "string" ? record.voice : "")?.id ?? DEFAULT_VOICE,
          style: typeof record.style === "string" ? record.style.trim().slice(0, 200) : "",
        };
      })
      .filter((block) => block.text.length > 0);

    if (blocks.length === 0) throw new BadRequest("Add at least one block with some text in it.");
    if (blocks.length > MAX_BLOCKS) throw new BadRequest(`That's ${blocks.length} blocks. The limit is ${MAX_BLOCKS}.`);

    const total = blocks.reduce((sum, block) => sum + block.text.length, 0);
    if (total > MAX_TOTAL_CHARACTERS) {
      throw new BadRequest(`That's ${total} characters across all blocks. The limit is ${MAX_TOTAL_CHARACTERS}.`);
    }

    // Sequential on purpose: the free tier rate-limits parallel requests, and a
    // 429 halfway through a chapter is worse than waiting a few seconds.
    const parts: Buffer[] = [];
    for (const [index, block] of blocks.entries()) {
      if (index > 0) parts.push(silence(GAP_MS));
      parts.push(await speak(block.style ? `${block.style}: ${block.text}` : block.text, block.voice));
    }

    const wav = pcmToWav(Buffer.concat(parts));
    return new NextResponse(new Uint8Array(wav), {
      headers: {
        "content-type": "audio/wav",
        "content-length": String(wav.length),
        "x-block-count": String(blocks.length),
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const { message, status } = explain(error);
    return NextResponse.json({ error: message }, { status });
  }
}
