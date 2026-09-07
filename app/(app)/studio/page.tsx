import type { Metadata } from "next";
import { StudioScreen } from "./ui";

export const metadata: Metadata = {
  title: "Studio",
  description: "Long-form narration and dialogue: a block per paragraph or speaker, each with its own voice.",
};

export default function Page() {
  return <StudioScreen />;
}
