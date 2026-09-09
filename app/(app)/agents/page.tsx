import type { Metadata } from "next";
import { AgentsScreen } from "./ui";
import { NeedsKey } from "@/components/NeedsKey";
import { HOSTED_CONFIGURED } from "@/lib/hosted";

export const metadata: Metadata = {
  title: "Voice Agents",
  description: "An agent that talks, uses tools, and shows every tool it reached for.",
};

export default function Page() {
  // Read on the server, so a deployment with no key never ships the interface
  // for a tool that cannot run on it.
  if (!HOSTED_CONFIGURED) return <NeedsKey tool="agents" />;
  return <AgentsScreen />;
}
