import { NextResponse } from 'next/server';
import { loadSpamSenders } from '@/lib/backend-state';

export async function GET() {
  const list = loadSpamSenders();
  return NextResponse.json(list);
}
