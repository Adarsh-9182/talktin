/**
 * The voices the speech engine actually ships with.
 *
 * This list used to name Gemini's voices — Zephyr, Puck, Sulafat — against a
 * provider that was never once called, because no key existed. These are
 * Kokoro's, read off the model's own table rather than written by hand, and
 * every one of them will produce sound the first time someone presses play.
 *
 * `grade` is the model author's published quality score for the voice, and it
 * is on the record here because it is uncomfortable: of twenty-eight voices,
 * four are B- or better and the rest fall away to D. Hiding that would mean
 * a catalogue where every entry looks equally good and most of them
 * disappoint. Sorting by it, and saying so in the UI, is the honest version —
 * and it is why the default is Heart, the only A.
 */
export interface Voice {
  id: string;
  name: string;
  /** Accent and gender — what someone actually chooses by, before quality. */
  character: string;
  language: "en-us" | "en-gb";
  gender: "Female" | "Male";
  /** The model author's grade: A is broadcast-usable, D is not. */
  grade: string;
}

export const VOICES: Voice[] = [
  { id: "af_heart", name: "Heart", character: "American female", language: "en-us", gender: "Female", grade: "A" },
  { id: "af_alloy", name: "Alloy", character: "American female", language: "en-us", gender: "Female", grade: "C" },
  { id: "af_aoede", name: "Aoede", character: "American female", language: "en-us", gender: "Female", grade: "C+" },
  { id: "af_bella", name: "Bella", character: "American female", language: "en-us", gender: "Female", grade: "A-" },
  { id: "af_jessica", name: "Jessica", character: "American female", language: "en-us", gender: "Female", grade: "D" },
  { id: "af_kore", name: "Kore", character: "American female", language: "en-us", gender: "Female", grade: "C+" },
  { id: "af_nicole", name: "Nicole", character: "American female", language: "en-us", gender: "Female", grade: "B-" },
  { id: "af_nova", name: "Nova", character: "American female", language: "en-us", gender: "Female", grade: "C" },
  { id: "af_river", name: "River", character: "American female", language: "en-us", gender: "Female", grade: "D" },
  { id: "af_sarah", name: "Sarah", character: "American female", language: "en-us", gender: "Female", grade: "C+" },
  { id: "af_sky", name: "Sky", character: "American female", language: "en-us", gender: "Female", grade: "C-" },
  { id: "am_adam", name: "Adam", character: "American male", language: "en-us", gender: "Male", grade: "F+" },
  { id: "am_echo", name: "Echo", character: "American male", language: "en-us", gender: "Male", grade: "D" },
  { id: "am_eric", name: "Eric", character: "American male", language: "en-us", gender: "Male", grade: "D" },
  { id: "am_fenrir", name: "Fenrir", character: "American male", language: "en-us", gender: "Male", grade: "C+" },
  { id: "am_liam", name: "Liam", character: "American male", language: "en-us", gender: "Male", grade: "D" },
  { id: "am_michael", name: "Michael", character: "American male", language: "en-us", gender: "Male", grade: "C+" },
  { id: "am_onyx", name: "Onyx", character: "American male", language: "en-us", gender: "Male", grade: "D" },
  { id: "am_puck", name: "Puck", character: "American male", language: "en-us", gender: "Male", grade: "C+" },
  { id: "am_santa", name: "Santa", character: "American male", language: "en-us", gender: "Male", grade: "D-" },
  { id: "bf_emma", name: "Emma", character: "British female", language: "en-gb", gender: "Female", grade: "B-" },
  { id: "bf_isabella", name: "Isabella", character: "British female", language: "en-gb", gender: "Female", grade: "C" },
  { id: "bm_george", name: "George", character: "British male", language: "en-gb", gender: "Male", grade: "C" },
  { id: "bm_lewis", name: "Lewis", character: "British male", language: "en-gb", gender: "Male", grade: "D+" },
  { id: "bf_alice", name: "Alice", character: "British female", language: "en-gb", gender: "Female", grade: "D" },
  { id: "bf_lily", name: "Lily", character: "British female", language: "en-gb", gender: "Female", grade: "D" },
  { id: "bm_daniel", name: "Daniel", character: "British male", language: "en-gb", gender: "Male", grade: "D" },
  { id: "bm_fable", name: "Fable", character: "British male", language: "en-gb", gender: "Male", grade: "C" },];

/** Heart is the only A-graded voice in the set, so it is what people hear first. */
export const DEFAULT_VOICE = "af_heart";

export function findVoice(id: string): Voice | undefined {
  return VOICES.find((voice) => voice.id === id);
}

/**
 * Best first. The catalogue is browsed top-down and the good voices are a
 * minority, so surfacing them in list order does more for a first impression
 * than any amount of copy about the model.
 */
const RANK = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F+", "F"];

export function byQuality(a: Voice, b: Voice): number {
  const rank = RANK.indexOf(a.grade) - RANK.indexOf(b.grade);
  return rank !== 0 ? rank : a.name.localeCompare(b.name);
}
