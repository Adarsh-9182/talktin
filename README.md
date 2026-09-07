# Talktin

An AI voice studio: text to speech, dubbing, transcription, and agents that talk.

Speech runs on Google's Gemini models, so the whole thing works on a free API
tier — what's built here is the product around them.

## What's in it

| Route | What it does |
| --- | --- |
| `/` | Landing page. The hero demo calls the real endpoint, not a recording. |
| `/text-to-speech` | Write a line, direct how it's read, hear it back. |
| `/voices` | 30 voices with previews, cached per session. |
| `/dubbing` | Clip in, another language out — transcribed, translated, spoken. |
| `/speech-to-text` | Upload or record; speakers come back separated. |
| `/agents` | A support agent with tools, and every tool call shown under the reply. |

## API

Every screen is built on routes you can call directly.

| Endpoint | Takes | Returns |
| --- | --- | --- |
| `POST /api/speech` | `{ text, voice?, style? }` | `audio/wav` |
| `POST /api/transcribe` | multipart `file` | `{ text, words }` |
| `POST /api/dub` | multipart `file`, `language`, `voice?` | `{ transcript, translation, audio }` |
| `POST /api/agent` | `{ messages, system? }` | `{ reply, tools }` |

## Running it

```bash
pnpm install
echo 'GEMINI_API_KEY=your_key' > .env.local   # free key: aistudio.google.com/apikey
pnpm dev
pnpm test
```

## Layout

| Path | What it is |
| --- | --- |
| `app/(marketing)` | The landing page and its chrome. |
| `app/(app)` | The product, behind the sidebar. |
| `lib/audio.ts` | Upload validation, transcription, translation, speech. |
| `lib/agent.ts` | The agent loop and its tools. |
| `lib/wav.ts` | Wraps the model's raw PCM in a WAV header. |
