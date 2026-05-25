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

// ---------- Browser voices (fallback) ----------
const localVoices = { hi: null, en: null };
const pickVoice = (voices, langPrefix) =>
  voices.find(v => new RegExp('^' + langPrefix, 'i').test(v.lang)
                   && /female|heera|kalpana|swara|lekha|asha|priya|zira|samantha|aria/i.test(v.name)) ||
  voices.find(v => new RegExp('^' + langPrefix, 'i').test(v.lang)) ||
  null;
export const loadVoices = () => {
  if (typeof window === 'undefined' || typeof speechSynthesis === 'undefined') return;
  const voices = window.speechSynthesis.getVoices();
  localVoices.hi = pickVoice(voices, 'hi');
  localVoices.en = pickVoice(voices, 'en');
};
if (typeof window !== 'undefined' && typeof speechSynthesis !== 'undefined') {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// ---------- Server clip index ----------
const recordedKeys = new Set();
const recordedUrls = {};
let indexLoaded = false;

export const loadRecordedIndex = async () => {
  try {
    const res = await fetch('/api/clips', { cache: 'no-store' });
    if (!res.ok) return;
    const rows = await res.json();
    recordedKeys.clear();
    rows.forEach(r => recordedKeys.add(r.key));
    indexLoaded = true;
  } catch (e) {}
};

export const hasRecording = (key) => recordedKeys.has(key);
export const recordedKeysSnapshot = () => Array.from(recordedKeys);
export const isIndexLoaded = () => indexLoaded;

const fetchClipUrl = async (key) => {
  if (recordedUrls[key]) return recordedUrls[key];
  try {
    const res = await fetch(`/api/clips/${encodeURIComponent(key)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    recordedUrls[key] = url;
    return url;
  } catch (e) { return null; }
};

export const uploadClip = async (key, blob) => {
  const res = await fetch(`/api/clips/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': blob.type || 'audio/webm' },
    body: blob,
  });
  if (res.ok) {
    recordedKeys.add(key);
    if (recordedUrls[key]) { URL.revokeObjectURL(recordedUrls[key]); delete recordedUrls[key]; }
  }
  return res.ok;
};

export const deleteClip = async (key) => {
  const res = await fetch(`/api/clips/${encodeURIComponent(key)}`, { method: 'DELETE' });
  if (res.ok) {
    recordedKeys.delete(key);
    if (recordedUrls[key]) { URL.revokeObjectURL(recordedUrls[key]); delete recordedUrls[key]; }
  }
  return res.ok;
};

// ---------- speak ----------
let currentAudio = null;
const ttsCache = {};

const browserSpeak = (text, lang = 'hi') => {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    const v = localVoices[lang];
    if (v) u.voice = v;
    u.rate = 0.85; u.pitch = lang === 'hi' ? 1.5 : 1.3; u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch (e) {}
};
const ttsUrl = (text, lang) =>
  `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

const playTTS = (text, lang = 'hi') => {
  const cacheKey = `${lang}:${text}`;
  let audio = ttsCache[cacheKey];
  if (!audio) {
    audio = new Audio(ttsUrl(text, lang));
    audio.preload = 'auto';
    ttsCache[cacheKey] = audio;
    audio.addEventListener('error', () => { delete ttsCache[cacheKey]; browserSpeak(text, lang); });
  }
  currentAudio = audio;
  const p = audio.play();
  if (p && p.catch) p.catch(() => browserSpeak(text, lang));
};

export const speak = async (text, lang = 'hi') => {
  if (!text) return;
  try { if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; } } catch (e) {}
  try { window.speechSynthesis.cancel(); } catch (e) {}

  if (recordedKeys.has(text)) {
    const url = await fetchClipUrl(text);
    if (url) {
      const a = new Audio(url);
      currentAudio = a;
      a.play().catch(() => playTTS(text, lang));
      return;
    }
  }
  playTTS(text, lang);
};

export const cancelSpeak = () => {
  try { if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; } } catch (e) {}
  try { window.speechSynthesis.cancel(); } catch (e) {}
};
