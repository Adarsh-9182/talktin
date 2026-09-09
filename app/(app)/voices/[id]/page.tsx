import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader, Panel } from "@/components/Page";
import { VoicePreview } from "@/components/VoicePreview";
import { VOICES, type Voice } from "@/lib/voices";

/** Every voice gets a page at build time; the catalogue is fixed and small. */
export function generateStaticParams() {
  return VOICES.map((voice) => ({ id: voice.id.toLowerCase() }));
}

function find(id: string): Voice | undefined {
  return VOICES.find((voice) => voice.id.toLowerCase() === id.toLowerCase());
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const voice = find((await params).id);
  if (!voice) return { title: "Voice not found" };

  // "in 90+ languages" stood here against an engine that speaks two, and it
  // was the description search engines were being handed for all 28 pages.
  const description = `Hear ${voice.name}, a ${voice.character.toLowerCase()} AI voice, reading narration, an advert, and dialogue. Generated in your browser — free, and nothing is uploaded.`;
  return {
    title: `${voice.name} — ${voice.character} AI voice`,
    description,
    openGraph: { title: `${voice.name} — ${voice.character} AI voice`, description },
    alternates: { canonical: `/voices/${voice.id.toLowerCase()}` },
  };
}

const LINES = [
  {
    label: "Narration",
    text: "In the ancient land of Eldoria, where the skies shimmered and the forests whispered their secrets to the wind, there lived a dragon who had never once frightened anybody.",
  },
  {
    label: "Advert",
    text: "Switching is the easy part. Bring your team over in an afternoon, keep every file where it was, and pay nothing until you are sure.",
  },
  {
    label: "Conversation",
    text: "That order was delivered last Tuesday, so it still qualifies for a refund. I can start that for you now if you like.",
  },
];

export default async function VoicePage({ params }: { params: Promise<{ id: string }> }) {
  const voice = find((await params).id);
  if (!voice) notFound();

  const others = VOICES.filter((candidate) => candidate.character === voice.character && candidate.id !== voice.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title={voice.name}
        subtitle={`A ${voice.character.toLowerCase()} voice. Hear it on three kinds of writing before you commit to it.`}
      />

      <div className="mt-8">
        <VoicePreview voice={voice.id} lines={LINES} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/home?voice=${voice.id}`}
          className="rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white"
        >
          Write something in this voice
        </Link>
        <Link
          href="/voices"
          className="rounded-full border border-line px-5 py-2 text-[13px] transition-colors hover:border-ink/30"
        >
          All {VOICES.length} voices
        </Link>
      </div>

      {others.length > 0 && (
        <Panel className="mt-10 p-5">
          <h2 className="text-[13px] font-medium text-muted">
            Also {voice.character.toLowerCase()}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/voices/${other.id.toLowerCase()}`}
                  className="block rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
                >
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
