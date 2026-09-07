import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swara — AI voice studio",
  description: "Turn text into natural speech in 90+ languages, and direct how it is performed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
