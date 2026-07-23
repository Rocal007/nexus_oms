/**
 * UserController.js — CRUD für Benutzerverwaltung.
 * Nur für Admin zugänglich.
 */
import { UserManagementView } from '../views/UserManagementView.js';
import { AuthStore }          from '../store/AuthStore.js';
import { toast }              from '../views/ToastView.js';

const API_BASE = 'http://localhost:5100';

async function apiUsers(method, path = '', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${API_BASE}/api/users${path}`, opts);
  return res.json();
}

export class UserController {
  constructor(contentEl) {
    this._contentEl = contentEl;
    this._view      = null;
  }

  async show() {
    if (!AuthStore.isAdmin()) {
      toast.show('Kein Zugriff.', 'error');
      return () => {};
    }

    let users = [];
    try { users = await apiUsers('GET'); } catch { toast.show('Benutzer konnten nicht geladen werden.', 'error'); }

    const view = new UserManagementView(this._contentEl);
    view.render(users);
    this._view = view;

    view.onSave(async (id, data) => {
      try {
        let result;
        if (id) {
          result = await apiUsers('PUT', `/${id}`, data);
        } else {
          result = await apiUsers('POST', '', data);
        }
        if (result.error) return { error: result.error };
        toast.show(id ? 'Benutzer aktualisiert.' : 'Benutzer angelegt.', 'success');
        // Neu laden
        this._reload(view);
        return { ok: true };
      } catch (err) {
        return { error: 'Server-Fehler: ' + err.message };
      }
    });

    view.onDelete(async (id) => {
      try {
        const result = await apiUsers('DELETE', `/${id}`);
        if (result.error) { toast.show(result.error, 'error'); return; }
        toast.show('Benutzer gelöscht.', 'warning');
        this._reload(view);
      } catch { toast.show('Löschen fehlgeschlagen.', 'error'); }
    });

    return () => view.destroy();
  }

  async _reload(oldView) {
    oldView.destroy();
    let users = [];
    try { users = await apiUsers('GET'); } catch { }
    const view = new UserManagementView(this._contentEl);
    view.render(users);
    this._view = view;

    view.onSave(async (id, data) => {
      try {
        const result = id
          ? await apiUsers('PUT', `/${id}`, data)
          : await apiUsers('POST', '', data);
        if (result.error) return { error: result.error };
        toast.show(id ? 'Benutzer aktualisiert.' : 'Benutzer angelegt.', 'success');
        this._reload(view);
        return { ok: true };
      } catch (err) { return { error: err.message }; }
    });

    view.onDelete(async (id) => {
      try {
        const result = await apiUsers('DELETE', `/${id}`);
        if (result.error) { toast.show(result.error, 'error'); return; }
        toast.show('Benutzer gelöscht.', 'warning');
        this._reload(view);
      } catch { toast.show('Löschen fehlgeschlagen.', 'error'); }
    });
  }
}
