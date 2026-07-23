import { NextResponse } from 'next/server';
import { removeSpamSender } from '@/lib/backend-state';

export async function DELETE(request, { params }) {
  try {
    const email = decodeURIComponent(params.email);
    const updated = removeSpamSender(email);
    return NextResponse.json({ ok: true, blockedSenders: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
