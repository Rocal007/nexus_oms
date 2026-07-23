import { NextResponse } from 'next/server';
import { state } from '@/lib/backend-state';

export async function GET() {
  return NextResponse.json({
    connected:    state.imapConnected,
    lastPoll:     state.lastPollTime,
    error:        state.lastPollError,
    pendingCount: state.pendingEmails.length,
  });
}
