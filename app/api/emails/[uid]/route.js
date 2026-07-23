import { NextResponse } from 'next/server';
import { state, imapDeleteByUid } from '@/lib/backend-state';

export async function DELETE(request, { params }) {
  const { uid } = params;
  const idx = state.pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) {
    return NextResponse.json({ error: 'Mail nicht in pending-Liste.' }, { status: 404 });
  }

  const [email] = state.pendingEmails.splice(idx, 1);
  state.processedUids.add(uid);

  try {
    // Attempt actual IMAP deletion
    await imapDeleteByUid(uid);
    console.log(`[API] Email UID ${uid} deleted locally and from IMAP.`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // If IMAP fails, we still deleted it locally, so log a warning and return success
    console.warn(`[API] IMAP deletion failed for UID ${uid}, but removed locally:`, err.message);
    return NextResponse.json({ ok: true, warning: `Lokal gelöscht, aber IMAP-Fehler: ${err.message}` });
  }
}
