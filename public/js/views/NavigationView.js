/**
 * NavigationView.js — Left sidebar with nav items and brand.
 * Rollenbasiert: Admin sieht alle Punkte + Benutzerverwaltung.
 * Distributor sieht nur Auftragsübersicht + eigenes Profil.
 * Zeigt User-Avatar + Logout im Footer.
 */
import { BaseView }  from './BaseView.js';
import { ce }        from '../utils/DOMHelper.js';
import { AuthStore } from '../store/AuthStore.js';

/**
 * @param {'admin'|'distributor'|null} role
 * @returns {Array}
 */
function getNavItems(role) {
  const admin = role === 'admin';
  const items = [];

  if (admin) {
    items.push({ icon: '📊', label: 'Dashboard', route: '#/' });
    items.push({ icon: '🏷️', label: 'Branchen', route: '#/branche' });
    items.push({ icon: '🏭', label: 'Distributoren', route: '#/distributors' });
    items.push({ icon: '🏛️', label: 'Governance', route: '#/governance' });
  }

  items.push({
    icon: '📋', label: 'Aufträge', route: '#/orders',
    children: [
      ...(admin ? [{ icon: '✏️', label: 'Auftrag erfassen',  route: '#/orders/new' }] : []),
      { icon: '📑', label: 'Auftragsübersicht', route: '#/orders' },
      ...(admin ? [{ icon: '📬', label: 'Posteingang',       route: '#/orders/inbox', id: 'nav-inbox' }] : []),
    ],
  });

  if (admin) {
    items.push({ icon: '👥', label: 'Benutzer', route: '#/users' });
    items.push({ icon: '⚙️', label: 'Einstellungen', route: '#/settings' });
  }

  return items;
}

export class NavigationView extends BaseView {
  constructor(container) {
    super(container);
    this._itemEls         = new Map();
    this._badgeEl         = null;
    this._onHashChange    = this._syncActive.bind(this);
    this._onEmailReceived = (e) => this._updateBadge(e.detail.count);
    this._onAuthChanged   = () => this._rebuildNav();
  }

  render() {
    this._buildNav();

    window.addEventListener('hashchange',           this._onHashChange);
    window.addEventListener('nexus:email-received', this._onEmailReceived);
    window.addEventListener('nexus:auth-changed',   this._onAuthChanged);
    this._syncActive();
    return this.container;
  }

  _buildNav() {
    // Clear container
    while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
    this._itemEls.clear();
    this._badgeEl = null;

    const user = AuthStore.getCurrentUser();
    const role = user?.role ?? null;

    // ── Brand ────────────────────────────────────────────────
    const brand = ce('div', { className: 'nav-brand' }, [
      ce('div', { className: 'nav-brand__logo',     textContent: 'NEXUS-OMS' }),
      ce('div', { className: 'nav-brand__subtitle', textContent: 'Order Management' }),
    ]);

    // ── Menu ─────────────────────────────────────────────────
    const menu = ce('ul', { className: 'nav-menu', role: 'list' });
    const navItems = getNavItems(role);

    navItems.forEach(item => {
      if (item.children) {
        const groupLi  = ce('li', { className: 'nav-group' });
        const groupBtn = ce('button', { type: 'button', className: 'nav-item nav-group__toggle' }, [
          ce('span', { className: 'nav-item__icon',   textContent: item.icon  }),
          ce('span', { className: 'nav-item__label',  textContent: item.label }),
          ce('span', { className: 'nav-group__arrow', textContent: '›' }),
        ]);
        const subMenu = ce('ul', { className: 'nav-submenu' });

        item.children.forEach(({ icon, label, route, id }) => {
          const children = [
            ce('span', { className: 'nav-item__icon nav-item__icon--sub', textContent: icon }),
            ce('span', { className: 'nav-item__label', textContent: label }),
          ];
          if (id === 'nav-inbox') {
            this._badgeEl = ce('span', { className: 'nav-badge', style: { display: 'none' } });
            children.push(this._badgeEl);
          }
          const link = ce('a', {
            className: 'nav-item nav-item--sub',
            href:      route,
            role:      'listitem',
            ...(id ? { id } : {}),
          }, children);
          this._itemEls.set(route, link);
          const li = ce('li', {});
          li.append(link);
          subMenu.append(li);
        });

        groupBtn.addEventListener('click', () => {
          const isOpen = groupLi.classList.toggle('nav-group--open');
          groupBtn.classList.toggle('nav-group__toggle--open', isOpen);
        });
        this._itemEls.set(item.route + '__group', groupBtn);
        groupLi.append(groupBtn, subMenu);
        menu.append(groupLi);
      } else {
        const link = ce('a', {
          className: 'nav-item',
          href:      item.route,
          role:      'listitem',
        }, [
          ce('span', { className: 'nav-item__icon',  textContent: item.icon  }),
          ce('span', { className: 'nav-item__label', textContent: item.label }),
        ]);
        this._itemEls.set(item.route, link);
        menu.append(link);
      }
    });

    // ── Footer ───────────────────────────────────────────────
    const footer = ce('div', { className: 'nav-footer' });

    if (user) {
      // Avatar initials
      const initials = (user.name || user.username)
        .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

      const userBlock = ce('div', { className: 'nav-user' }, [
        ce('div', { className: 'nav-user__avatar', textContent: initials }),
        ce('div', { className: 'nav-user__info' }, [
          ce('div', { className: 'nav-user__name', textContent: user.name || user.username }),
          ce('div', { className: `nav-user__role nav-user__role--${user.role}`,
            textContent: user.role === 'admin' ? '👑 Admin' : '📦 Distributor' }),
        ]),
      ]);

      const logoutBtn = ce('button', {
        type:      'button',
        className: 'nav-logout-btn',
        id:        'nav-logout-btn',
      });
      logoutBtn.innerHTML = '🚪 <span>Abmelden</span>';
      logoutBtn.addEventListener('click', () => {
        AuthStore.logout();
        // AppController reagiert via nexus:auth-changed
      });

      footer.append(userBlock, logoutBtn);
    } else {
      footer.append(
        ce('div', { className: 'nav-footer__version', textContent: 'v1.0.0' }),
        ce('div', { className: 'nav-footer__status' }, [
          ce('span', { className: 'nav-footer__dot' }),
          'System Online',
        ]),
      );
    }

    this.container.append(brand, menu, footer);
    this.el = this.container;
    this._syncActive();
  }

  _rebuildNav() {
    this._buildNav();
  }

  _updateBadge(count) {
    if (!this._badgeEl) return;
    if (count > 0) {
      this._badgeEl.textContent   = count > 99 ? '99+' : String(count);
      this._badgeEl.style.display = '';
    } else {
      this._badgeEl.style.display = 'none';
    }
  }

  _syncActive() {
    const current = window.location.hash || '#/';
    this._itemEls.forEach((el, route) => {
      if (route.endsWith('__group')) {
        const groupRoute  = route.replace('__group', '');
        const isGroupActive = current === groupRoute || current.startsWith(groupRoute + '/');
        el.classList.toggle('nav-item--active', isGroupActive);
        const groupLi = el.closest('.nav-group');
        if (groupLi && isGroupActive) {
          groupLi.classList.add('nav-group--open');
          el.classList.add('nav-group__toggle--open');
        }
        return;
      }
      const isExactOnly = route === '#/' || route === '#/orders/inbox' || route === '#/orders/new';
      const isActive = current === route || (!isExactOnly && current.startsWith(route + '/'));
      el.classList.toggle('nav-item--active', isActive);
    });
  }

  destroy() {
    window.removeEventListener('hashchange',           this._onHashChange);
    window.removeEventListener('nexus:email-received', this._onEmailReceived);
    window.removeEventListener('nexus:auth-changed',   this._onAuthChanged);
    this._itemEls.clear();
  }
}
