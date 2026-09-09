/**
 * THE OTHER CATALOGUE
 *
 * Dubbing does not use the on-device engine. It sends the translation to a
 * hosted model, and that model has its own prebuilt voices with their own
 * names — the ones this file lists.
 *
 * For two commits the two catalogues were confused for one. `lib/voices.ts`
 * was rewritten for Kokoro, dubbing kept importing it, and so the dub route
 * asked a hosted model for a voice called `af_heart`, which it has never
 * heard of. Nothing failed loudly, because the endpoint needs a key nobody
 * had, so the bug simply waited for the first person to add one.
 *
 * Two engines mean two catalogues. Keeping them in separate files is what
 * stops the next person from wiring the wrong one in.
 */
export interface HostedVoice {
  /** The name the hosted model expects, verbatim. */
  id: string;
  /** What it sounds like, in the provider's own words. */
  character: string;
}

export const HOSTED_VOICES: HostedVoice[] = [
  { id: "Zephyr", character: "Bright" },
  { id: "Puck", character: "Upbeat" },
  { id: "Charon", character: "Informative" },
  { id: "Kore", character: "Firm" },
  { id: "Fenrir", character: "Excitable" },
  { id: "Leda", character: "Youthful" },
  { id: "Orus", character: "Firm" },
  { id: "Aoede", character: "Breezy" },
  { id: "Callirrhoe", character: "Easy-going" },
  { id: "Autonoe", character: "Bright" },
  { id: "Enceladus", character: "Breathy" },
  { id: "Iapetus", character: "Clear" },
  { id: "Umbriel", character: "Easy-going" },
  { id: "Algieba", character: "Smooth" },
  { id: "Despina", character: "Smooth" },
  { id: "Erinome", character: "Clear" },
  { id: "Algenib", character: "Gravelly" },
  { id: "Rasalgethi", character: "Informative" },
  { id: "Laomedeia", character: "Upbeat" },
  { id: "Achernar", character: "Soft" },
  { id: "Alnilam", character: "Firm" },
  { id: "Schedar", character: "Even" },
  { id: "Gacrux", character: "Mature" },
  { id: "Pulcherrima", character: "Forward" },
  { id: "Achird", character: "Friendly" },
  { id: "Zubenelgenubi", character: "Casual" },
  { id: "Vindemiatrix", character: "Gentle" },
  { id: "Sadachbia", character: "Lively" },
  { id: "Sadaltager", character: "Knowledgeable" },
  { id: "Sulafat", character: "Warm" },
];

export const DEFAULT_HOSTED_VOICE = "Charon";

export function findHostedVoice(id: string): HostedVoice | undefined {
  return HOSTED_VOICES.find((voice) => voice.id === id);
}
