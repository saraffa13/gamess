import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const key = decodeURIComponent(params.key);
  const row = getDb().prepare('SELECT mime, data FROM clips WHERE key = ?').get(key);
  if (!row) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(row.data, {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'no-store',
      'Content-Length': String(row.data.length),
    },
  });
}

export async function PUT(req, { params }) {
  const key = decodeURIComponent(params.key);
  const mime = req.headers.get('content-type') || 'audio/webm';
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) return new NextResponse('Empty body', { status: 400 });
  getDb()
    .prepare(`
      INSERT INTO clips(key, mime, data, updated_at) VALUES(?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET mime=excluded.mime, data=excluded.data, updated_at=excluded.updated_at
    `)
    .run(key, mime, buf, Date.now());
  return NextResponse.json({ ok: true, size: buf.length });
}

export async function DELETE(_req, { params }) {
  const key = decodeURIComponent(params.key);
  getDb().prepare('DELETE FROM clips WHERE key = ?').run(key);
  return NextResponse.json({ ok: true });
}
