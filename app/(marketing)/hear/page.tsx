import type { Metadata } from "next";
import { HearScreen } from "./ui";

/*
 * The metadata cannot mention what the link actually says, because the server
 * rendering this page has never seen it — the sentence lives after the `#`.
 * That is the trade the feature makes on purpose: no preview card, in
 * exchange for a shared sentence that no server ever receives.
 */
export const metadata: Metadata = {
  title: "Someone sent you a voice",
  description:
    "Press play. The voice is generated in your own browser — no account, no key, and nothing uploaded.",
  // Nothing here is worth indexing: every one of these URLs is the same page,
  // and the part that differs is invisible to a crawler anyway.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <HearScreen />;
}
