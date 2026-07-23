/**
 * GovernanceController.js — Handles loading and rendering the AOD v3 Governance View.
 */

export class GovernanceController {
  /** @param {HTMLElement} contentEl */
  constructor(contentEl) {
    this._contentEl = contentEl;
  }

  /** @returns {Promise<() => void>} cleanup function */
  async show() {
    // Show a sleek loading state in case of server lag
    this._contentEl.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px; color:#94a3b8; font-family:sans-serif; gap:1rem;">
        <div class="loading-spinner" style="width:40px; height:40px; border:4px solid rgba(255,255,255,0.1); border-top-color:#0052cc; border-radius:50%; animation:spin 1s linear infinite;"></div>
        <span>Lade Governance Plattform...</span>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;

    try {
      const response = await fetch('/governance/compiled/aod.json');
      if (!response.ok) throw new Error('Governance-Datenbank konnte nicht geladen werden.');
      const data = await response.json();

      const { GovernanceView } = await import('../views/GovernanceView.js');
      const view = new GovernanceView(this._contentEl);
      view.render(data);

      return () => view.destroy();
    } catch (err) {
      console.error('[GovernanceController] Error:', err);
      this._contentEl.innerHTML = `
        <div style="padding:2.5rem; max-width:600px; margin:0 auto; font-family:sans-serif; color:#f87171; border:1px solid rgba(239, 68, 68, 0.2); background:rgba(239, 68, 68, 0.05); border-radius:12px; margin-top:3rem;">
          <h2 style="margin-top:0;">⚠️ Ladefehler</h2>
          <p>${err.message}</p>
          <button onclick="window.location.reload()" style="background:#ef4444; border:none; color:white; padding:0.5rem 1rem; border-radius:6px; font-weight:600; cursor:pointer; margin-top:1rem;">Neu laden</button>
        </div>
      `;
      return () => {};
    }
  }
}
