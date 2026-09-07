import type { Metadata } from "next";
import { VoicesScreen } from "./ui";

export const metadata: Metadata = {
  title: "Voices",
  description: "Audition all 30 prebuilt voices before you write a word — each with its own character.",
};

export default function Page() {
  return <VoicesScreen />;
}
