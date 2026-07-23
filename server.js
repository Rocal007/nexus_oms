/**
 * server.js — NEXUS OMS · lokaler IMAP-Polling-Server
 * =====================================================
 * • Verbindet sich via IMAP (SSL/TLS) mit World4You
 * • Holt neue E-Mails, markiert sie als \Seen — löscht sie NICHT
 * • Stellt REST-API für das Frontend bereit
 * • Liefert das statische Frontend (index.html) aus
 *
 * Endpoints:
 *   GET  /api/health              → IMAP-Verbindungsstatus
 *   GET  /api/emails/pending      → ungeparste, neue E-Mails
 *   POST /api/emails/:uid/import  → Mail als Auftrags-Entwurf importieren
 *   GET  /api/settings            → gespeicherte Server-Einstellungen
 *   POST /api/settings            → Server-Einstellungen speichern
 */

'use strict';

// Verhindert Server-Absturz bei abgelehnten Promises (z.B. IMAP-Fehler)
process.on('unhandledRejection', (err) => {
  console.error('[Server] Unbehandelte Ablehnung:', err?.message ?? err);
});
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err?.message ?? err);
});

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const imapSimple = require('imap-simple');
const { simpleParser } = require('mailparser');



// ── Models / Daten laden ────────────────────────────────────────────────────────────

const PORT           = 5100;
const SETTINGS_FILE  = path.join(__dirname, 'server-settings.json');
const SPAM_FILE      = path.join(__dirname, 'spam-senders.json');
const UPLOADS_DIR    = path.join(__dirname, 'uploads');
const POLL_INTERVAL  = 60_000; // 60 Sekunden

// Uploads-Verzeichnis sicherstellen
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/** @returns {{ imap_host, imap_port, imap_user, imap_password, imap_ssl,
 *              smtp_host, smtp_port, smtp_user, smtp_password, smtp_ssl }} */
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  // Fallback — World4You-Defaults
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

function saveSettings(data) {
  const current = loadSettings();
  const merged  = { ...current, ...data };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

/** @returns {string[]} Liste gesperrter Absender-Adressen */
function loadSpamSenders() {
  try {
    if (fs.existsSync(SPAM_FILE)) return JSON.parse(fs.readFileSync(SPAM_FILE, 'utf8'));
  } catch { /* ignore */ }
  return [];
}

/**
 * Fügt eine E-Mail-Adresse zur Spam-Sperrliste hinzu.
 * Speichert immer nur die reine Adresse (nie den vollen From-String).
 * Schützt eigene konfigurierte Adressen vor versehentlichem Sperren.
 * @param {string} rawAddress  — kann voller From-String oder reine Adresse sein
 */
function addSpamSender(rawAddress) {
  const addr     = extractEmailAddress(rawAddress); // immer nur reine Adresse
  const cfg      = loadSettings();
  const ownAddrs = [cfg.imap_user, cfg.smtp_user].map(a => (a || '').toLowerCase());

  if (ownAddrs.includes(addr)) {
    console.warn(`[SPAM] Schutz: eigene Adresse "${addr}" wird NICHT gesperrt.`);
    return loadSpamSenders();
  }

  const list = loadSpamSenders();
  if (!list.includes(addr)) {
    list.push(addr);
    fs.writeFileSync(SPAM_FILE, JSON.stringify(list, null, 2), 'utf8');
    console.log(`[SPAM] Absender gesperrt: ${addr}`);
  }
  return list;
}

/** @param {string} rawAddress */
function removeSpamSender(rawAddress) {
  const addr    = extractEmailAddress(rawAddress);
  const updated = loadSpamSenders().filter(e => e !== addr);
  fs.writeFileSync(SPAM_FILE, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

/**
 * Sucht nach einer E-Mail-Adresse im Nachrichtentext des Kontaktformulars.
 * Ignoriert die eigene konfigurierte Adresse.
 * @param {string} bodyText
 * @returns {string|null}
 */
function extractEmailFromBody(bodyText) {
  if (!bodyText) return null;
  const cfg      = loadSettings();
  const ownAddrs = [cfg.imap_user, cfg.smtp_user].map(a => (a || '').toLowerCase());
  const matches  = bodyText.match(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi) ?? [];
  return matches.find(m => !ownAddrs.includes(m.toLowerCase())) ?? null;
}

/**
 * Extrahiert eine Telefonnummer aus dem Nachrichtentext.
 * Strategie 1: Sucht nach Kontaktformular-Label (Tel, Telefon, Handy …)
 * Strategie 2: Fallback – allgemeiner Regex für AT/DE/CH/international
 * @param {string} bodyText
 * @returns {string|null}
 */
function extractPhoneFromBody(bodyText) {
  if (!bodyText) return null;

  // Strategie 1: Kontaktformular-Label direkt vor der Nummer
  // z.B. "Tel: 0664 1234567" / "Telefon: +43 664 …" / "Handy: 06641234567"
  const labelMatch = bodyText.match(
    /(?:Tel(?:efon(?:nummer)?)?|Handy|Mobil(?:e?)|Phone|Fon)\s*[:\-]?\s*([\+\d][\d\s\-\/\.\(\)]{4,20}\d)/i
  );
  if (labelMatch) return labelMatch[1].replace(/\s{2,}/g, ' ').trim();

  // Strategie 2: Allgemeiner Fallback – AT (+43/0043/0) + DE (+49) + CH (+41)
  const numMatch = bodyText.match(
    /(?:\+43|\+49|\+41|0043|0049|\b0)[1-9][\d\s\-\/\.\(\)]{5,18}\d/
  );
  if (numMatch) return numMatch[0].replace(/\s{2,}/g, ' ').trim();

  return null;
}


// ── IMAP-Aktionen (Verbindung nur für Einzeloperation öffnen) ────────────────

/** Baut eine frische IMAP-Verbindung auf und öffnet INBOX. */
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

/**
 * Löscht eine Mail dauerhaft vom Server (\Deleted + expunge).
 * @param {string} uid
 */
async function imapDeleteByUid(uid) {
  const connection = await openImapInbox();
  try {
    // UID-basiertes Flag setzen
    await new Promise((resolve, reject) => {
      connection.imap.uid.addFlags(String(uid), ['\\Deleted'], err => {
        if (err) return reject(err);
        // Expunge entfernt alle \Deleted-Nachrichten dauerhaft
        connection.imap.expunge(err2 => err2 ? reject(err2) : resolve());
      });
    });
    console.log(`[IMAP] Mail UID ${uid} dauerhaft gelöscht.`);
  } finally {
    connection.end();
  }
}

/**
 * Verschiebt eine Mail in den Junk/Spam-Ordner auf dem Server.
 * @param {string} uid
 * @returns {Promise<string>} genutzter Ordnername
 */
async function imapMoveToSpam(uid) {
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
        console.log(`[IMAP] Mail UID ${uid} in Ordner "${folder}" verschoben.`);
        break;
      } catch {
        // Ordner existiert nicht → nächsten versuchen
      }
    }
    if (!moved) throw new Error('Kein Spam/Junk-Ordner auf dem Server gefunden.');
  } finally {
    try { connection.end(); } catch { /* ignore */ }
  }
  return moved;
}

// ── In-Memory Zwischenspeicher ───────────────────────────────────────────────

/** @type {{ uid: string, from: string, subject: string, date: string, text: string, html: string, snippet: string }[]} */
let pendingEmails  = [];
let imapConnected  = false;
let lastPollTime   = null;
let lastPollError  = null;

/**
 * UIDs die bereits importiert, gelöscht oder als Spam markiert wurden.
 * Verhindert, dass beim nächsten Poll diese Mails erneut erscheinen.
 * @type {Set<string>}
 */
const processedUids = new Set();

/**
 * Extrahiert die reine E-Mail-Adresse aus einem From-String.
 * Beispiel: '"Max Muster" <max@example.com>' → 'max@example.com'
 * @param {string} from
 * @returns {string}
 */
function extractEmailAddress(from) {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).toLowerCase().trim();
}

// ── IMAP Polling ─────────────────────────────────────────────────────────────

async function pollImap() {
  const cfg = loadSettings();

  if (!cfg.imap_user || !cfg.imap_password || !cfg.imap_host) {
    lastPollError = 'IMAP nicht konfiguriert (Benutzername fehlt).';
    imapConnected = false;
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
    connection    = await imapSimple.connect(config);

    // Verhindert Crash wenn der IMAP-Socket nach end() noch einen Fehler emittiert
    connection.imap.on('error', (err) => {
      console.warn('[IMAP] Socket-Fehler (ignoriert):', err.message);
    });

    imapConnected = true;
    lastPollError = null;

    await connection.openBox('INBOX');

    // Alle Mails der letzten 14 Tage abrufen (unabhängig vom Gelesen-Status)
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const searchCriteria = [['SINCE', since]];
    const fetchOptions   = {
      bodies:   ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT', ''],
      markSeen: false,
      struct:   true,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    lastPollTime   = new Date().toISOString();

    const spamList = loadSpamSenders();
    let newCount   = 0;

    for (const msg of messages) {
      const uid = String(msg.attributes.uid);

      if (processedUids.has(uid))                 continue;
      if (pendingEmails.some(e => e.uid === uid)) continue;

      const allPart = msg.parts.find(p => p.which === '');
      if (!allPart) continue;

      const parsed        = await simpleParser(allPart.body);
      const from          = parsed.from?.text ?? '(unbekannt)';
      const fromAddr      = extractEmailAddress(from);
      const text          = parsed.text ?? '';
      // Kunden-E-Mail + Telefon aus dem Body extrahieren
      const customerEmail = extractEmailFromBody(text);
      const customerPhone = extractPhoneFromBody(text);
      // … dann Spam-Check gegen BEIDE Adressen (From UND Kunden-E-Mail aus Body)
      const checkAddrs    = [fromAddr, customerEmail].filter(Boolean);
      const isSpam        = spamList.some(blocked =>
        checkAddrs.some(a => a.includes(blocked) || blocked.includes(a))
      );
      if (isSpam) {
        console.log(`[POLL] Spam übersprungen: ${customerEmail ?? fromAddr}`);
        processedUids.add(uid);
        continue;
      }

      const subject  = parsed.subject ?? '(kein Betreff)';
      const date     = parsed.date ? parsed.date.toISOString() : new Date().toISOString();
      const snippet  = text.replace(/\s+/g, ' ').trim().slice(0, 160);

      // ── Anhänge speichern ──────────────────────────────────────────────────
      const attachments = [];
      for (const att of (parsed.attachments ?? [])) {
        if (!att.content || !att.filename) continue;
        // Dateiname bereinigen (keine Sonderzeichen/Pfadtraversierung)
        const safeName = att.filename.replace(/[^a-zA-Z0-9._\-äöüÄÖÜß ]/g, '_').replace(/\s+/g, '_');
        const dir      = path.join(UPLOADS_DIR, uid);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, safeName), att.content);
        attachments.push({
          filename:    att.filename,
          contentType: att.contentType ?? 'application/octet-stream',
          size:        att.size ?? att.content.length,
          url:         `/uploads/${uid}/${encodeURIComponent(safeName)}`,
        });
        console.log(`[ATT]  Anhang gespeichert: ${safeName} (${Math.round((att.size ?? att.content.length) / 1024)} KB)`);
      }

      pendingEmails.push({ uid, from, fromAddr, customerEmail, customerPhone, subject, date, text, html: parsed.html ?? '', snippet, attachments });
      newCount++;
      console.log(`[IMAP] Mail gespeichert · UID ${uid} · ${customerEmail ? 'Kunde: ' + customerEmail : 'von ' + from}${customerPhone ? ' · Tel: ' + customerPhone : ''}${attachments.length ? ' · ' + attachments.length + ' Anhänge' : ''}`);
    }

    console.log(`[POLL] ${newCount > 0 ? newCount + ' neue Mail(s)' : 'Keine neuen Mails'} · gesamt: ${pendingEmails.length}`);

  } catch (err) {
    imapConnected = false;
    lastPollError = err.message;
    console.error('[IMAP] Fehler:', err.message);
  } finally {
    // Immer sauber schließen — Fehler dabei ignorieren
    try { connection?.end(); } catch { /* ignore */ }
  }
}


// ── Express-App ──────────────────────────────────────────────────────────────

const app = express();

app.post('/log', express.text(), (req, res) => {
  console.log('[CLIENT ERROR]', req.body);
  res.sendStatus(200);
});

app.use(cors());
app.use(express.json());

// Statisches Frontend ausliefern
const staticOptions = {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use(express.static(path.join(__dirname), staticOptions));

// Anhänge ausliefern
app.use('/uploads', express.static(UPLOADS_DIR, staticOptions));

// ── REST API ─────────────────────────────────────────────────────────────────

/** GET /api/health */
app.get('/api/health', (_req, res) => {
  res.json({
    connected:    imapConnected,
    lastPoll:     lastPollTime,
    error:        lastPollError,
    pendingCount: pendingEmails.length,
  });
});

/** GET /api/emails/pending — neueste zuerst */
app.get('/api/emails/pending', (_req, res) => {
  const sorted = [...pendingEmails].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

/**
 * POST /api/emails/:uid/import
 * Entfernt die Mail aus der pending-Liste (sie bleibt auf dem IMAP-Server,
 * ist dort aber bereits als \Seen markiert).
 */
app.post('/api/emails/:uid/import', (req, res) => {
  const { uid }  = req.params;
  const idx      = pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) return res.status(404).json({ error: 'Mail nicht gefunden.' });

  const [email] = pendingEmails.splice(idx, 1);
  processedUids.add(uid);
  // Kunden-E-Mail bevorzugen (aus Formular-Body), Fallback auf From-Adresse
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
  res.json({ ok: true, draft });
});

/** DELETE /api/emails/:uid — aus pending-Liste entfernen */
app.delete('/api/emails/:uid', (req, res) => {
  const { uid } = req.params;
  const idx     = pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) return res.status(404).json({ error: 'Mail nicht gefunden.' });
  pendingEmails.splice(idx, 1);
  processedUids.add(uid); // beim nächsten Poll nicht nochmals laden
  console.log(`[API] E-Mail UID ${uid} gelöscht.`);
  res.json({ ok: true });
});

/** POST /api/emails/:uid/spam — Absender ignorieren + Mail entfernen */
app.post('/api/emails/:uid/spam', (req, res) => {
  const { uid } = req.params;
  const idx     = pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) return res.status(404).json({ error: 'Mail nicht gefunden.' });
  const [email] = pendingEmails.splice(idx, 1);
  processedUids.add(uid);
  // Spam-Sperre auf Kunden-E-Mail (aus Body) anwenden — NICHT auf die Formular-Absenderadresse!
  // So wird das Kontaktformular selbst niemals gesperrt.
  const spamTarget = email.customerEmail ?? email.from;
  const blocked    = addSpamSender(spamTarget);
  console.log(`[API] Spam-Markierung · UID ${uid} · Gesperrt: ${spamTarget}`);
  res.json({
    ok:      true,
    blocked: spamTarget,
    folder:  'Junk',
  });
});

/** GET /api/settings */
app.get('/api/settings', (_req, res) => {
  const s = loadSettings();
  // Passwort nicht im Klartext zurückgeben
  res.json({ ...s, imap_password: '***', smtp_password: '***' });
});

/** POST /api/settings */
app.post('/api/settings', (req, res) => {
  const saved = saveSettings(req.body);
  res.json({ ok: true, settings: { ...saved, imap_password: '***', smtp_password: '***' } });
});

/**
 * DELETE /api/emails/:uid
 * Löscht die Mail dauerhaft vom IMAP-Server (\Deleted + expunge).
 */
app.delete('/api/emails/:uid', async (req, res) => {
  const { uid } = req.params;
  const idx     = pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) return res.status(404).json({ error: 'Mail nicht in pending-Liste.' });

  try {
    await imapDeleteByUid(uid);
    pendingEmails.splice(idx, 1);          // aus In-Memory-Liste entfernen
    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE] Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/emails/:uid/spam
 * Verschiebt Mail in Junk-Ordner + sperrt Absender dauerhaft.
 */
app.post('/api/emails/:uid/spam', async (req, res) => {
  const { uid } = req.params;
  const idx     = pendingEmails.findIndex(e => e.uid === uid);
  if (idx === -1) return res.status(404).json({ error: 'Mail nicht in pending-Liste.' });

  const [email] = pendingEmails.splice(idx, 1);

  try {
    const folder  = await imapMoveToSpam(uid);
    const senders = addSpamSender(email.from);
    res.json({ ok: true, folder, blockedSenders: senders });
  } catch (err) {
    // Mail war schon verschoben — Absender trotzdem sperren
    const senders = addSpamSender(email.from);
    console.error('[SPAM] Verschieben fehlgeschlagen:', err.message);
    res.json({ ok: true, folder: null, warning: err.message, blockedSenders: senders });
  }
});

/** GET /api/spam-senders — Liste aller gesperrten Absender */
app.get('/api/spam-senders', (_req, res) => {
  res.json(loadSpamSenders());
});

/** DELETE /api/spam-senders/:email — Absender wieder entsperren */
app.delete('/api/spam-senders/:email', (req, res) => {
  const updated = removeSpamSender(decodeURIComponent(req.params.email));
  res.json({ ok: true, blockedSenders: updated });
});

// ══════════════════════════════════════════════════════════════
// BENUTZERVERWALTUNG
// ══════════════════════════════════════════════════════════════

const USERS_FILE = path.join(__dirname, 'users.json');
const crypto     = require('crypto');

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch { }
  return [];
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}
function initDefaultUsers() {
  if (loadUsers().length === 0) {
    saveUsers([
      { id: 1, username: 'admin',       password: hashPassword('admin123'), name: 'Administrator',    role: 'admin',       active: true, created_at: new Date().toISOString() },
      { id: 2, username: 'distributor', password: hashPassword('dist123'),  name: 'Distributor Demo', role: 'distributor', active: true, created_at: new Date().toISOString() },
    ]);
    console.log('[AUTH] Standard-Benutzer angelegt (admin / distributor)');
  }
}
initDefaultUsers();

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'Benutzername und Passwort erforderlich.' });
  const user = loadUsers().find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashPassword(password) && u.active);
  if (!user) return res.status(401).json({ ok: false, error: 'Ungültige Anmeldedaten oder Konto inaktiv.' });
  const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');
  const { password: _pw, ...safeUser } = user;
  res.json({ ok: true, user: safeUser, token });
});

app.get('/api/users', (_req, res) => {
  res.json(loadUsers().map(({ password: _pw, ...u }) => u));
});

app.post('/api/users', (req, res) => {
  const { username, password, name, role } = req.body || {};
  if (!username || !password || !name || !role) return res.status(400).json({ error: 'username, password, name und role erforderlich.' });
  const users = loadUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: `Benutzername bereits vergeben.` });
  const newUser = { id: (Math.max(0, ...users.map(u => u.id)) + 1), username: username.trim(), password: hashPassword(password), name: name.trim(), role: role === 'admin' ? 'admin' : 'distributor', active: true, created_at: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
  const { password, name, role, active } = req.body || {};
  if (name   !== undefined) users[idx].name   = name.trim();
  if (role   !== undefined) users[idx].role   = role === 'admin' ? 'admin' : 'distributor';
  if (active !== undefined) users[idx].active = Boolean(active);
  if (password)             users[idx].password = hashPassword(password);
  saveUsers(users);
  const { password: _pw, ...safeUser } = users[idx];
  res.json(safeUser);
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const users = loadUsers();
  const user  = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
  if (user.username === 'admin') return res.status(403).json({ error: 'Admin kann nicht gelöscht werden.' });
  saveUsers(users.filter(u => u.id !== id));
  res.json({ ok: true });
});



app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use(express.static(path.join(__dirname), staticOptions));

// Frontend-Routing: alle nicht-API-Routen → index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`╔══════════════════════════════════════════╗`);
  console.log(`║   NEXUS OMS · Mail-Server läuft          ║`);
  console.log(`║   http://localhost:${PORT}                  ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);

  // Sofort beim Start pollen, dann alle 60 Sek.
  pollImap().catch(e => console.error('[IMAP] Start-Poll fehlgeschlagen:', e.message));
  setInterval(() => {
    pollImap().catch(e => console.error('[IMAP] Poll-Fehler:', e.message));
  }, POLL_INTERVAL);
});
