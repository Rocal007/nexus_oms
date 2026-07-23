// NEXUS FACTORIUM Engine (Section XI of .cursorrules)
// Pipeline: Data-Load -> Geo-Scan -> Delta-Compute -> Intent-Match -> Trend-Injection -> Task-Split -> Worker-Dispatch -> Result-Collect -> SSG

const MOCK_WORKERS = [
  { id: "WRK-01", name: "Worker Alpha (Vienna SSG)", maxCapacity: 5, activeTasks: 1, rpmQuota: 60, status: 'idle' },
  { id: "WRK-02", name: "Worker Beta (Graz Geo-Scan)", maxCapacity: 4, activeTasks: 0, rpmQuota: 45, status: 'idle' },
  { id: "WRK-03", name: "Worker Gamma (Linz Compliance)", maxCapacity: 6, activeTasks: 2, rpmQuota: 90, status: 'busy' }
];

/**
 * Simple string hash function for Delta-Compute
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Delta Inference Logic (Section 27 of .cursorrules)
 */
export function computeDelta(contentIst, contentSoll, lastBuildDate = new Date()) {
  const hashIst = simpleHash(contentIst || '');
  const hashSoll = simpleHash(contentSoll || '');
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastBuildDate.getTime());
  const stalenessDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const hasHashChanged = hashIst !== hashSoll;
  const isStale = stalenessDays > 90;

  const hasChanged = hasHashChanged || isStale;
  let reason = "Inhalt ist synchron und aktuell (Delta = 0)";

  if (hasHashChanged) {
    reason = `Soll-Ist Hash-Abweichung erkannt (${hashIst} vs ${hashSoll})`;
  } else if (isStale) {
    reason = `Staleness-Trigger ausgelöst (> 90 Tage seit letztem Build: ${stalenessDays} Tage)`;
  }

  return {
    hasChanged,
    deltaScore: hasChanged ? 1.0 : 0.0,
    reason,
    stalenessDays,
    hashIst,
    hashSoll
  };
}

/**
 * Adaptive Worker Selection (Section 28 of .cursorrules)
 * S_w = C_max(w) - A_active(w)
 */
export function getOptimalWorker() {
  let optimal = null;
  let maxScore = -1;

  for (const w of MOCK_WORKERS) {
    const score = w.maxCapacity - w.activeTasks;
    if (score >= 1 && score > maxScore) {
      maxScore = score;
      optimal = w;
    }
  }
  return optimal;
}

/**
 * Simulate Human Jitter Delay (Section 29 of .cursorrules)
 * Delay in [500ms, 1500ms]
 */
export function getHumanJitterMs() {
  return Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
}

/**
 * Render FACTORIUM Engine View
 */
export function renderFactoriumModule(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const workers = MOCK_WORKERS;

  container.innerHTML = `
    <div class="factorium-view" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px;">🏭 FACTORIUM Build & Worker-Engine</h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Deterministische SSG-Pipeline, Delta-Inferenz & Token-Bucket Rate-Limiting</p>
        </div>
        <button id="btn-trigger-factorium-build" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer;">
          <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Build-Pipeline Durchlauf Starten
        </button>
      </div>

      <!-- Pipeline Phase Display -->
      <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 24px;">
        <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--color-text-primary);">Pipeline Phase Execution Status</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="factorium-pipeline-steps">
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">1. Data-Load</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">2. Geo-Scan</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">3. Delta-Compute</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">4. Intent-Match</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">5. Task-Split</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">6. Worker-Dispatch</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">7. SSG Output</span>
        </div>
      </div>

      <!-- Worker Pool Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        ${workers.map(w => `
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 600; font-size: 0.95rem;">${w.name}</span>
              <span style="padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; background: ${w.status === 'idle' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${w.status === 'idle' ? '#34d399' : '#fbbf24'};">${w.status.toUpperCase()}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 6px;">Kapazität Score: <strong>${w.maxCapacity - w.activeTasks} / ${w.maxCapacity}</strong></div>
            <div style="font-size: 0.85rem; color: var(--color-text-secondary);">Token Bucket: <strong>${w.rpmQuota} RPM</strong></div>
          </div>
        `).join('')}
      </div>

      <!-- Console Log Box -->
      <div style="background: #090d16; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; font-family: monospace; font-size: 0.85rem; color: #34d399; height: 180px; overflow-y: auto;" id="factorium-console-log">
        [FACTORIUM Engine Ready] Initialized 3 distributed workers. Delta-Compute threshold: \u0394 > 0.
      </div>
    </div>
  `;

  const btn = document.getElementById('btn-trigger-factorium-build');
  const consoleLog = document.getElementById('factorium-console-log');

  if (btn && consoleLog) {
    btn.addEventListener('click', () => {
      const jitter = getHumanJitterMs();
      const optimal = getOptimalWorker();
      const delta = computeDelta("Soll state text v1", "Soll state text v2", new Date(Date.now() - 100 * 24 * 60 * 60 * 1000));

      consoleLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] 🚀 Initiating FACTORIUM Pipeline...`;
      consoleLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] 🔍 Delta-Inference: ${delta.reason}`;
      consoleLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ⚙️ Selected Optimal Worker: ${optimal ? optimal.name : 'Queue Overload'}`;
      consoleLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ⏱️ Applied Human Jitter Delay: ${jitter}ms`;
      consoleLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ✅ SSG Static Generation Completed Successfully.`;
      consoleLog.scrollTop = consoleLog.scrollHeight;
    });
  }
}
