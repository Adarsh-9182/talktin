/** The languages the speech model handles well enough to dub into. */
export const LANGUAGES = [
  { code: "hi-IN", label: "Hindi" },
  { code: "en-US", label: "English (US)" },
  { code: "en-IN", label: "English (India)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "ar-EG", label: "Arabic" },
  { code: "ru-RU", label: "Russian" },
  { code: "id-ID", label: "Indonesian" },
  { code: "it-IT", label: "Italian" },
  { code: "nl-NL", label: "Dutch" },
  { code: "tr-TR", label: "Turkish" },
  { code: "vi-VN", label: "Vietnamese" },
  { code: "th-TH", label: "Thai" },
  { code: "bn-IN", label: "Bengali" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "pl-PL", label: "Polish" },
  { code: "uk-UA", label: "Ukrainian" },
] as const;

export const DEFAULT_LANGUAGE = "hi-IN";

export function languageLabel(code: string): string | undefined {
  return LANGUAGES.find((language) => language.code === code)?.label;
}
