# Akshita's Games 🌸

A Next.js app of simple Hindi-language games for a 2-year-old. Parents can record their own voice for each word; clips are stored in SQLite and replace TTS automatically.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Recording your voice

1. Open the app, tap **🎤 अपनी आवाज़ रिकॉर्ड करें (Parent mode)** at the bottom of the home screen.
2. Grant microphone permission.
3. For each word, tap 🎤 to start, speak, then ⏹ to stop. The green dot lights up when a clip is saved.
4. Recorded clips are stored as BLOBs in `data/voices.db` (SQLite) and replayed in the games instead of TTS.

## How audio playback works

Priority for each word the app speaks:
1. **Parent recording** (from SQLite) — if available
2. **Google Translate TTS** — `translate.google.com/translate_tts` (needs internet)
3. **Browser `speechSynthesis`** — last-resort fallback

## Tech

- Next.js 14 (app router) + React 18
- `better-sqlite3` for the clip store
- API routes: `GET /api/clips`, `GET|PUT|DELETE /api/clips/[key]`
- Web Audio for tones / pops, `MediaRecorder` (Opus/WebM) for parent recordings

## Notes

- The old standalone `index.html` is no longer used by the Next app; you can delete it.
- `data/voices.db` is git-ignored. Back it up if your recordings are precious.
- If `better-sqlite3` fails to install on Windows, you likely need Visual Studio Build Tools, or run `npm install --build-from-source`.
