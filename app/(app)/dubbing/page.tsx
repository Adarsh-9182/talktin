import type { Metadata } from "next";
import { DubbingScreen } from "./ui";
import { NeedsKey } from "@/components/NeedsKey";
import { HOSTED_CONFIGURED } from "@/lib/hosted";

export const metadata: Metadata = {
  title: "Dubbing",
  description: "Turn a clip into another language — transcribed, translated to fit the timing, and spoken.",
};

export default function Page() {
  // Read on the server, so a deployment with no key never ships the interface
  // for a tool that cannot run on it.
  if (!HOSTED_CONFIGURED) return <NeedsKey tool="dubbing" />;
  return <DubbingScreen />;
}
