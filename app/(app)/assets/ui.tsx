"use client";

import { useEffect, useState } from "react";
import { ErrorNote, PageHeader } from "@/components/Page";
import { ago, clearAssets, deleteAsset, listAssets, type Asset } from "@/lib/assets";

interface Row extends Asset {
  url: string;
}

const KIND_LABEL: Record<Asset["kind"], string> = {
  speech: "Speech",
  dub: "Dub",
  studio: "Studio",
};

export function AssetsScreen() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let urls: string[] = [];
    listAssets()
      .then((assets) => {
        const next = assets.map((asset) => ({ ...asset, url: URL.createObjectURL(asset.blob) }));
        urls = next.map((row) => row.url);
        setRows(next);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : String(caught));
        setRows([]);
      });

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function remove(id: string) {
    await deleteAsset(id);
    setRows((previous) => {
      const gone = previous?.find((row) => row.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return previous?.filter((row) => row.id !== id) ?? null;
    });
  }

  async function removeAll() {
    await clearAssets();
    rows?.forEach((row) => URL.revokeObjectURL(row.url));
    setRows([]);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
      <PageHeader
        title="Assets"
        subtitle="Everything you have generated, kept in this browser. Nothing is uploaded anywhere."
      />

      {error && <ErrorNote message={error} />}

      {rows === null && <p className="mt-8 text-[13.5px] text-muted">Loading…</p>}

      {rows?.length === 0 && (
        <p className="mt-8 text-[13.5px] text-muted">
          Nothing here yet. Anything you generate on Home or in Studio shows up on this page.
        </p>
      )}

      {rows && rows.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[13px] text-muted">
              {rows.length} {rows.length === 1 ? "recording" : "recordings"}
            </p>
            <button
              onClick={removeAll}
              className="text-[12.5px] text-muted underline underline-offset-2 transition-colors hover:text-ink"
            >
              Delete all
            </button>
          </div>

          <ul className="mt-4 space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <p className="line-clamp-2 text-[13.5px] leading-relaxed">{row.title}</p>
                  <span className="shrink-0 text-[11.5px] text-muted">
                    {KIND_LABEL[row.kind]} · {row.voice} · {ago(row.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <audio controls src={row.url} className="h-9 w-full" />
                  <a
                    href={row.url}
                    download={`talktin-${row.id.slice(0, 8)}.wav`}
                    className="shrink-0 text-[12px] text-muted transition-colors hover:text-ink"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => void remove(row.id)}
                    aria-label="Delete recording"
                    className="shrink-0 text-[12px] text-muted transition-colors hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
