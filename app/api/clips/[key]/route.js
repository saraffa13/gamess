import { NextResponse } from 'next/server';
import { getClip, putClip, delClip } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const key = decodeURIComponent(params.key);
  const clip = await getClip(key);
  if (!clip) return new NextResponse('Not found', { status: 404 });
  if (clip.url) {
    return NextResponse.redirect(clip.url);
  }
  return new NextResponse(clip.data, {
    headers: {
      'Content-Type': clip.mime,
      'Cache-Control': 'no-store',
      'Content-Length': String(clip.data.length),
    },
  });
}

export async function PUT(req, { params }) {
  const key = decodeURIComponent(params.key);
  const mime = req.headers.get('content-type') || 'audio/webm';
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) return new NextResponse('Empty body', { status: 400 });
  try {
    const { url } = await putClip(key, buf, mime);
    return NextResponse.json({ ok: true, size: buf.length, url });
  } catch (e) {
    console.error('putClip failed:', e);
    return NextResponse.json({ ok: false, error: String(e && e.message || e) }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const key = decodeURIComponent(params.key);
  try {
    await delClip(key);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e && e.message || e) }, { status: 500 });
  }
}
