export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on the server side in NodeJS runtime
    const { startPolling } = await import('./lib/backend-state');
    startPolling();
  }
}
