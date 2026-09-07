import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talktin — AI voice studio",
  description:
    "Turn text into natural speech in 90+ languages, dub video into any language, transcribe recordings, and deploy agents that talk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
