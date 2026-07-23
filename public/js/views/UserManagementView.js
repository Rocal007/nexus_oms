/**
 * UserManagementView.js — Admin-Benutzerverwaltung.
 * Zeigt alle Benutzer in einer Tabelle, ermöglicht Anlegen,
 * Bearbeiten (Passwort, Rolle, aktiv/inaktiv) und Löschen.
 */
import { BaseView } from './BaseView.js';
import { ce }       from '../utils/DOMHelper.js';

const ROLE_LABEL = { admin: '👑 Admin', distributor: '📦 Distributor' };

export class UserManagementView extends BaseView {
  constructor(container) {
    super(container);
    this._onSave   = null;
    this._onDelete = null;
  }

  /**
   * @param {object[]} users
   */
  render(users) {
    const wrapper = ce('div', {});

    // ── Header ──────────────────────────────────────────────
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Benutzerverwaltung' }),
        ce('div', { className: 'page-header__subtitle', textContent: `${users.length} Benutzer · MODULE::USER_MANAGER` }),
      ]),
      ce('div', { className: 'page-header__actions' }, [
        this._mkBtn('➕ Neuer Benutzer', 'btn btn--primary', () => this._openModal()),
      ]),
    ]);

    // ── Table ────────────────────────────────────────────────
    const wrap  = ce('div', { className: 'data-table-wrapper' });
    const table = ce('table', { className: 'data-table', role: 'table' });
    const thead = ce('thead', { className: 'data-table__head' });
    thead.innerHTML = `<tr>
      <th class="data-table__th">#</th>
      <th class="data-table__th">Name</th>
      <th class="data-table__th">Benutzername</th>
      <th class="data-table__th">Rolle</th>
      <th class="data-table__th">Status</th>
      <th class="data-table__th">Erstellt</th>
      <th class="data-table__th">Aktionen</th>
    </tr>`;

    const tbody = ce('tbody', {});
    if (users.length === 0) {
      const row = ce('tr', {});
      row.innerHTML = `<td colspan="7" class="data-table__td"><div class="data-table__empty"><div class="data-table__empty-icon">👥</div><div class="data-table__empty-text">Keine Benutzer vorhanden.</div></div></td>`;
      tbody.append(row);
    } else {
      users.forEach(u => tbody.append(this._buildRow(u)));
    }

    table.append(thead, tbody);
    wrap.append(table);
    wrapper.append(header, wrap);
    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _buildRow(u) {
    const row = ce('tr', { className: 'data-table__row' });
    const created = u.created_at
      ? new Date(u.created_at).toLocaleDateString('de-AT', { dateStyle: 'short' })
      : '—';

    row.innerHTML = `
      <td class="data-table__td data-table__td--mono">${u.id}</td>
      <td class="data-table__td data-table__td--primary">${this._esc(u.name)}</td>
      <td class="data-table__td data-table__td--mono">${this._esc(u.username)}</td>
      <td class="data-table__td">${ROLE_LABEL[u.role] ?? u.role}</td>
      <td class="data-table__td">
        <span class="badge badge--${u.active ? 'active' : 'inactive'}">${u.active ? 'Aktiv' : 'Inaktiv'}</span>
      </td>
      <td class="data-table__td data-table__td--mono" style="font-size:.75rem">${created}</td>
      <td class="data-table__td">
        <div class="data-table__td--actions">
          <button class="btn btn--sm btn--secondary" data-action="edit" data-id="${u.id}">✏️ Bearbeiten</button>
          ${u.username !== 'admin' ? `<button class="btn btn--sm btn--danger btn--icon" data-action="delete" data-id="${u.id}" title="Löschen">🗑️</button>` : ''}
        </div>
      </td>
    `;

    row.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === 'edit')   this._openModal(u);
      if (btn.dataset.action === 'delete') this._confirmDelete(id);
    });

    return row;
  }

  // ── Modal ────────────────────────────────────────────────

  _openModal(user = null) {
    const isEdit = !!user;
    const overlay = ce('div', { className: 'um-modal-overlay', id: 'um-modal' });
    const modal   = ce('div', { className: 'um-modal' });

    const title = ce('div', { className: 'um-modal__title', textContent: isEdit ? '✏️ Benutzer bearbeiten' : '➕ Neuer Benutzer' });
    const closeBtn = ce('button', { type: 'button', className: 'um-modal__close', textContent: '✕' });
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    const errorEl = ce('div', { className: 'login-error', style: 'display:none' });

    const inp = (type, name, placeholder, value = '') => ce('input', {
      type, name, placeholder, className: 'form-input', value,
    });

    const field = (label, input) => {
      const g = ce('div', { className: 'form-group' });
      g.append(ce('label', { className: 'form-label', textContent: label }), input);
      return g;
    };

    const nameInp     = inp('text',     'name',     'Anzeigename',    user?.name     ?? '');
    const usernameInp = inp('text',     'username', 'Benutzername',   user?.username ?? '');
    const passwordInp = inp('password', 'password', isEdit ? 'Neues Passwort (leer = unverändert)' : 'Passwort');

    const roleSel = ce('select', { className: 'form-select', name: 'role' });
    [['admin', '👑 Admin'], ['distributor', '📦 Distributor']].forEach(([val, lbl]) => {
      const opt = ce('option', { value: val, textContent: lbl });
      if ((user?.role ?? 'distributor') === val) opt.selected = true;
      roleSel.append(opt);
    });

    const form = ce('div', { className: 'um-modal__form' });
    form.append(
      field('Anzeigename', nameInp),
      field('Benutzername', usernameInp),
      field(isEdit ? 'Passwort (leer = unverändert)' : 'Passwort', passwordInp),
      field('Rolle', roleSel),
      errorEl,
    );

    if (isEdit) {
      const activeCheck = ce('input', { type: 'checkbox', id: 'um-active', name: 'active', checked: user.active });
      const activeLabel = ce('label', { htmlFor: 'um-active', className: 'form-label', style: 'display:flex;align-items:center;gap:.5rem;cursor:pointer', textContent: ' Konto aktiv' });
      activeLabel.prepend(activeCheck);
      form.append(activeLabel);
    }

    const bar = ce('div', { className: 'um-modal__actions' });
    const saveBtn = ce('button', { type: 'button', className: 'btn btn--primary', textContent: '💾 Speichern' });
    const cancelBtn = ce('button', { type: 'button', className: 'btn btn--secondary', textContent: 'Abbrechen' });
    cancelBtn.addEventListener('click', () => overlay.remove());

    saveBtn.addEventListener('click', async () => {
      const data = {
        name:     nameInp.value.trim(),
        username: usernameInp.value.trim(),
        password: passwordInp.value,
        role:     roleSel.value,
      };
      if (isEdit) {
        const activeCheck = form.querySelector('#um-active');
        if (activeCheck) data.active = activeCheck.checked;
        if (!data.password) delete data.password; // kein PW-Update
      }

      if (!data.name || !data.username || (!isEdit && !data.password)) {
        errorEl.textContent   = 'Bitte alle Pflichtfelder ausfüllen.';
        errorEl.style.display = '';
        return;
      }

      saveBtn.disabled    = true;
      saveBtn.textContent = 'Speichern …';
      errorEl.style.display = 'none';

      const result = await this._onSave?.(isEdit ? user.id : null, data);
      if (result?.error) {
        errorEl.textContent   = result.error;
        errorEl.style.display = '';
        saveBtn.disabled      = false;
        saveBtn.textContent   = '💾 Speichern';
      } else {
        overlay.remove();
      }
    });

    bar.append(saveBtn, cancelBtn);
    modal.append(title, closeBtn, form, bar);
    overlay.append(modal);
    document.body.append(overlay);
    setTimeout(() => nameInp.focus(), 50);
  }

  _confirmDelete(id) {
    if (!confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    this._onDelete?.(id);
  }

  // ── Callbacks ────────────────────────────────────────────
  onSave(fn)   { this._onSave   = fn; }
  onDelete(fn) { this._onDelete = fn; }

  // ── Helpers ──────────────────────────────────────────────
  _mkBtn(label, cls, fn) {
    const btn = ce('button', { className: cls, type: 'button', textContent: label });
    btn.addEventListener('click', fn);
    return btn;
  }
  _esc(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
