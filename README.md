# Talktin

An AI voice studio: type text, pick a voice, direct how it should be performed,
and get speech back in 90+ languages.

Speech is generated with Google's Gemini TTS models, so the whole thing runs on
a free API tier — the product is the studio around it.

## Running it

```bash
pnpm install
echo 'GEMINI_API_KEY=your_key' > .env.local   # free key: aistudio.google.com/apikey
pnpm dev
```

## Layout

| Path | What it is |
| --- | --- |
| `app/page.tsx` | The studio: text, direction, voice, history. |
| `app/api/speech/route.ts` | Takes text and a voice, returns a WAV. |
| `lib/voices.ts` | The 30 prebuilt voices and their character. |
| `lib/wav.ts` | Wraps the model's raw PCM in a WAV header. |
