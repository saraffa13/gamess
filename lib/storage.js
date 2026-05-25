// Storage abstraction: Vercel Blob (when BLOB_READ_WRITE_TOKEN is set) or SQLite (local).
import { put, del, list } from '@vercel/blob';
import { getDb } from './db';

export const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const PREFIX = 'clips/';
const pathOf = (key) => PREFIX + encodeURIComponent(key);
const keyOf  = (path) => decodeURIComponent(path.slice(PREFIX.length));

export async function listClips() {
  if (USE_BLOB) {
    const { blobs } = await list({ prefix: PREFIX });
    return blobs.map(b => ({
      key: keyOf(b.pathname),
      mime: 'audio/webm',
      updated_at: new Date(b.uploadedAt).getTime(),
      url: b.url,
    }));
  }
  const rows = getDb().prepare('SELECT key, mime, updated_at FROM clips').all();
  return rows.map(r => ({
    key: r.key,
    mime: r.mime,
    updated_at: r.updated_at,
    url: `/api/clips/${encodeURIComponent(r.key)}`,
  }));
}

export async function putClip(key, buf, mime) {
  if (USE_BLOB) {
    const blob = await put(pathOf(key), buf, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: mime,
    });
    return { url: blob.url };
  }
  getDb().prepare(`
    INSERT INTO clips(key, mime, data, updated_at) VALUES(?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET mime=excluded.mime, data=excluded.data, updated_at=excluded.updated_at
  `).run(key, mime, buf, Date.now());
  return { url: `/api/clips/${encodeURIComponent(key)}` };
}

export async function getClip(key) {
  if (USE_BLOB) {
    try {
      const { blobs } = await list({ prefix: pathOf(key), limit: 1 });
      const b = blobs.find(x => x.pathname === pathOf(key));
      return b ? { url: b.url, mime: 'audio/webm', data: null } : null;
    } catch (e) { return null; }
  }
  const row = getDb().prepare('SELECT mime, data FROM clips WHERE key = ?').get(key);
  return row ? { ...row, url: null } : null;
}

export async function delClip(key) {
  if (USE_BLOB) {
    try {
      const { blobs } = await list({ prefix: pathOf(key), limit: 1 });
      const b = blobs.find(x => x.pathname === pathOf(key));
      if (b) await del(b.url);
    } catch (e) {}
    return;
  }
  getDb().prepare('DELETE FROM clips WHERE key = ?').run(key);
}
