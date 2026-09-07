import type { Metadata } from "next";
import { AgentsScreen } from "./ui";

export const metadata: Metadata = {
  title: "Voice Agents",
  description: "An agent that talks, uses tools, and shows every tool it reached for.",
};

export default function Page() {
  return <AgentsScreen />;
}
