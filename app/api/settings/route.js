import { NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/backend-state';

export async function GET() {
  const s = loadSettings();
  // Mask passwords
  return NextResponse.json({ ...s, imap_password: '***', smtp_password: '***' });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const saved = saveSettings(body);
    return NextResponse.json({
      ok: true,
      settings: { ...saved, imap_password: '***', smtp_password: '***' }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
