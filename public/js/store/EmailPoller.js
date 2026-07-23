/**
 * EmailPoller.js — Frontend-Singleton für IMAP-Polling via lokalen Server.
 *
 * Fragt alle 60 Sek. GET /api/emails/pending ab.
 * Feuert folgende CustomEvents auf window:
 *   • nexus:email-received  → detail: { emails: [], count: number }
 *   • nexus:email-status    → detail: { connected: bool, error: string|null }
 */

const API_BASE     = '';
const POLL_MS      = 60_000;

let _timer         = null;
let _lastCount     = 0;
let _started       = false;

export const EmailPoller = Object.freeze({

  /** Startet das Polling. Idempotent — mehrfaches Aufrufen hat keinen Effekt. */
  start() {
    if (_started) return;
    _started = true;
    _poll();
    _timer = setInterval(_poll, POLL_MS);
    console.log('[EmailPoller] Gestartet · Intervall:', POLL_MS / 1000, 's');
  },

  /** Stoppt das Polling. */
  stop() {
    if (_timer) { clearInterval(_timer); _timer = null; }
    _started = false;
  },

  /** Sofort einmal pollen (z. B. nach manuellem Refresh). */
  pollNow() {
    _poll();
  },

  /** Gibt die Server-Basis-URL zurück (für andere Module). */
  get apiBase() { return API_BASE; },
});

// ── Internes Polling ─────────────────────────────────────────────────────────

async function _poll() {
  // 1. Health-Check
  try {
    const hRes    = await fetch(`${API_BASE}/api/health`);
    const health  = await hRes.json();

    window.dispatchEvent(new CustomEvent('nexus:email-status', {
      detail: {
        connected: health.connected,
        error:     health.error,
        lastPoll:  health.lastPoll,
      },
    }));
  } catch {
    window.dispatchEvent(new CustomEvent('nexus:email-status', {
      detail: { connected: false, error: 'Server nicht erreichbar (läuft server.js?)' },
    }));
    return; // Kein Sinn, weiter zu pollen wenn Server weg
  }

  // 2. Ausstehende E-Mails
  try {
    const eRes   = await fetch(`${API_BASE}/api/emails/pending`);
    const emails = await eRes.json();
    const count  = emails.length;

    if (count !== _lastCount) {
      _lastCount = count;
      window.dispatchEvent(new CustomEvent('nexus:email-received', {
        detail: { emails, count },
      }));
    }
  } catch (err) {
    console.warn('[EmailPoller] Fehler beim Abrufen der E-Mails:', err.message);
  }
}
