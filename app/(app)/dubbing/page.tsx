import type { Metadata } from "next";
import { DubbingScreen } from "./ui";

export const metadata: Metadata = {
  title: "Dubbing",
  description: "Turn a clip into another language — transcribed, translated to fit the timing, and spoken.",
};

export default function Page() {
  return <DubbingScreen />;
}
