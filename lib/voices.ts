/**
 * The prebuilt voices the speech model ships with. The character is what people
 * actually pick by, so it is part of the catalogue rather than a tooltip.
 */
export interface Voice {
  id: string;
  name: string;
  character: string;
}

export const VOICES: Voice[] = [
  { id: "Zephyr", name: "Zephyr", character: "Bright" },
  { id: "Puck", name: "Puck", character: "Upbeat" },
  { id: "Charon", name: "Charon", character: "Informative" },
  { id: "Kore", name: "Kore", character: "Firm" },
  { id: "Fenrir", name: "Fenrir", character: "Excitable" },
  { id: "Leda", name: "Leda", character: "Youthful" },
  { id: "Orus", name: "Orus", character: "Firm" },
  { id: "Aoede", name: "Aoede", character: "Breezy" },
  { id: "Callirrhoe", name: "Callirrhoe", character: "Easy-going" },
  { id: "Autonoe", name: "Autonoe", character: "Bright" },
  { id: "Enceladus", name: "Enceladus", character: "Breathy" },
  { id: "Iapetus", name: "Iapetus", character: "Clear" },
  { id: "Umbriel", name: "Umbriel", character: "Easy-going" },
  { id: "Algieba", name: "Algieba", character: "Smooth" },
  { id: "Despina", name: "Despina", character: "Smooth" },
  { id: "Erinome", name: "Erinome", character: "Clear" },
  { id: "Algenib", name: "Algenib", character: "Gravelly" },
  { id: "Rasalgethi", name: "Rasalgethi", character: "Informative" },
  { id: "Laomedeia", name: "Laomedeia", character: "Upbeat" },
  { id: "Achernar", name: "Achernar", character: "Soft" },
  { id: "Alnilam", name: "Alnilam", character: "Firm" },
  { id: "Schedar", name: "Schedar", character: "Even" },
  { id: "Gacrux", name: "Gacrux", character: "Mature" },
  { id: "Pulcherrima", name: "Pulcherrima", character: "Forward" },
  { id: "Achird", name: "Achird", character: "Friendly" },
  { id: "Zubenelgenubi", name: "Zubenelgenubi", character: "Casual" },
  { id: "Vindemiatrix", name: "Vindemiatrix", character: "Gentle" },
  { id: "Sadachbia", name: "Sadachbia", character: "Lively" },
  { id: "Sadaltager", name: "Sadaltager", character: "Knowledgeable" },
  { id: "Sulafat", name: "Sulafat", character: "Warm" },
];

export const DEFAULT_VOICE = "Achird";

export function findVoice(id: string): Voice | undefined {
  return VOICES.find((voice) => voice.id === id);
}
