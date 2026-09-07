import type { Metadata } from "next";
import { AssetsScreen } from "./ui";

export const metadata: Metadata = {
  title: "Assets",
  description: "Everything you have generated, kept in your own browser.",
};

export default function Page() {
  return <AssetsScreen />;
}
