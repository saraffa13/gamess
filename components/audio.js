'use client';

// ---------- Web Audio (tones / pops) ----------
let audioCtx = null;
export const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

export const playTone = (freq, duration = 0.4, type = 'sine') => {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const playPop = () => {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

// TTS removed — speak() only plays parent recordings. Stub retained for callers.
export const loadVoices = () => {};

// ---------- Server clip index ----------
// Maps text key → playable URL (Vercel Blob URL or local API path).
const recordedUrls = {};
let indexLoaded = false;

export const loadRecordedIndex = async () => {
  try {
    const res = await fetch('/api/clips', { cache: 'no-store' });
    if (!res.ok) return;
    const rows = await res.json();
    Object.keys(recordedUrls).forEach(k => delete recordedUrls[k]);
    rows.forEach(r => { if (r.url) recordedUrls[r.key] = r.url; });
    indexLoaded = true;
  } catch (e) {}
};

export const hasRecording = (key) => !!recordedUrls[key];
export const recordedKeysSnapshot = () => Object.keys(recordedUrls);
export const isIndexLoaded = () => indexLoaded;

export const uploadClip = async (key, blob) => {
  try {
    const res = await fetch(`/api/clips/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': blob.type || 'audio/webm' },
      body: blob,
    });
    if (!res.ok) return false;
    try {
      const data = await res.json();
      if (data && data.url) recordedUrls[key] = data.url;
    } catch (e) {}
    return true;
  } catch (e) { return false; }
};

export const deleteClip = async (key) => {
  try {
    const res = await fetch(`/api/clips/${encodeURIComponent(key)}`, { method: 'DELETE' });
    if (res.ok) delete recordedUrls[key];
    return res.ok;
  } catch (e) { return false; }
};

// ---------- speak ----------
// Plays only parent-recorded clips. No TTS fallback — stays silent if unrecorded.
let currentAudio = null;

export const speak = (text) => {
  if (!text) return;
  try { if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; } } catch (e) {}
  const url = recordedUrls[text];
  if (!url) return;
  const a = new Audio(url);
  currentAudio = a;
  a.play().catch(() => {});
};

export const cancelSpeak = () => {
  try { if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; } } catch (e) {}
};
