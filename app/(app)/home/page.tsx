import Link from "next/link";
import { Composer } from "@/components/Composer";
import { MobileNav } from "@/components/Shell";
import { TEMPLATES } from "@/lib/templates";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; voice?: string }>;
}) {
  const { template, voice } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-8">
      <MobileNav />

      <Composer template={template} voice={voice} />

      <Link
        href="/dubbing"
        className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-canvas px-5 py-4 transition-colors hover:border-ink/25"
      >
        <span className="text-[14px] font-medium">Try Dubbing</span>
        <span className="text-[13px] text-muted">One clip, another language, same timing.</span>
        <span className="ml-auto flex flex-wrap gap-1.5">
          {["हिन्दी", "Español", "日本語", "Português"].map((label) => (
            <span key={label} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11.5px] text-muted">
              {label}
            </span>
          ))}
        </span>
      </Link>

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[15px] font-medium">Templates</h2>
          <Link href="/templates" className="text-[12.5px] text-muted transition-colors hover:text-ink">
            View all
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.slice(0, 4).map((item) => (
            <li key={item.id}>
              <Link
                href={`/home?template=${item.id}`}
                className="block rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ink/25"
              >
                <p className="text-[14px] font-medium">{item.name}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{item.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
