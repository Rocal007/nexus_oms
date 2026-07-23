/**
 * AuthStore.js — Verwaltet Login-Session im localStorage.
 * Kommuniziert mit /api/auth/login (POST) auf dem lokalen Server.
 * Emittiert 'nexus:auth-changed' bei Login/Logout.
 */

const SESSION_KEY = 'nexus_oms__auth_session';
const API_BASE    = 'http://localhost:5100';

function _emit() {
  window.dispatchEvent(new CustomEvent('nexus:auth-changed', {
    detail: { user: AuthStore.getCurrentUser() },
  }));
}

export const AuthStore = Object.freeze({
  /**
   * Sendet Login-Request an den Server.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ok:boolean, user?:object, error?:string}>}
   */
  async login(username, password) {
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error };

      localStorage.setItem(SESSION_KEY, JSON.stringify({
        user:  data.user,
        token: data.token,
        ts:    Date.now(),
      }));
      _emit();
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: 'Server nicht erreichbar.' };
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    _emit();
  },

  /** @returns {{ user: object, token: string, ts: number } | null} */
  _getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  isLoggedIn() {
    return !!this._getSession();
  },

  /** @returns {{ id, username, name, role, active } | null} */
  getCurrentUser() {
    return this._getSession()?.user ?? null;
  },

  isAdmin() {
    return this.getCurrentUser()?.role === 'admin';
  },

  isDistributor() {
    return this.getCurrentUser()?.role === 'distributor';
  },

  getToken() {
    return this._getSession()?.token ?? null;
  },
});
