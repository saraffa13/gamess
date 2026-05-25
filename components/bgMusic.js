'use client';

// Plays /public/background.mp3 on loop at low volume.

const SRC = '/background.mp3';
const VOLUME = 0.15; // soft background level (0–1)

let audio = null;
let started = false;

const ensure = () => {
  if (typeof window === 'undefined') return null;
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = 'auto';
  }
  return audio;
};

export const startMusic = () => {
  const a = ensure();
  if (!a) return;
  if (started && !a.paused) return;
  const p = a.play();
  if (p && p.catch) p.catch(() => { /* autoplay blocked until user gesture */ });
  started = true;
};

export const stopMusic = () => {
  if (audio) { try { audio.pause(); } catch (e) {} }
  started = false;
};

export const isMusicPlaying = () => started && audio && !audio.paused;

export const setMusicVolume = (v) => {
  if (audio) audio.volume = Math.max(0, Math.min(1, v));
};
