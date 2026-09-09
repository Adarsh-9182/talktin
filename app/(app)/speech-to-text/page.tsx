import type { Metadata } from "next";
import { SpeechToTextScreen } from "./ui";
import { NeedsKey } from "@/components/NeedsKey";
import { HOSTED_CONFIGURED } from "@/lib/hosted";

export const metadata: Metadata = {
  title: "Speech to Text",
  description: "Upload a recording or record one here and get the words back, with speakers separated.",
};

export default function Page() {
  // Read on the server, so a deployment with no key never ships the interface
  // for a tool that cannot run on it.
  if (!HOSTED_CONFIGURED) return <NeedsKey tool="transcription" />;
  return <SpeechToTextScreen />;
}
