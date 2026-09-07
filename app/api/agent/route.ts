import { NextResponse } from "next/server";
import { guard } from "@/lib/limit";
import { BadRequest, explain } from "@/lib/audio";
import { DEFAULT_SYSTEM, runAgent, type ChatMessage } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_MESSAGES = 40;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { messages?: unknown; system?: unknown }
      | null;
    if (!body) throw new BadRequest("Expected a JSON body.");

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const history: ChatMessage[] = messages
      .filter(
        (message): message is ChatMessage =>
          !!message &&
          typeof message === "object" &&
          (message as ChatMessage).role !== undefined &&
          typeof (message as ChatMessage).content === "string",
      )
      .slice(-MAX_MESSAGES);

    if (history.length === 0) throw new BadRequest("Say something first.");
    if (history.at(-1)?.role !== "user") throw new BadRequest("The last message must be from the caller.");

    const system = typeof body.system === "string" && body.system.trim() ? body.system.trim() : DEFAULT_SYSTEM;
    // Counted here rather than at the top of the handler: a malformed
    // request costs nothing, so it should not spend the caller's budget.
    const limited = guard(request, "agent");
    if (limited) return limited;

    const { reply, tools } = await runAgent(system, history);
    return NextResponse.json({ reply, tools });
  } catch (error) {
    const { message, status } = explain(error);
    return NextResponse.json({ error: message }, { status });
  }
}
