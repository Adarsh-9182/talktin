"use client";

import { useEffect, useRef, useState } from "react";

/** The slice of the Web Speech API this hook uses. It is not in lib.dom yet. */
interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => Recognition;

function constructor(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
}

/**
 * Speech input, done in the browser. Recognition is free here and costs a
 * request if we send the audio to a model, so for live conversation the browser
 * wins on both price and latency.
 */
export function useSpeechInput(onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  // Keep the callback fresh without restarting recognition on every render.
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    setSupported(constructor() !== undefined);
    return () => recognitionRef.current?.stop();
  }, []);

  function start() {
    const Recognizer = constructor();
    if (!Recognizer) {
      setError("This browser has no speech recognition. Chrome and Safari do.");
      return;
    }

    setError(null);
    setHeard("");

    const recognition = new Recognizer();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      let done = false;
      for (let index = 0; index < event.results.length; index++) {
        const result = event.results[index]!;
        text += result[0]?.transcript ?? "";
        if (result.isFinal) done = true;
      }
      setHeard(text);
      if (done && text.trim()) {
        recognition.stop();
        onFinalRef.current(text.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings."
          : `Speech recognition stopped: ${event.error}`,
      );
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setHeard("");
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return { supported, listening, heard, error, start, stop };
}
