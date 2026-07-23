import { NextResponse } from 'next/server';
import { state, pollImap } from '@/lib/backend-state';

export async function GET() {
  // Serverless / On-demand poll check
  const now = Date.now();
  const lastPoll = state.lastPollTime ? new Date(state.lastPollTime).getTime() : 0;
  
  if (now - lastPoll > 60_000) {
    console.log('[API] On-demand IMAP polling triggered.');
    await pollImap();
  }

  const sorted = [...state.pendingEmails].sort((a, b) => new Date(b.date) - new Date(a.date));
  return NextResponse.json(sorted);
}
