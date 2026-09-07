/** Starting points for the composer — the reference product calls these Templates. */
export interface Template {
  id: string;
  name: string;
  blurb: string;
  voice: string;
  style: string;
  text: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "narrate",
    name: "Narrate a story",
    blurb: "Warm, unhurried delivery for fiction and audiobooks.",
    voice: "Sulafat",
    style: "Read this warmly and unhurried, like a bedtime story",
    text: "In the ancient land of Eldoria, where the skies shimmered and the forests whispered their secrets to the wind, there lived a dragon who had never once frightened anybody.",
  },
  {
    id: "ad",
    name: "Record an ad",
    blurb: "Bright and confident, for a thirty-second spot.",
    voice: "Laomedeia",
    style: "Read this with bright, confident energy, like a radio advert",
    text: "Switching is the easy part. Bring your team over in an afternoon, keep every file exactly where it was, and pay nothing until you are sure.",
  },
  {
    id: "explainer",
    name: "Explainer video",
    blurb: "Clear and even, for a voiceover that has to be followed.",
    voice: "Charon",
    style: "Read this clearly and evenly, like a documentary narrator",
    text: "Every request starts the same way. The text you write is sent to the model along with a voice, and what comes back is raw audio that your browser can play.",
  },
  {
    id: "meditation",
    name: "Guide a meditation",
    blurb: "Slow, gentle, with room to breathe.",
    voice: "Vindemiatrix",
    style: "Read this slowly and gently, leaving long pauses between sentences",
    text: "Let your shoulders drop. Notice the weight of your hands where they rest. There is nothing to solve in the next sixty seconds.",
  },
  {
    id: "announcement",
    name: "Make an announcement",
    blurb: "Firm and unmistakable, for anything people must actually hear.",
    voice: "Alnilam",
    style: "Read this firmly and clearly, like a public announcement",
    text: "The service will be unavailable on Sunday between two and four in the morning while we move the database. Nothing you have saved will be affected.",
  },
  {
    id: "joke",
    name: "Tell a joke",
    blurb: "Dry timing, for when the delivery is the whole thing.",
    voice: "Zubenelgenubi",
    style: "Read this dryly, like you are thoroughly unimpressed",
    text: "I told my computer I needed a break. Now it will not stop sending me holiday adverts.",
  },
  {
    id: "support",
    name: "Support reply",
    blurb: "Friendly and matter-of-fact, for automated call replies.",
    voice: "Achird",
    style: "Read this in a friendly, matter-of-fact way",
    text: "Good news — that order was delivered last Tuesday, so it still qualifies for a refund. I can start that for you now if you would like.",
  },
  {
    id: "news",
    name: "Read the news",
    blurb: "Informative and neutral, at a steady clip.",
    voice: "Rasalgethi",
    style: "Read this at a steady clip, neutral and informative",
    text: "Markets closed higher for a third straight session, led by shipping and cement. Analysts pointed to easing fuel costs rather than any change in demand.",
  },
];

export function findTemplate(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
