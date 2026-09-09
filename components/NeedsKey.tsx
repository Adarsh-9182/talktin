import Link from "next/link";
import { PageHeader, Panel } from "@/components/Page";
import { HOSTED_TOOLS, type HostedTool } from "@/lib/hosted";

/**
 * What a gated tool shows instead of an interface that would fail.
 *
 * The temptation is to render the real screen and disable the button. That is
 * still a lie with extra steps: the visitor reads a full workspace, decides
 * the product does this, and only finds out otherwise when they try. So the
 * controls are not rendered at all, and the page spends its space on the two
 * things that are actually useful — what the tool does, and how to turn it on.
 */
export function NeedsKey({ tool }: { tool: HostedTool }) {
  const { name, does } = HOSTED_TOOLS[tool];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader title={name} subtitle={does} />

      <Panel className="mt-8 p-6">
        <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Off on this deployment</p>
        <h2 className="mt-3 text-[18px] font-medium leading-snug">
          This one needs a server, and this copy does not have a key for it
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {name} sends your text or your file to a hosted model, so it cannot run the way speech does.
          There is no free key behind this deployment, and showing you the interface anyway would only
          waste the upload.
        </p>

        <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
          <p className="text-[13px] font-medium">To turn it on in your own copy</p>
          <pre className="mt-3 overflow-x-auto text-[12.5px] leading-relaxed text-muted">
            <code>{`git clone https://github.com/Adarsh-9182/talktin
echo "GEMINI_API_KEY=…" >> .env.local
pnpm install && pnpm dev`}</code>
          </pre>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
            A key from{" "}
            <a href="https://aistudio.google.com/apikey" className="underline underline-offset-2 hover:text-ink">
              Google AI Studio
            </a>{" "}
            has a free tier. It is your key, so the quota and the data are yours too.
          </p>
        </div>
      </Panel>

      <Panel className="mt-4 p-6">
        <h2 className="text-[15px] font-medium">Speech needs none of this</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Text to speech, the {""}
          <Link href="/voices" className="underline underline-offset-2">
            voice catalogue
          </Link>{" "}
          and long-form Studio all run in your browser, right now, with no key and no account. That half
          of the product is not gated and never will be.
        </p>
        <Link
          href="/text-to-speech"
          className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white"
        >
          Open the studio
        </Link>
      </Panel>
    </div>
  );
}
