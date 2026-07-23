import { NextResponse } from 'next/server';
import { state, addSpamSender, imapMoveToSpam } from '@/lib/backend-state';

export async function POST(request, { params }) {
  const { uid } = params;
  const idx = state.pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) {
    return NextResponse.json({ error: 'Mail nicht in pending-Liste.' }, { status: 404 });
  }

  const [email] = state.pendingEmails.splice(idx, 1);
  state.processedUids.add(uid);

  // Apply spam filter on customer email from body (so contact form address isn't blocked), fallback to From
  const spamTarget = email.customerEmail ?? email.from;
  const blockedSenders = addSpamSender(spamTarget);

  try {
    // Attempt actual IMAP move to Spam/Junk
    const folder = await imapMoveToSpam(uid);
    console.log(`[API] Email UID ${uid} moved to spam folder "${folder}" in IMAP.`);
    return NextResponse.json({ ok: true, folder, blockedSenders });
  } catch (err) {
    // If IMAP move fails, we still blocked them locally, so log warning and succeed
    console.error('[API] IMAP move to spam failed, but blocked sender locally:', err.message);
    return NextResponse.json({
      ok: true,
      folder: null,
      warning: `Lokale Sperre eingerichtet, aber IMAP-Fehler beim Verschieben: ${err.message}`,
      blockedSenders
    });
  }
}
