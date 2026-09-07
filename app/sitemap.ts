import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { VOICES } from "@/lib/voices";

const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/home", priority: 0.9 },
  { path: "/voices", priority: 0.8 },
  { path: "/dubbing", priority: 0.8 },
  { path: "/speech-to-text", priority: 0.8 },
  { path: "/agents", priority: 0.8 },
  { path: "/studio", priority: 0.7 },
  { path: "/templates", priority: 0.6 },
  { path: "/docs", priority: 0.6 },
  { path: "/pricing", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...PAGES.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    // A page per voice, because "what does a warm Indian narration voice sound
    // like" is a real search and a list page cannot answer it.
    ...VOICES.map((voice) => ({
      url: `${SITE_URL}/voices/${voice.id.toLowerCase()}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
