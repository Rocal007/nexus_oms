import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import imapSimple from 'imap-simple';
import { simpleParser } from 'mailparser';

// File Paths using process.cwd() (project root)
const SETTINGS_FILE = path.join(process.cwd(), 'server-settings.json');
const SPAM_FILE     = path.join(process.cwd(), 'spam-senders.json');
const USERS_FILE    = path.join(process.cwd(), 'users.json');
const UPLOADS_DIR   = path.join(process.cwd(), 'public', 'uploads');
const POLL_INTERVAL = 60_000;

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Shared In-Memory Backend State ──────────────────────────────────────────
export const state = {
  pendingEmails: [],
  processedUids: new Set(),
  imapConnected: false,
  lastPollTime: null,
  lastPollError: null,
  pollingIntervalId: null,
};

// ── Settings Helpers ────────────────────────────────────────────────────────
export function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('[Settings] Error loading settings:', err);
  }
  // Fallback World4You Defaults
  return {
    imap_host:     'imap.world4you.com',
    imap_port:     993,
    imap_user:     '',
    imap_password: 'E6paHG007#a2605',
    imap_ssl:      true,
    smtp_host:     'smtp.world4you.com',
    smtp_port:     587,
    smtp_user:     '',
    smtp_password: 'E6paHG007#a2605',
    smtp_ssl:      true,
  };
}

export function saveSettings(data) {
  const current = loadSettings();
  const merged  = { ...current, ...data };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

// ── Spam Helpers ────────────────────────────────────────────────────────────
export function loadSpamSenders() {
  try {
    if (fs.existsSync(SPAM_FILE)) {
      return JSON.parse(fs.readFileSync(SPAM_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return [];
}

export function addSpamSender(rawAddress) {
  const addr = extractEmailAddress(rawAddress);
  const cfg  = loadSettings();
  const ownAddrs = [cfg.imap_user, cfg.smtp_user].map(a => (a || '').toLowerCase());

  if (ownAddrs.includes(addr)) {
    console.warn(`[SPAM] Protection: own address "${addr}" will NOT be blocked.`);
    return loadSpamSenders();
  }

  const list = loadSpamSenders();
  if (!list.includes(addr)) {
    list.push(addr);
    fs.writeFileSync(SPAM_FILE, JSON.stringify(list, null, 2), 'utf8');
    console.log(`[SPAM] Blocked sender: ${addr}`);
  }
  return list;
}

export function removeSpamSender(rawAddress) {
  const addr    = extractEmailAddress(rawAddress);
  const updated = loadSpamSenders().filter(e => e !== addr);
  fs.writeFileSync(SPAM_FILE, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

// ── User Helpers ────────────────────────────────────────────────────────────
export function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

export function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch { }
  return [];
}

export function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export function initDefaultUsers() {
  if (loadUsers().length === 0) {
    saveUsers([
      { id: 1, username: 'admin',       password: hashPassword('admin123'), name: 'Administrator',    role: 'admin',       active: true, created_at: new Date().toISOString() },
      { id: 2, username: 'distributor', password: hashPassword('dist123'),  name: 'Distributor Demo', role: 'distributor', active: true, created_at: new Date().toISOString() },
    ]);
    console.log('[AUTH] Default users initialized (admin / distributor)');
  }
}

// Initialize default users immediately
initDefaultUsers();

// ── Email Extraction Helpers ────────────────────────────────────────────────
export function extractEmailAddress(from) {
  if (!from) return '';
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).toLowerCase().trim();
}

export function extractEmailFromBody(bodyText) {
  if (!bodyText) return null;
  const cfg      = loadSettings();
  const ownAddrs = [cfg.imap_user, cfg.smtp_user].map(a => (a || '').toLowerCase());
  const matches  = bodyText.match(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi) ?? [];
  return matches.find(m => !ownAddrs.includes(m.toLowerCase())) ?? null;
}

export function extractPhoneFromBody(bodyText) {
  if (!bodyText) return null;
  const labelMatch = bodyText.match(
    /(?:Tel(?:efon(?:nummer)?)?|Handy|Mobil(?:e?)|Phone|Fon)\s*[:\-]?\s*([\+\d][\d\s\-\/\.\(\)]{4,20}\d)/i
  );
  if (labelMatch) return labelMatch[1].replace(/\s{2,}/g, ' ').trim();

  const numMatch = bodyText.match(
    /(?:\+43|\+49|\+41|0043|0049|\b0)[1-9][\d\s\-\/\.\(\)]{5,18}\d/
  );
  if (numMatch) return numMatch[0].replace(/\s{2,}/g, ' ').trim();

  return null;
}

// ── IMAP Client Aktionen ───────────────────────────────────────────────────
async function openImapInbox() {
  const cfg = loadSettings();
  const connection = await imapSimple.connect({
    imap: {
      user:         cfg.imap_user,
      password:     cfg.imap_password,
      host:         cfg.imap_host,
      port:         Number(cfg.imap_port) || 993,
      tls:          cfg.imap_ssl !== false,
      tlsOptions:   { rejectUnauthorized: false },
      authTimeout:  10000,
    },
  });
  await connection.openBox('INBOX');
  return connection;
}

export async function imapDeleteByUid(uid) {
  const connection = await openImapInbox();
  try {
    await new Promise((resolve, reject) => {
      connection.imap.uid.addFlags(String(uid), ['\\Deleted'], err => {
        if (err) return reject(err);
        connection.imap.expunge(err2 => err2 ? reject(err2) : resolve());
      });
    });
    console.log(`[IMAP] Mail UID ${uid} permanently deleted.`);
  } finally {
    connection.end();
  }
}

export async function imapMoveToSpam(uid) {
  const connection = await openImapInbox();
  const SPAM_FOLDERS = ['Junk', 'Spam', 'INBOX.Junk', 'INBOX.Spam'];
  let moved = null;

  try {
    for (const folder of SPAM_FOLDERS) {
      try {
        await new Promise((resolve, reject) => {
          connection.imap.uid.move(String(uid), folder, err => err ? reject(err) : resolve());
        });
        moved = folder;
        console.log(`[IMAP] Mail UID ${uid} moved to folder "${folder}".`);
        break;
      } catch {
        // Folder does not exist, try next
      }
    }
    if (!moved) throw new Error('No spam/junk folder found on the server.');
  } finally {
    try { connection.end(); } catch { /* ignore */ }
  }
  return moved;
}

// ── IMAP Polling Loop ──────────────────────────────────────────────────────
export async function pollImap() {
  const cfg = loadSettings();

  if (!cfg.imap_user || !cfg.imap_password || !cfg.imap_host) {
    state.lastPollError = 'IMAP not configured (missing credentials/host).';
    state.imapConnected = false;
    return;
  }

  const config = {
    imap: {
      user:         cfg.imap_user,
      password:     cfg.imap_password,
      host:         cfg.imap_host,
      port:         Number(cfg.imap_port) || 993,
      tls:          cfg.imap_ssl !== false,
      tlsOptions:   { rejectUnauthorized: false },
      authTimeout:  10000,
    },
  };

  let connection;
  try {
    connection = await imapSimple.connect(config);

    connection.imap.on('error', (err) => {
      console.warn('[IMAP] Socket error (ignored):', err.message);
    });

    state.imapConnected = true;
    state.lastPollError = null;

    await connection.openBox('INBOX');

    const since = new Date();
    since.setDate(since.getDate() - 14);
    const searchCriteria = [['SINCE', since]];
    const fetchOptions = {
      bodies:   ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT', ''],
      markSeen: false,
      struct:   true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    state.lastPollTime = new Date().toISOString();

    const spamList = loadSpamSenders();
    let newCount = 0;

    for (const msg of messages) {
      const uid = String(msg.attributes.uid);

      if (state.processedUids.has(uid)) continue;
      if (state.pendingEmails.some(e => e.uid === uid)) continue;

      const allPart = msg.parts.find(p => p.which === '');
      if (!allPart) continue;

      const parsed = await simpleParser(allPart.body);
      const from = parsed.from?.text ?? '(unbekannt)';
      const fromAddr = extractEmailAddress(from);
      const text = parsed.text ?? '';

      const customerEmail = extractEmailFromBody(text);
      const customerPhone = extractPhoneFromBody(text);

      const checkAddrs = [fromAddr, customerEmail].filter(Boolean);
      const isSpam = spamList.some(blocked =>
        checkAddrs.some(a => a.includes(blocked) || blocked.includes(a))
      );

      if (isSpam) {
        console.log(`[POLL] Spam skipped: ${customerEmail ?? fromAddr}`);
        state.processedUids.add(uid);
        continue;
      }

      const subject = parsed.subject ?? '(kein Betreff)';
      const date = parsed.date ? parsed.date.toISOString() : new Date().toISOString();
      const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160);

      // Save attachments
      const attachments = [];
      for (const att of (parsed.attachments ?? [])) {
        if (!att.content || !att.filename) continue;
        const safeName = att.filename.replace(/[^a-zA-Z0-9._\-äöüÄÖÜß ]/g, '_').replace(/\s+/g, '_');
        const dir = path.join(UPLOADS_DIR, uid);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, safeName), att.content);
        attachments.push({
          filename:    att.filename,
          contentType: att.contentType ?? 'application/octet-stream',
          size:        att.size ?? att.content.length,
          url:         `/uploads/${uid}/${encodeURIComponent(safeName)}`,
        });
        console.log(`[ATT] Attachment saved: ${safeName} (${Math.round((att.size ?? att.content.length) / 1024)} KB)`);
      }

      state.pendingEmails.push({ uid, from, fromAddr, customerEmail, customerPhone, subject, date, text, html: parsed.html ?? '', snippet, attachments });
      newCount++;
    }

    console.log(`[POLL] ${newCount > 0 ? newCount + ' new mail(s)' : 'No new mails'} · total pending: ${state.pendingEmails.length}`);

  } catch (err) {
    state.imapConnected = false;
    state.lastPollError = err.message;
    console.error('[IMAP] Error during polling:', err.message);
  } finally {
    try { connection?.end(); } catch { /* ignore */ }
  }
}

// ── Polling Startup helper ──────────────────────────────────────────────────
export function startPolling() {
  if (state.pollingIntervalId) return;
  
  // Immediate poll on boot
  pollImap().catch(e => console.error('[IMAP] Initial poll failed:', e.message));

  state.pollingIntervalId = setInterval(() => {
    pollImap().catch(e => console.error('[IMAP] Interval poll failed:', e.message));
  }, POLL_INTERVAL);
  
  console.log('[IMAP Polling] Background polling loop initialized.');
}
