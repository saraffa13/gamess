# Akshita's Games 🌸

A Next.js app of simple Hindi + English games for a 2-year-old. Parents record their own voice for each word; clips are stored in Vercel Blob (or SQLite locally) and replace TTS in the games.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000.

By default, local dev uses **SQLite** (`data/voices.db`). Recordings persist on disk. No env vars required.

## Production / Vercel

Set the env var `BLOB_READ_WRITE_TOKEN` and the app automatically switches to **Vercel Blob** for storage. SQLite is not used in production (and wouldn't work on serverless filesystems anyway).

1. Push the repo to GitHub
2. Import it on Vercel (https://vercel.com/new)
3. In Project Settings → Storage → connect a **Blob** store
4. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`
5. Redeploy

The storage abstraction lives in [lib/storage.js](lib/storage.js); the routing checks `process.env.BLOB_READ_WRITE_TOKEN` at runtime.

## Recording your voice

1. Open the app, tap **🎤 Record your voice (Parent mode)** at the bottom of the home screen.
2. Grant microphone permission.
3. For each word/letter, tap 🎤 → speak → ⏹ to stop. The green dot lights up once a clip is saved.
4. Clips are uploaded immediately. The games then play your voice instead of being silent.

> **Important:** Mic recording requires HTTPS or `localhost`. If hosted on plain HTTP, the browser silently blocks `navigator.mediaDevices`. The Parent mode page detects this and shows a warning.

## Speech behaviour

There is **no TTS fallback** — by design. The app plays the parent recording for a word if one exists, or stays silent. This avoids low-quality robotic voices for a child.

## Games

- 🐶 Animals · 🍎 Fruits · 🚗 Vehicles · 👁️ Body parts — tap-to-hear grids
- 🎈 Balloons — pop balloons with bursts and cheers
- 🎨 Colors — match the spoken color
- 🔢 Numbers — tap to count 1–10
- 🎵 Music — tap colored notes (free play)
- 🔤 Alphabet — A–Z in English, full varnamala in Hindi (वर्णमाला)

## Background music

A looping `background.mp3` (in [public/](public)) plays at low volume during games. On the home screen there's a 🎵/🔇 toggle and a volume slider. The selected language, music on/off, and volume are persisted to `localStorage`.

## Tech

- Next.js 14 (app router) + React 18
- `@vercel/blob` for hosted clip storage, `better-sqlite3` for local dev
- API routes: `GET /api/clips`, `GET|PUT|DELETE /api/clips/[key]`
- `MediaRecorder` (Opus/WebM) for parent recordings; Web Audio for tones/pops

## Files

- [app/](app) — Next.js entries + API routes
- [components/Games.js](components/Games.js) — all game components, Parent mode, language + music toggles
- [components/audio.js](components/audio.js) — clip index + `speak()` (recording-only)
- [components/bgMusic.js](components/bgMusic.js) — background MP3 controller (play/pause/volume)
- [components/data.js](components/data.js) — items, strings, alphabets
- [lib/storage.js](lib/storage.js) — Blob/SQLite dispatch
- [lib/db.js](lib/db.js) — SQLite init (local only)
