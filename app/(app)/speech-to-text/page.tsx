import type { Metadata } from "next";
import { SpeechToTextScreen } from "./ui";

export const metadata: Metadata = {
  title: "Speech to Text",
  description: "Upload a recording or record one here and get the words back, with speakers separated.",
};

export default function Page() {
  return <SpeechToTextScreen />;
}
