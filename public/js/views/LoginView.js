/**
 * LoginView.js — Vollbild-Login-Screen.
 * Zeigt sich über dem app-shell. Bei Erfolg wird die View zerstört
 * und das 'nexus:auth-changed' Event informiert AppController.
 */
import { BaseView }  from './BaseView.js';
import { ce }        from '../utils/DOMHelper.js';
import { AuthStore } from '../store/AuthStore.js';

export class LoginView extends BaseView {
  constructor() {
    // Hängt direkt am body
    super(document.body);
    this._el = null;
  }

  render() {
    const overlay = ce('div', { className: 'login-overlay', id: 'login-overlay' });

    const card = ce('div', { className: 'login-card' });

    // Brand
    card.append(
      ce('div', { className: 'login-brand' }, [
        ce('div', { className: 'login-brand__logo', textContent: 'NEXUS' }),
        ce('div', { className: 'login-brand__sub',  textContent: 'Order Management System' }),
      ]),
    );

    // Error area
    const errorEl = ce('div', { className: 'login-error', style: 'display:none' });

    // Form
    const form = ce('form', { className: 'login-form', id: 'login-form', noValidate: true });

    const usernameInput = ce('input', {
      type:        'text',
      id:          'login-username',
      className:   'login-input',
      placeholder: 'Benutzername',
      autocomplete:'username',
      required:    true,
    });

    const passwordInput = ce('input', {
      type:        'password',
      id:          'login-password',
      className:   'login-input',
      placeholder: 'Passwort',
      autocomplete:'current-password',
      required:    true,
    });

    const submitBtn = ce('button', {
      type:      'submit',
      className: 'login-btn',
      id:        'login-submit',
      textContent: 'Anmelden',
    });

    const hint = ce('div', { className: 'login-hint', innerHTML: 'Standard: <code>admin</code> / <code>admin123</code>' });

    form.append(
      ce('div', { className: 'login-field' }, [
        ce('label', { htmlFor: 'login-username', className: 'login-label', textContent: 'Benutzername' }),
        usernameInput,
      ]),
      ce('div', { className: 'login-field' }, [
        ce('label', { htmlFor: 'login-password', className: 'login-label', textContent: 'Passwort' }),
        passwordInput,
      ]),
      errorEl,
      submitBtn,
      hint,
    );

    card.append(form);
    overlay.append(card);
    document.body.append(overlay);
    document.body.style.overflow = 'hidden';
    this._el = overlay;

    // Focus
    setTimeout(() => usernameInput.focus(), 50);

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      if (!username || !password) return;

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Anmelden …';
      errorEl.style.display = 'none';

      const result = await AuthStore.login(username, password);

      if (result.ok) {
        overlay.classList.add('login-overlay--fade-out');
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 350);
      } else {
        errorEl.textContent   = result.error ?? 'Anmeldung fehlgeschlagen.';
        errorEl.style.display = '';
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Anmelden';
        passwordInput.value   = '';
        passwordInput.focus();
        card.classList.add('login-card--shake');
        setTimeout(() => card.classList.remove('login-card--shake'), 500);
      }
    });

    return overlay;
  }

  destroy() {
    this._el?.remove();
    document.body.style.overflow = '';
  }
}
