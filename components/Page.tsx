import { MobileNav } from "./Shell";

/** Shared page frame: title, subtitle, and the narrow-screen nav. */
export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <MobileNav />
      <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em]">{title}</h1>
      <p className="mt-2.5 max-w-lg text-[14.5px] leading-relaxed text-muted">{subtitle}</p>
    </>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
      {message}
    </p>
  );
}
