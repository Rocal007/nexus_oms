// NEXUS LUDUS Protocol & Bot-Immunity Engine (Section X of .cursorrules)

/**
 * LUDUS Industry Risk Profiles
 * T_Control: High-Anxiety / High-Stakes (Recht, Medizin, Notdienst) -> Focus on Relief & Agency
 * T_Config: Pragmatic / Goal-Oriented (Handwerk, Entrümpelung, Immobilien, Solar, B2B) -> Focus on Configuration & Logic
 * T_Reward: Desire-Driven (E-Commerce, Lifestyle, Travel) -> Focus on Emotion & Micro-Rewards
 */

export function recordLudusInteraction(interactionType) {
  window._ludusTelemetry = window._ludusTelemetry || {
    hasPhysicalInteraction: false,
    interactionCount: 0,
    lastInteractionType: null,
    botImmunityVerified: false
  };
  
  window._ludusTelemetry.hasPhysicalInteraction = true;
  window._ludusTelemetry.interactionCount++;
  window._ludusTelemetry.lastInteractionType = interactionType;
  if (window._ludusTelemetry.interactionCount >= 1) {
    window._ludusTelemetry.botImmunityVerified = true;
  }
  
  window.dispatchEvent(new CustomEvent('ludus-telemetry-update', { detail: window._ludusTelemetry }));
}

export function getLudusTelemetryState() {
  return window._ludusTelemetry || {
    hasPhysicalInteraction: false,
    interactionCount: 0,
    lastInteractionType: null,
    botImmunityVerified: false
  };
}

/**
 * Classify Industry into Ludus Trigger Profile
 */
export function getLudusProfileForBranch(branchName) {
  const branch = (branchName || '').toLowerCase();
  
  if (branch.includes('recht') || branch.includes('medizin') || branch.includes('notdienst') || branch.includes('security')) {
    return 'T_Control';
  }
  if (branch.includes('entrümpelung') || branch.includes('handwerk') || branch.includes('umzug') || branch.includes('solar') || branch.includes('immobilien') || branch.includes('cloud')) {
    return 'T_Config';
  }
  return 'T_Reward';
}

/**
 * Render LUDUS Dynamic Widget container depending on selected branch
 */
export function renderLudusWidget(containerId, branchName, onUpdate) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const profile = getLudusProfileForBranch(branchName);
  
  if (profile === 'T_Config') {
    // Render Volume & Cost Calculator Slider (Configuration Game)
    container.innerHTML = `
      <div class="ludus-widget ludus-config" style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 0.9rem; color: var(--color-primary-light);">
            ⚡ LUDUS Kalkulator (T_Config): Volumen & Kostenschätzung
          </span>
          <span class="ludus-badge" id="ludus-bot-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #f87171;">
            🤖 Bot-Status: Inaktiv
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px;">
          Passen Sie das geschätzte Volumen (m³) an, um die Kosten und LKW-Kapazität zu berechnen.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: center;">
          <div>
            <label style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span>Volumen: <strong id="ludus-volume-val" style="color: var(--color-accent);">15 m³</strong></span>
              <span>LKW: <strong id="ludus-trucks-val">1 Transporter</strong></span>
            </label>
            <input type="range" id="ludus-slider-volume" min="5" max="100" value="15" step="5" style="width: 100%; cursor: pointer;">
          </div>
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Richtwert-Aufwand</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: #10b981;" id="ludus-cost-val">€ 450,00</div>
          </div>
        </div>
      </div>
    `;

    const slider = document.getElementById('ludus-slider-volume');
    if (slider) {
      slider.addEventListener('input', () => {
        recordLudusInteraction('slider_drag');
        const vol = parseInt(slider.value, 10);
        const cost = vol * 30;
        const trucks = Math.ceil(vol / 20);

        document.getElementById('ludus-volume-val').textContent = `${vol} m³`;
        document.getElementById('ludus-cost-val').textContent = `€ ${cost.toFixed(2)}`;
        document.getElementById('ludus-trucks-val').textContent = `${trucks} ${trucks > 1 ? 'LKWs' : 'Transporter'}`;

        const botBadge = document.getElementById('ludus-bot-badge');
        if (botBadge) {
          botBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          botBadge.style.color = '#34d399';
          botBadge.textContent = '🛡️ Mensch verifiziert';
        }

        if (onUpdate) onUpdate({ volume: vol, estimatedCost: cost });
      });
    }
  } else if (profile === 'T_Control') {
    // Render Control & De-escalation Checklist (Control Game)
    container.innerHTML = `
      <div class="ludus-widget ludus-control" style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 0.9rem; color: #60a5fa;">
            🛡️ LUDUS Agency Control (T_Control): Sicherheits & Vorbereitungs-Checkliste
          </span>
          <span class="ludus-badge" id="ludus-bot-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #f87171;">
            🤖 Bot-Status: Inaktiv
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px;">
          Wählen Sie zutreffende Sicherheitsschritte zur Agency-Rückgewinnung aus:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="doc"> Erstberatung & Sachverhalt vorbereitet
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="urgency"> Fristenwahrung erforderlich
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="gisa"> GISA / Gewerbe-Compliance geprüft
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="confidential"> Vertraulichkeitsvereinbarung erwünscht
          </label>
        </div>
      </div>
    `;

    const checkboxes = container.querySelectorAll('.ludus-check');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        recordLudusInteraction('checkbox_toggle');
        const botBadge = document.getElementById('ludus-bot-badge');
        if (botBadge) {
          botBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          botBadge.style.color = '#34d399';
          botBadge.textContent = '🛡️ Mensch verifiziert';
        }
        if (onUpdate) onUpdate({ profile: 'T_Control' });
      });
    });
  } else {
    // Render Reward Micro-Badge
    container.innerHTML = `
      <div class="ludus-widget ludus-reward" style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 12px; margin-top: 12px; text-align: center;">
        <span style="font-size: 0.85rem; color: #a7f3d0;">💎 LUDUS Reward (T_Reward): Exklusive Express-Bearbeitung freigeschaltet!</span>
      </div>
    `;
  }
}
