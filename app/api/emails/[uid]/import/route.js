import { NextResponse } from 'next/server';
import { state } from '@/lib/backend-state';

export async function POST(request, { params }) {
  const { uid } = params;
  const idx = state.pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) {
    return NextResponse.json({ error: 'Mail nicht gefunden.' }, { status: 404 });
  }

  const [email] = state.pendingEmails.splice(idx, 1);
  state.processedUids.add(uid);

  // Prefer customer email from message body, fallback to From header
  const senderDisplay = email.customerEmail ?? email.from;
  const draft = {
    source:        'email',
    caller_name:   senderDisplay,
    anfrage:       `Betreff: ${email.subject}\n\n${email.text || ''}`.trim(),
    notes:         `Importiert aus E-Mail · UID ${email.uid} · ${email.date ?? ''}`,
    termin_wunsch: '',
    ort:           '',
    priority:      'normal',
    email_uid:     email.uid,
    created_at:    email.date,
  };

  return NextResponse.json({ ok: true, draft });
}
