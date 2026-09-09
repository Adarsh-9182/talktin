import Link from "next/link";
import { PageHeader } from "@/components/Page";
import { TEMPLATES } from "@/lib/templates";
import { findVoice } from "@/lib/voices";

export default function Templates() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-24 pt-10">
      <PageHeader
        title="Templates"
        subtitle="Each one fills the composer with text, a voice, and the pace that suits it. Change anything before you generate."
      />

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((template) => {
          const voice = findVoice(template.voice);
          return (
            <li key={template.id}>
              <Link
                href={`/home?template=${template.id}`}
                className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ink/25"
              >
                <p className="text-[15px] font-medium">{template.name}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{template.blurb}</p>
                <p className="mt-4 line-clamp-2 text-[12.5px] leading-relaxed text-muted/80">“{template.text}”</p>
                <p className="mt-4 text-[11.5px] text-muted">
                  {voice?.name} · {voice?.character.toLowerCase()}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
