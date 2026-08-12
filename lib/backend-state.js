import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import imapSimple from 'imap-simple';
import { simpleParser } from 'mailparser';

// Vercel has a read-only filesystem, so we must use /tmp for ephemeral state
const IS_VERCEL = process.env.VERCEL === '1';
const DATA_DIR = IS_VERCEL ? '/tmp' : process.cwd();

// File Paths
const SETTINGS_FILE = path.join(DATA_DIR, 'server-settings.json');
const SPAM_FILE     = path.join(DATA_DIR, 'spam-senders.json');
const USERS_FILE    = path.join(DATA_DIR, 'users.json');
// Uploads remain in public locally, but on Vercel we must use /tmp (though they won't be persistently servable without an S3 bucket)
const UPLOADS_DIR   = IS_VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
const POLL_INTERVAL = 300_000; // 5 Minuten


// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Shared In-Memory Backend State ──────────────────────────────────────────
const PENDING_FILE  = path.join(DATA_DIR, 'pending-emails.json');
const PROCESSED_FILE= path.join(DATA_DIR, 'processed-uids.json');
const IMAP_QUEUE_FILE= path.join(DATA_DIR, 'imap-queue.json');

function loadStateFile(file, defaultVal) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {}
  return defaultVal;
}

function saveStateFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export const state = {
  get pendingEmails() { return loadStateFile(PENDING_FILE, []); },
  set pendingEmails(val) { saveStateFile(PENDING_FILE, val); },
  
  get processedUids() { return new Set(loadStateFile(PROCESSED_FILE, [])); },
  set processedUids(val) { saveStateFile(PROCESSED_FILE, Array.from(val)); },
  
  get imapQueue() { return loadStateFile(IMAP_QUEUE_FILE, []); },
  set imapQueue(val) { saveStateFile(IMAP_QUEUE_FILE, val); },

  
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
  // Fallback Env Defaults without hardcoded passwords in codebase
  return {
    imap_host:     process.env.IMAP_HOST || 'imap.world4you.com',
    imap_port:     Number(process.env.IMAP_PORT) || 993,
    imap_user:     process.env.IMAP_USER || '',
    imap_password: process.env.IMAP_PASSWORD || '',
    imap_ssl:      process.env.IMAP_SSL !== 'false',
    smtp_host:     process.env.SMTP_HOST || 'smtp.world4you.com',
    smtp_port:     Number(process.env.SMTP_PORT) || 587,
    smtp_user:     process.env.SMTP_USER || '',
    smtp_password: process.env.SMTP_PASSWORD || '',
    smtp_ssl:      process.env.SMTP_SSL !== 'false',
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

// ── Secure Password Hashing (Salted PBKDF2) ──────────────────────────────────
export function hashPassword(pw, existingSalt = null) {
  if (!pw) return '';
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(pw, storedHash) {
  if (!pw || !storedHash) return false;
  // Legacy unsalted SHA-256 fallback for existing legacy accounts
  if (!storedHash.includes(':') && storedHash.length === 64) {
    const legacyHash = crypto.createHash('sha256').update(pw).digest('hex');
    return legacyHash === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const computedHash = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch {
    return false;
  }
}

// ── Cryptographic JWT Token Auth ─────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_default_secret_key_change_in_production_32chars';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

export function createJwtToken(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwtToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null; // Signature mismatch
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ── User Helpers ────────────────────────────────────────────────────────────
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
    console.log('[AUTH] Default users initialized with salted hashes (admin / distributor)');
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

// ── IMAP Client Actions ───────────────────────────────────────────────────
async function openImapInbox() {
  const cfg = loadSettings();
  const rejectUnauthorized = process.env.IMAP_TLS_REJECT_UNAUTHORIZED !== 'false';
  const connection = await imapSimple.connect({
    imap: {
      user:         cfg.imap_user,
      password:     cfg.imap_password,
      host:         cfg.imap_host,
      port:         Number(cfg.imap_port) || 993,
      tls:          cfg.imap_ssl !== false,
      tlsOptions:   { rejectUnauthorized },
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
      connection.addFlags(String(uid), '\\Deleted', err => {
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
          connection.moveMessage(String(uid), folder, err => err ? reject(err) : resolve());
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

  const rejectUnauthorized = process.env.IMAP_TLS_REJECT_UNAUTHORIZED !== 'false';
  const config = {
    imap: {
      user:         cfg.imap_user,
      password:     cfg.imap_password,
      host:         cfg.imap_host,
      port:         Number(cfg.imap_port) || 993,
      tls:          cfg.imap_ssl !== false,
      tlsOptions:   { rejectUnauthorized },
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

    // ── 1. Process IMAP Action Queue ──
    const queue = state.imapQueue;
    if (queue.length > 0) {
      console.log(`[IMAP] Processing queue with ${queue.length} actions...`);
      const SPAM_FOLDERS = ['Junk', 'Spam', 'INBOX.Junk', 'INBOX.Spam'];
      for (const job of queue) {
        try {
          if (job.action === 'delete') {
            await new Promise((resolve, reject) => {
              connection.addFlags(String(job.uid), '\\Deleted', err => err ? reject(err) : resolve());
            });
            console.log(`[IMAP] UID ${job.uid} marked as deleted.`);
          } else if (job.action === 'spam') {
            for (const folder of SPAM_FOLDERS) {
              try {
                await new Promise((resolve, reject) => {
                  connection.moveMessage(String(job.uid), folder, err => err ? reject(err) : resolve());
                });
                console.log(`[IMAP] UID ${job.uid} moved to spam (${folder}).`);
                break;
              } catch { /* try next folder */ }
            }
          }
        } catch (err) {
          console.warn(`[IMAP] Failed to process queue job ${job.action} for ${job.uid}:`, err.message);
        }
      }
      
      // Expunge deleted messages
      await new Promise((resolve, reject) => connection.imap.expunge(err => err ? reject(err) : resolve()));
      
      // Clear queue
      state.imapQueue = [];
    }

    // ── 2. Fetch New Emails ──
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
    
    // Load state once for the loop
    const currentPending = state.pendingEmails;
    const currentProcessed = state.processedUids;

    for (const msg of messages) {
      const uid = String(msg.attributes.uid);

      if (currentProcessed.has(uid)) continue;
      if (currentPending.some(e => e.uid === uid)) continue;

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
        currentProcessed.add(uid);
        continue;
      }

      const subject = parsed.subject ?? '(kein Betreff)';
      const date = parsed.date ? parsed.date.toISOString() : new Date().toISOString();
      const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160);

      // Save attachments safely
      const attachments = [];
      const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.php', '.js', '.html', '.htm', '.vbs'];
      for (const att of (parsed.attachments ?? [])) {
        if (!att.content || !att.filename) continue;
        const ext = path.extname(att.filename).toLowerCase();
        if (BLOCKED_EXTENSIONS.includes(ext)) {
          console.warn(`[ATT] Blocked unsafe file attachment extension: ${att.filename}`);
          continue;
        }
        const safeName = att.filename.replace(/[^a-zA-Z0-9._\-äöüÄÖÜß ]/g, '_').replace(/\s+/g, '_');
        const dir = path.join(UPLOADS_DIR, uid);
        const filePath = path.join(dir, safeName);
        fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, att.content);
          console.log(`[ATT] Attachment saved: ${safeName} (${Math.round((att.size ?? att.content.length) / 1024)} KB)`);
        }
        attachments.push({
          filename:    att.filename,
          contentType: att.contentType ?? 'application/octet-stream',
          size:        att.size ?? att.content.length,
          url:         `/uploads/${uid}/${encodeURIComponent(safeName)}`,
        });
      }

      currentPending.push({ uid, from, fromAddr, customerEmail, customerPhone, subject, date, text, html: parsed.html ?? '', snippet, attachments });
      currentProcessed.add(uid);
      newCount++;
    }
    
    // Save state back to disk
    state.pendingEmails = currentPending;
    state.processedUids = currentProcessed;

    console.log(`[POLL] ${newCount > 0 ? newCount + ' new mail(s)' : 'No new mails'} · total pending: ${currentPending.length}`);

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
