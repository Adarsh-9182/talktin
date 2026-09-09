"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { speak } from "@/lib/kokoro";
import { decodeShared, type SharedLine } from "@/lib/share";
import { findVoice } from "@/lib/voices";

/**
 * The fragment, as a subscribable value.
 *
 * It cannot be read during server rendering — the browser never sends it — so
 * the server snapshot is null, and null is what the screen treats as "not
 * read yet". Reading it in an effect and calling setState would work, but it
 * puts a render of the empty state on screen first; this way there is nothing
 * to flash.
 */
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function HearScreen() {
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => null,
  );

  // Remounting on a hash change is what resets "already heard this" — the
  // alternative is an effect whose only job is to undo state.
  return hash === null ? <div className="min-h-[60vh]" /> : <Player key={hash} line={decodeShared(hash)} />;
}

/**
 * What a stranger sees when someone sends them a link.
 *
 * They did not come here to evaluate a product, so this page does not sell
 * one. It has a sentence and a play button, and the fastest possible path to
 * hearing it. The pitch is a single line underneath, and it is only made
 * after the audio has played — a claim about privacy lands better once you
 * have just watched the thing work without asking you for anything.
 */
function Player({ line }: { line: SharedLine | null }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [load, setLoad] = useState<number | null>(null);
  const [heard, setHeard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  async function play() {
    if (!line) return;

    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const blob = await speak(line.text, {
        voice: line.voice,
        speed: line.speed,
        onProgress: (progress) => setLoad(progress.percent),
      });
      setLoad(null);

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);

      const audio = (audioRef.current ??= new Audio());
      audio.src = urlRef.current;
      audio.onended = () => {
        setState("idle");
        setHeard(true);
      };
      await audio.play();
      setState("playing");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setLoad(null);
      setState("idle");
    }
  }

  if (line === null) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-24 text-center">
        <h1 className="text-[32px] font-semibold tracking-[-0.03em]">This link has nothing to say</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          A Talktin link carries its sentence after the <code className="font-mono">#</code>, which some
          apps trim when they rewrite a URL. Ask for the link again, or write your own.
        </p>
        <Link
          href="/text-to-speech"
          className="mt-8 inline-block rounded-full bg-ink px-6 py-2.5 text-[14px] font-medium text-white"
        >
          Write your own
        </Link>
      </div>
    );
  }

  const voice = findVoice(line.voice);

  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-20 sm:pt-28">
      <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Someone sent you this</p>

      <p className="mt-5 text-[26px] font-medium leading-[1.35] tracking-[-0.02em] sm:text-[32px]">
        {line.text}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={play}
          disabled={state === "loading"}
          className="rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-white transition-opacity disabled:opacity-40"
        >
          {state !== "loading"
            ? state === "playing"
              ? "❙❙ Pause"
              : "▶ Play"
            : load !== null
              ? `Loading voice… ${load}%`
              : "Generating…"}
        </button>

        <p className="text-[13px] text-muted">
          {voice?.name} · {voice?.character.toLowerCase()} · {line.speed.toFixed(2)}× speed
        </p>
      </div>

      {load !== null && (
        <p aria-live="polite" className="mt-4 text-[13px] leading-relaxed text-muted">
          The voice model is downloading to your browser, once. After this it is cached, and every
          sentence you write is instant.
        </p>
      )}

      {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

      {/*
        The claim is made after the demonstration, not before it. Someone who
        has just heard a sentence play with no signup is in a position to
        believe the next paragraph; someone who has not, is being pitched.
      */}
      {heard && (
        <div className="mt-10 rounded-2xl border border-line bg-canvas p-6">
          <h2 className="text-[16px] font-medium leading-snug">
            That was generated on your machine, not ours
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            No account, no key, nothing uploaded. The sentence above travelled inside the part of the
            link after the <code className="font-mono">#</code>, which browsers never send to a server —
            so even the person who shared it did not put your reading of it through anyone&apos;s logs.
          </p>
          <Link
            href="/text-to-speech"
            className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-[13.5px] font-medium text-white"
          >
            Write your own
          </Link>
        </div>
      )}

      {!heard && (
        <p className="mt-10 text-[13px] leading-relaxed text-muted">
          No account needed. Press play — the voice runs in your browser.
        </p>
      )}
    </div>
  );
}
