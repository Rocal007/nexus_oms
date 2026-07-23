/**
 * EmailInboxView.js — Posteingang: zeigt neue E-Mails vom IMAP-Server.
 * Callbacks:
 *   onImport(uid)   — Nutzer möchte Mail als Auftrag importieren
 *   onRefresh()     — Nutzer löst manuellen Poll aus
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';
import { EmailPoller } from '../store/EmailPoller.js';

export class EmailInboxView extends BaseView {
  constructor(container) {
    super(container);
    this._onImport  = null;
    this._onDelete  = null;
    this._onSpam    = null;
    this._onRefresh = null;
    this._emails    = [];
    this._connected = false;
    this._error     = null;
    this._listEl    = null;
    this._statusEl  = null;

    // Event-Listener (gespeichert für cleanup)
    this._onEmailReceived = e => this._updateList(e.detail.emails);
    this._onEmailStatus   = e => this._updateStatus(e.detail);
  }

  render() {
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: '📬 E-Mail-Posteingang' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'MODULE::EMAIL_INBOX · IMAP · World4You' }),
      ]),
      ce('div', { className: 'page-header__actions' }, [
        this._makeRefreshBtn(),
      ]),
    ]);

    // Status-Leiste
    this._statusEl = ce('div', { className: 'email-status-bar' });
    this._renderStatus();

    // Mail-Liste
    this._listEl = ce('div', { className: 'email-list' });
    this._renderList();

    const wrapper = ce('div', {});
    wrapper.append(header, this._statusEl, this._listEl);
    this.container.append(wrapper);
    this.el = wrapper;

    // Auf globale Events hören
    window.addEventListener('nexus:email-received', this._onEmailReceived);
    window.addEventListener('nexus:email-status',   this._onEmailStatus);

    // Sofort aktuellen Stand laden
    this._fetchCurrent();

    return wrapper;
  }

  destroy() {
    window.removeEventListener('nexus:email-received', this._onEmailReceived);
    window.removeEventListener('nexus:email-status',   this._onEmailStatus);
    super.destroy();
  }

  onImport(fn)  { this._onImport  = fn; }
  onDelete(fn)  { this._onDelete  = fn; }
  onSpam(fn)    { this._onSpam    = fn; }
  onRefresh(fn) { this._onRefresh = fn; }

  // ── Private ─────────────────────────────────────────────────────────────────

  async _fetchCurrent() {
    try {
      const [eRes, hRes] = await Promise.all([
        fetch(`${EmailPoller.apiBase}/api/emails/pending`),
        fetch(`${EmailPoller.apiBase}/api/health`),
      ]);
      const emails = await eRes.json();
      const health = await hRes.json();
      this._emails    = emails;
      this._connected = health.connected;
      this._error     = health.error;
      this._renderStatus();
      this._renderList();
    } catch {
      this._connected = false;
      this._error     = 'Server nicht erreichbar. Bitte start.bat ausführen.';
      this._renderStatus();
    }
  }

  _updateList(emails) {
    this._emails = emails;
    this._renderList();
  }

  _updateStatus({ connected, error }) {
    this._connected = connected;
    this._error     = error;
    this._renderStatus();
  }

  _renderStatus() {
    if (!this._statusEl) return;
    this._statusEl.innerHTML = '';

    const dot   = this._connected ? '🟢' : '🔴';
    const label = this._connected
      ? `IMAP verbunden · ${this._emails.length} neue Mail(s) · nächster Abruf in 60 s`
      : `IMAP getrennt${this._error ? ' · ' + this._error : ''}`;

    const bar = ce('div', {
      style: {
        display:        'flex',
        alignItems:     'center',
        gap:            '0.5rem',
        padding:        'var(--space-sm) var(--space-md)',
        background:     this._connected
          ? 'rgba(16,185,129,0.08)'
          : 'rgba(239,68,68,0.08)',
        border:         `1px solid ${this._connected
          ? 'rgba(16,185,129,0.25)'
          : 'rgba(239,68,68,0.25)'}`,
        borderRadius:   'var(--radius-md)',
        fontSize:       '0.8rem',
        color:          'var(--text-dim)',
        marginBottom:   'var(--space-md)',
      },
    });
    bar.innerHTML = `<span>${dot}</span><span>${label}</span>`;
    this._statusEl.append(bar);
  }

  _renderList() {
    if (!this._listEl) return;
    this._listEl.innerHTML = '';

    if (this._emails.length === 0) {
      const empty = ce('div', {
        style: {
          textAlign:  'center',
          padding:    'var(--space-xl)',
          color:      'var(--text-dim)',
          fontSize:   '0.9rem',
        },
        textContent: this._connected
          ? '✅ Keine neuen E-Mails. Das Postfach ist leer.'
          : '⚠️ Server nicht verbunden. Bitte start.bat ausführen.',
      });
      this._listEl.append(empty);
      return;
    }

    for (const email of this._emails) {
      this._listEl.append(this._makeEmailCard(email));
    }
  }

  _makeEmailCard(email) {
    const date = email.date
      ? new Date(email.date).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })
      : '';

    // Kam die Mail über das Kontaktformular? Dann customerEmail bevorzugt anzeigen.
    const isForm      = !!email.customerEmail;
    const displayFrom = isForm ? email.customerEmail : email.from;
    const formBadge   = isForm
      ? `<span class="email-card__form-badge">📋 Kontaktformular</span>`
      : '';
    const phoneBadge  = email.customerPhone
      ? `<a class="email-card__phone" href="tel:${email.customerPhone.replace(/\s/g,'')}">📞 ${this._esc(email.customerPhone)}</a>`
      : '';

    const card = ce('div', { className: 'email-card' });
    card.innerHTML = `
      <div class="email-card__meta">
        <span class="email-card__from">✉️ ${this._esc(displayFrom)}${formBadge}</span>
        <span class="email-card__date">${date}</span>
      </div>
      ${phoneBadge ? `<div class="email-card__phone-row">${phoneBadge}</div>` : ''}
      <div class="email-card__subject">${this._esc(email.subject)}</div>
      <div class="email-card__snippet js-snippet">${this._esc(email.snippet)}</div>
    `;

    // ── Aufklappbarer Nachrichtentext ────────────────────────────────────────
    const bodyEl = ce('div', { className: 'email-card__body' });
    bodyEl.textContent = email.text || '(kein Textinhalt)';

    let expanded = false;
    const readBtn = ce('button', {
      className:   'btn btn--ghost btn--sm email-card__read-btn',
      textContent: '📖 Lesen',
      type:        'button',
    });
    readBtn.addEventListener('click', () => {
      expanded = !expanded;
      bodyEl.classList.toggle('email-card__body--open', expanded);
      card.querySelector('.js-snippet').style.display = expanded ? 'none' : '';
      readBtn.textContent = expanded ? '🔼 Schließen' : '📖 Lesen';
    });

    // ── Anhänge ─────────────────────────────────────────────────────────────
    const atts = email.attachments ?? [];
    let attEl  = null;
    if (atts.length > 0) {
      attEl = ce('div', { className: 'email-card__attachments' });
      for (const att of atts) {
        const icon = this._attIcon(att.contentType, att.filename);
        const size = att.size > 1_048_576
          ? `${(att.size / 1_048_576).toFixed(1)} MB`
          : `${Math.max(1, Math.round(att.size / 1024))} KB`;
        const link = ce('a', {
          className: 'email-card__att-link',
          href:      att.url,
          target:    '_blank',
          rel:       'noopener',
          download:  att.filename,
        });
        link.innerHTML = `${icon} <span>${this._esc(att.filename)}</span> <small>(${size})</small>`;
        attEl.append(link);
      }
    }

    // ── Antworten-Button ────────────────────────────────────────────────────
    // Zieladresse: Kunden-E-Mail aus Body bevorzugen, Fallback auf From
    const replyTo = email.customerEmail || email.fromAddr || email.from;
    const replySubject = encodeURIComponent(`AW: ${email.subject}`);
    const replyBody    = encodeURIComponent(
      `Guten Tag,\n\nvielen Dank für Ihre Anfrage.\n\n` +
      `Mit freundlichen Grüßen\nIhr Entrümpelungs Experte Team\n\n` +
      `────────────────────────\n${email.text || ''}`
    );
    const replyBtn = ce('a', {
      className: 'btn btn--reply btn--sm',
      href:      `mailto:${replyTo}?subject=${replySubject}&body=${replyBody}`,
      textContent: '↩️ Antworten',
    });

    const importBtn = ce('button', {
      className:   'btn btn--primary btn--sm',
      textContent: '📋 Als Auftrag',
      type:        'button',
    });
    importBtn.addEventListener('click', () => this._onImport?.(email.uid));

    const deleteBtn = ce('button', {
      className:   'btn btn--danger btn--sm',
      textContent: '🗑️ Löschen',
      type:        'button',
    });
    deleteBtn.addEventListener('click', () => this._onDelete?.(email.uid));

    const spamBtn = ce('button', {
      className:   'btn btn--secondary btn--sm',
      textContent: '⛔ Spam',
      type:        'button',
    });
    spamBtn.addEventListener('click', () => this._onSpam?.(email.uid, email.from));

    const actions = ce('div', { className: 'email-card__actions' });
    actions.append(replyBtn, readBtn, importBtn, deleteBtn, spamBtn);
    if (attEl) card.append(attEl);
    card.append(bodyEl, actions);

    return card;
  }


  _attIcon(contentType, filename) {
    const t = (contentType ?? '').toLowerCase();
    const f = (filename    ?? '').toLowerCase();
    if (t.includes('pdf')   || f.endsWith('.pdf'))                          return '📄';
    if (t.includes('image') || /\.(jpe?g|png|gif|webp|svg)$/.test(f))      return '🖼️';
    if (t.includes('word')  || /\.(docx?|odt)$/.test(f))                   return '📝';
    if (t.includes('sheet') || t.includes('excel') || /\.(xlsx?|ods)$/.test(f)) return '📊';
    if (t.includes('zip')   || /\.(zip|rar|7z|tar|gz)$/.test(f))           return '📦';
    return '📎';
  }


  _makeRefreshBtn() {
    const btn = ce('button', {
      className:   'btn btn--secondary',
      textContent: '🔄 Jetzt abrufen',
      type:        'button',
    });
    btn.addEventListener('click', () => {
      EmailPoller.pollNow();
      this._onRefresh?.();
    });
    return btn;
  }

  _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
