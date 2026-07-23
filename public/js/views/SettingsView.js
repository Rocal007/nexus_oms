/**
 * SettingsView.js — System configuration form.
 * Callbacks: onSave(data).
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

export class SettingsView extends BaseView {
  /**
   * @param {HTMLElement} container
   * @param {import('../models/SettingsModel.js').Settings} settings
   */
  constructor(container, settings) {
    super(container);
    this._settings = settings;
    this._onSave   = null;
  }

  render() {
    const s = this._settings;

    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Einstellungen' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'MODULE::SETTINGS_CONFIG' }),
      ]),
    ]);

    const form = ce('form', { className: 'form-card', novalidate: '' });

    /* ── E-Mail-Adresse ─────────────────────────────────── */
    form.append(ce('div', { className: 'form-section-title', textContent: 'E-Mail-Eingang' }));
    form.append(
      ce('div', { className: 'form-group' }, [
        ce('label', { className: 'form-label form-label--required', textContent: 'Eingangs-E-Mail-Adresse' }),
        ce('input', {
          className:   'form-input',
          type:        'email',
          name:        'inbound_email',
          value:       s.inbound_email,
          placeholder: 'auftraege@meinefirma.at',
          required:    '',
        }),
        ce('span', { className: 'form-hint', textContent: 'Auf dieser Adresse gehen neue Auftragsanfragen per E-Mail ein. Wird auch als Absender für ausgehende Distributor-Anfragen verwendet.' }),
      ]),
    );

    /* ── IMAP ───────────────────────────────────────────── */
    form.append(ce('div', { className: 'form-section-title', textContent: 'Posteingang – IMAP (SSL/TLS · Port 993)' }));
    form.append(
      ce('div', { className: 'form-row' }, [
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label form-label--required', textContent: 'Posteingangsserver (Host)' }),
          ce('input', {
            className:   'form-input',
            type:        'text',
            name:        'imap_host',
            value:       s.imap_host,
            placeholder: 'imap.meinefirma.at',
          }),
        ]),
        ce('div', { className: 'form-group', style: { maxWidth: '120px' } }, [
          ce('label', { className: 'form-label', textContent: 'Port' }),
          ce('input', {
            className:   'form-input',
            type:        'number',
            name:        'imap_port',
            value:       s.imap_port,
            placeholder: '993',
            min:         '1',
            max:         '65535',
          }),
        ]),
      ]),
    );
    form.append(
      ce('div', { className: 'form-row' }, [
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label', textContent: 'Benutzername' }),
          ce('input', {
            className:   'form-input',
            type:        'text',
            name:        'imap_user',
            value:       s.imap_user,
            placeholder: 'auftraege@meinefirma.at',
            autocomplete: 'username',
          }),
        ]),
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label', textContent: 'Passwort' }),
          ce('input', {
            className:   'form-input',
            type:        'password',
            name:        'imap_password',
            value:       s.imap_password,
            placeholder: '••••••••',
            autocomplete: 'current-password',
          }),
        ]),
      ]),
    );
    form.append(this._sslToggle('imap_ssl', s.imap_ssl, 'SSL/TLS für IMAP'));

    /* ── POP3 (alternativ, read-only Info) ─────────────── */
    form.append(ce('div', { className: 'form-section-title', textContent: 'Posteingang – POP3 (alternativ · SSL/TLS · Port 995)' }));
    const pop3Card = ce('div', { style: { background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' } });
    pop3Card.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.45rem;">
        <div style="display:flex;justify-content:space-between;font-size:.78rem;">
          <span style="color:var(--text-dim);">Host</span>
          <span style="font-family:var(--font-mono);color:var(--accent-cyan);">${s.pop3_host}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem;">
          <span style="color:var(--text-dim);">Port</span>
          <span style="font-family:var(--font-mono);color:var(--accent-cyan);">${s.pop3_port} · SSL/TLS</span>
        </div>
        <div style="font-size:.75rem;color:var(--text-dim);margin-top:.25rem;">POP3 lädt E-Mails herunter und entfernt sie vom Server. IMAP ist für die Nutzung mit mehreren Geräten empfohlen.</div>
      </div>
    `;
    form.append(pop3Card);

    /* ── SMTP ───────────────────────────────────────────── */
    form.append(ce('div', { className: 'form-section-title', textContent: 'Postausgang – SMTP (STARTTLS · Port 587)' }));
    form.append(
      ce('div', { className: 'form-row' }, [
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label form-label--required', textContent: 'Postausgangsserver (Host)' }),
          ce('input', {
            className:   'form-input',
            type:        'text',
            name:        'smtp_host',
            value:       s.smtp_host,
            placeholder: 'smtp.meinefirma.at',
          }),
        ]),
        ce('div', { className: 'form-group', style: { maxWidth: '120px' } }, [
          ce('label', { className: 'form-label', textContent: 'Port' }),
          ce('input', {
            className:   'form-input',
            type:        'number',
            name:        'smtp_port',
            value:       s.smtp_port,
            placeholder: '587',
            min:         '1',
            max:         '65535',
          }),
        ]),
      ]),
    );
    form.append(
      ce('div', { className: 'form-row' }, [
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label', textContent: 'Benutzername' }),
          ce('input', {
            className:   'form-input',
            type:        'text',
            name:        'smtp_user',
            value:       s.smtp_user,
            placeholder: 'auftraege@meinefirma.at',
            autocomplete: 'username',
          }),
        ]),
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label', textContent: 'Passwort' }),
          ce('input', {
            className:   'form-input',
            type:        'password',
            name:        'smtp_password',
            value:       s.smtp_password,
            placeholder: '••••••••',
            autocomplete: 'current-password',
          }),
        ]),
      ]),
    );
    form.append(this._sslToggle('smtp_ssl', s.smtp_ssl, 'STARTTLS aktivieren (empfohlen für Port 587)'));

    /* ── Admin-Daten ────────────────────────────────────── */
    form.append(ce('div', { className: 'form-section-title', textContent: 'Admin-Konfiguration' }));
    form.append(
      ce('div', { className: 'form-row' }, [
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label', textContent: 'Admin-Name' }),
          ce('input', { className: 'form-input', type: 'text', name: 'admin_name', value: s.admin_name, placeholder: 'Ihr Name' }),
        ]),
        ce('div', { className: 'form-group' }, [
          ce('label', { className: 'form-label', textContent: 'Standard-Region' }),
          ce('input', { className: 'form-input', type: 'text', name: 'default_region', value: s.default_region, placeholder: 'z. B. Wien' }),
        ]),
      ]),
    );

    /* ── Systemstatus ───────────────────────────────────── */
    form.append(ce('div', { className: 'form-section-title', textContent: 'Systemstatus' }));
    const infoCard = ce('div', { style: { background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' } });
    infoCard.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.5rem;">
        <div style="display:flex;justify-content:space-between;font-size:.78rem;">
          <span style="color:var(--text-dim);">Version</span>
          <span style="font-family:var(--font-mono);color:var(--accent-cyan);">v1.0.0</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem;">
          <span style="color:var(--text-dim);">Datenspeicherung</span>
          <span style="font-family:var(--font-mono);color:var(--accent-green);">localStorage · lokal</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem;">
          <span style="color:var(--text-dim);">E-Mail-Dispatch</span>
          <span style="font-family:var(--font-mono);color:var(--accent-teal);">SMTP (konfigurierbar)</span>
        </div>
      </div>
    `;
    form.append(infoCard);

    /* ── Speichern ──────────────────────────────────────── */
    const actions = ce('div', { className: 'form-actions' }, [
      this._btn('💾 Einstellungen speichern', 'btn btn--primary', () => this._submit(form)),
    ]);
    form.append(actions);

    form.addEventListener('submit', e => { e.preventDefault(); this._submit(form); });

    const wrapper = ce('div', {});
    wrapper.append(header, form);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  /* ── Hilfsmethoden ──────────────────────────────────── */

  /**
   * Erzeugt eine Toggle-Zeile für SSL/TLS.
   * @param {string}  name
   * @param {boolean} checked
   * @param {string}  label
   */
  _sslToggle(name, checked, label) {
    const id  = `toggle-${name}`;
    const row = ce('div', { className: 'form-group', style: { flexDirection: 'row', alignItems: 'center', gap: 'var(--space-sm)' } });

    const input = ce('input', {
      id,
      type:    'checkbox',
      name,
      style:   { accentColor: 'var(--accent-cyan)', width: '1rem', height: '1rem', cursor: 'pointer' },
    });
    if (checked) input.checked = true;

    const lbl = ce('label', { htmlFor: id, className: 'form-label', style: { margin: '0', cursor: 'pointer' }, textContent: label });
    row.append(input, lbl);
    return row;
  }

  _submit(form) {
    const v = n => form.querySelector(`[name="${n}"]`)?.value?.trim() ?? '';
    const b = n => form.querySelector(`[name="${n}"]`)?.checked ?? false;

    const email = v('inbound_email');
    if (!email) { form.querySelector('[name="inbound_email"]').focus(); return; }

    this._onSave?.({
      inbound_email:  email,
      admin_name:     v('admin_name'),
      default_region: v('default_region'),
      imap_host:      v('imap_host'),
      imap_port:      v('imap_port')      || '993',
      imap_user:      v('imap_user'),
      imap_password:  v('imap_password'),
      imap_ssl:       b('imap_ssl'),
      smtp_host:      v('smtp_host'),
      smtp_port:      v('smtp_port')      || '587',
      smtp_user:      v('smtp_user'),
      smtp_password:  v('smtp_password'),
      smtp_ssl:       b('smtp_ssl'),
      // POP3 wird nur aus den Defaults/gespeicherten Werten bezogen (kein Edit-Formular).
      pop3_host:      this._settings.pop3_host,
      pop3_port:      this._settings.pop3_port,
      pop3_ssl:       this._settings.pop3_ssl,
    });
  }

  _btn(label, cls, fn) {
    const btn = ce('button', { className: cls, type: 'button', textContent: label });
    btn.addEventListener('click', fn);
    return btn;
  }

  onSave(fn) { this._onSave = fn; }
}
