/**
 * AppController.js — Root application orchestrator.
 * Wires navigation, router, sub-controllers, and Auth guard.
 * Shows LoginView if not authenticated. Guards admin-only routes.
 */
import { NavigationView }        from '../views/NavigationView.js';
import { HomeDashboardView }     from '../views/HomeDashboardView.js';
import { LoginView }             from '../views/LoginView.js';
import { RouterController }      from './RouterController.js';
import { DistributorController } from './DistributorController.js';
import { OrderController }       from './OrderController.js';
import { SettingsController }    from './SettingsController.js';
import { UserController }        from './UserController.js';
import { BrancheController }     from './BrancheController.js';
import { GovernanceController }  from './GovernanceController.js';
import { OrderModel }            from '../models/OrderModel.js';
import { DistributorModel }      from '../models/DistributorModel.js';
import { BrancheModel }          from '../models/BrancheModel.js';
import { createParticleSystem }  from '../utils/AnimationHelper.js';
import { EmailPoller }           from '../store/EmailPoller.js';
import { AuthStore }             from '../store/AuthStore.js';
import { toast }                 from '../views/ToastView.js';

export class AppController {
  constructor() {
    this._navEl     = document.getElementById('app-nav');
    this._contentEl = document.getElementById('app-content');

    if (!this._navEl || !this._contentEl) {
      throw new Error('AppController: #app-nav oder #app-content nicht im DOM gefunden.');
    }

    this._navView    = null;
    this._router     = null;
    this._particlePs = null;
    this._loginView  = null;

    // Reagiert auf Login/Logout
    this._onAuthChanged = this._handleAuthChange.bind(this);
    window.addEventListener('nexus:auth-changed', this._onAuthChanged);
  }

  init() {
    this._initBackground();
    this._initNavigation();

    if (AuthStore.isLoggedIn()) {
      this._initApp();
    } else {
      this._showLogin();
    }
  }

  // ── Auth ────────────────────────────────────────────────────

  _showLogin() {
    this._loginView = new LoginView();
    this._loginView.render();
  }

  _handleAuthChange() {
    if (AuthStore.isLoggedIn()) {
      this._loginView = null;
      this._initApp();
    } else {
      // Logout: Router stoppen, Content leeren, Login zeigen
      this._router?.unbind();
      this._router = null;
      EmailPoller.stop();
      while (this._contentEl.firstChild) this._contentEl.removeChild(this._contentEl.firstChild);
      this._showLogin();
    }
  }

  // ── Private ─────────────────────────────────────────────────

  _initBackground() {
    const layer = document.querySelector('.particles-layer');
    if (layer) this._particlePs = createParticleSystem(layer);
  }

  _initNavigation() {
    this._navView = new NavigationView(this._navEl);
    this._navView.render();
  }

  _initApp() {
    EmailPoller.start();
    window.addEventListener('nexus:email-received', (e) => {
      const { count } = e.detail;
      if (count > 0) {
        toast.show(`📩 ${count} neue E-Mail${count === 1 ? '' : 's'} im Posteingang.`, 'info');
      }
    });
    this._initRouter();
  }

  _initRouter() {
    // Router neu erstellen (z.B. nach erneutem Login)
    if (this._router) this._router.unbind();

    const router       = new RouterController(this._contentEl);
    this._router       = router;
    const distCtrl     = new DistributorController(this._contentEl, router);
    const orderCtrl    = new OrderController(this._contentEl, router);
    const settingsCtrl = new SettingsController(this._contentEl);
    const userCtrl     = new UserController(this._contentEl);
    const brancheCtrl  = new BrancheController(this._contentEl, router);
    const govCtrl      = new GovernanceController(this._contentEl);

    // ── Route-Guard Helper ───────────────────────────────────
    const adminOnly = (handler) => (params) => {
      if (!AuthStore.isAdmin()) {
        toast.show('Kein Zugriff — nur für Administratoren.', 'error');
        router.navigate('/orders');
        return () => {};
      }
      return handler(params);
    };

    router
      // ── Home ────────────────────────────────────────────
      .register('/', adminOnly(() => {
        const view = new HomeDashboardView(this._contentEl);
        view.render({
          orders:       OrderModel.getAll().length,
          distributors: DistributorModel.getAll().length,
          branchen:     BrancheModel.getAll().length,
        });
        view.onNavigate(route => router.navigate(route));
        return () => view.destroy();
      }))

      // ── Distributoren (Admin only) ───────────────────────
      .register('/distributors',          adminOnly(() => distCtrl.showList()))
      .register('/distributors/new',      adminOnly(() => distCtrl.showNewForm()))
      .register('/distributors/:id/edit', adminOnly(({ id } = {}) => distCtrl.showEditForm(Number(id))))

      // ── Aufträge ─────────────────────────────────────────
      .register('/orders',       () => orderCtrl.showList())
      .register('/orders/new',   adminOnly(() => orderCtrl.showForm()))
      .register('/orders/inbox', adminOnly(() => orderCtrl.showInbox()))

      // ── Branchen ─────────────────────────────────────────────
      .register('/branche',              adminOnly(() => brancheCtrl.showList()))
      .register('/branche/new',          adminOnly(() => brancheCtrl.showNewForm()))
      .register('/branche/:id',          adminOnly(({id}) => brancheCtrl.showDetail(id)))
      .register('/branche/:id/edit',     adminOnly(({id}) => brancheCtrl.showEditForm(id)))
      .register('/branche/:id/orders/new', adminOnly(({id}) => orderCtrl.showForm(id)))

      // ── Benutzerverwaltung (Admin only) ──────────────────
      .register('/users', adminOnly(() => userCtrl.show()))

      // ── Einstellungen (Admin only) ───────────────────────
      .register('/settings', adminOnly(() => settingsCtrl.show()))

      // ── Governance (Admin only) ──────────────────────────
      .register('/governance', adminOnly(() => {
        let activeCleanup = null;
        govCtrl.show().then(cleanup => {
          activeCleanup = cleanup;
        });
        return () => {
          if (activeCleanup) activeCleanup();
        };
      }));

    // Distributor startet immer auf /orders
    const startRoute = AuthStore.isAdmin() ? null : '/orders';
    if (startRoute && (window.location.hash === '' || window.location.hash === '#/')) {
      router.navigate(startRoute);
    }

    router.bind();
  }

  destroy() {
    window.removeEventListener('nexus:auth-changed', this._onAuthChanged);
    this._router?.unbind();
    this._navView?.destroy();
    this._particlePs?.destroy();
  }
}
