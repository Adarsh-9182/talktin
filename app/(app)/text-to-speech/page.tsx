import { redirect } from "next/navigation";

/** The composer lives on Home; this path is kept because it is linked publicly. */
export default function TextToSpeech() {
  redirect("/home");
}
