import { GoogleGenAI } from "@google/genai";
import { client } from "./audio";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolRun {
  name: string;
  args: Record<string, unknown>;
  result: string;
}

/**
 * A tool the agent can call. Parameters use the OpenAPI subset the model
 * accepts, and `run` is ordinary code — this is the whole extension point.
 */
interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  run(args: Record<string, unknown>): string;
}

/** Stand-in for a real order system, so the demo agent has something true to say. */
const ORDERS: Record<string, { status: string; item: string; placed: string; total: string }> = {
  TK4543490: { status: "delivered", item: "Studio headphones", placed: "2026-08-21", total: "₹8,499" },
  TK4551002: { status: "in transit", item: "USB microphone", placed: "2026-09-02", total: "₹4,200" },
  TK4498771: { status: "cancelled", item: "Audio interface", placed: "2026-07-14", total: "₹12,000" },
};

const TOOLS: AgentTool[] = [
  {
    name: "lookup_order",
    description: "Looks up an order by its ID to see what it was and where it is.",
    parameters: {
      type: "object",
      properties: { order_id: { type: "string", description: "Order ID, e.g. TK4543490" } },
      required: ["order_id"],
    },
    run(args) {
      const id = String(args.order_id ?? "").trim().toUpperCase();
      const order = ORDERS[id];
      if (!order) return `No order found with ID ${id}. Ask the customer to check the ID.`;
      return `${id}: ${order.item}, ${order.total}, placed ${order.placed}, currently ${order.status}.`;
    },
  },
  {
    name: "refund_policy",
    description: "Returns the refund policy. Use it before promising anything about refunds.",
    parameters: { type: "object", properties: {} },
    run() {
      return (
        "Refunds are available within 30 days of delivery. Orders still in transit must be " +
        "cancelled instead. Cancelled orders were never charged. Refunds reach the original " +
        "payment method in 5-7 working days."
      );
    },
  },
  {
    name: "start_refund",
    description: "Starts a refund for a delivered order. Only call this once the customer has agreed.",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "string" },
        reason: { type: "string", description: "What the customer said was wrong" },
      },
      required: ["order_id", "reason"],
    },
    run(args) {
      const id = String(args.order_id ?? "").trim().toUpperCase();
      const order = ORDERS[id];
      if (!order) return `Cannot refund ${id} — no such order.`;
      if (order.status !== "delivered") return `Cannot refund ${id} — it is ${order.status}, not delivered.`;
      return `Refund started for ${id} (${order.total}). Reference RF-${id.slice(-4)}. Expect it in 5-7 working days.`;
    },
  },
  {
    name: "escalate",
    description: "Hands the conversation to a human. Use it when the tools cannot settle the question.",
    parameters: {
      type: "object",
      properties: { reason: { type: "string" } },
      required: ["reason"],
    },
    run(args) {
      return `Escalated to a human agent. Reason recorded: ${String(args.reason ?? "unspecified")}.`;
    },
  },
];

export const TOOL_NAMES = TOOLS.map((tool) => tool.name);

const MAX_TURNS = 6;

/**
 * Runs the agent to a spoken answer: ask the model, run whatever tools it asks
 * for, feed the results back, repeat until it replies in plain words.
 */
export async function runAgent(
  system: string,
  history: ChatMessage[],
): Promise<{ reply: string; tools: ToolRun[] }> {
  const ai: GoogleGenAI = client();
  const contents = history.map((message) => ({
    role: message.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: message.content }],
  }));

  const tools = [
    {
      functionDeclarations: TOOLS.map(({ name, description, parameters }) => ({
        name,
        description,
        parameters,
      })),
    },
  ];

  const used: ToolRun[] = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { systemInstruction: system, tools },
    });

    const calls = response.functionCalls ?? [];
    if (calls.length === 0) {
      const reply = response.text?.trim();
      if (!reply) throw new Error("The agent produced no reply.");
      return { reply, tools: used };
    }

    for (const call of calls) {
      const tool = TOOLS.find((candidate) => candidate.name === call.name);
      const args = (call.args ?? {}) as Record<string, unknown>;
      // An unknown tool is reported back rather than thrown, so the model can
      // pick a real one instead of the conversation dying.
      const result = tool
        ? safely(() => tool.run(args))
        : `Error: no tool named "${call.name}". Available: ${TOOL_NAMES.join(", ")}.`;

      used.push({ name: call.name ?? "unknown", args, result });
      contents.push({ role: "model" as const, parts: [{ functionCall: call }] as never });
      contents.push({
        role: "user" as const,
        parts: [{ functionResponse: { name: call.name ?? "unknown", response: { output: result } } }] as never,
      });
    }
  }

  return {
    reply: "I am going in circles on this one — let me pass you to a human.",
    tools: used,
  };
}

function safely(run: () => string): string {
  try {
    return run();
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export const DEFAULT_SYSTEM = `You are the support voice agent for Talktin Audio, an online store.

You are speaking out loud, so keep replies to one or two short sentences and never
use lists, markdown, or symbols that cannot be pronounced.

Use your tools rather than guessing: look an order up before discussing it, and
check the refund policy before promising a refund. Ask for the order ID if you do
not have one. If the tools cannot settle the question, escalate instead of
inventing an answer.`;
