import { NextResponse } from 'next/server';
import { listClips } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await listClips();
  return NextResponse.json(rows);
}
