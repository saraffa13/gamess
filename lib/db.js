import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
let db = null;

export function getDb() {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, 'voices.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS clips (
      key        TEXT PRIMARY KEY,
      mime       TEXT NOT NULL,
      data       BLOB NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return db;
}
