// analytics.js - Reporting & Analytics Modul für Nexus OMS

const DEFAULT_ANALYTICS = {
  timeRange: "30d",
  avgQNexus: 0.885,
  avgSyntaxScore: 0.94,
  avgComplianceScore: 0.92,
  avgLuposScore: 0.89,
  conversionRate: 84.2,
  botImmunityScore: 98.6,
  branchPerformance: [
    { branch: "Ententrümpelung / Räumung", revenue: 28949.99, orders: 8, sharePercent: 42.5 },
    { branch: "Cloud Infrastructure", revenue: 13500.00, orders: 4, sharePercent: 19.8 },
    { branch: "IT Security & Audits", revenue: 8550.00, orders: 5, sharePercent: 12.5 },
    { branch: "Database Sync", revenue: 11600.00, orders: 3, sharePercent: 17.0 },
    { branch: "Transport & Logistics", revenue: 5600.00, orders: 3, sharePercent: 8.2 }
  ],
  regionalShare: [
    { region: "Wien & Umgebung", orders: 12, share: 52 },
    { region: "Kärnten & Steiermark", orders: 5, share: 22 },
    { region: "Oberösterreich & Salzburg", orders: 4, share: 17 },
    { region: "Deutschland (Bayern/NRW)", orders: 2, share: 9 }
  ]
};

export function initAnalyticsModule() {
  const container = document.getElementById("tab-analytics");
  if (!container) return;

  renderAnalyticsView();
}

export function renderAnalyticsView() {
  const container = document.getElementById("tab-analytics");
  if (!container) return;

  const data = DEFAULT_ANALYTICS;

  container.innerHTML = `
    <div class="analytics-module" style="padding: 24px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #60a5fa;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Reporting & Performance Analytics
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Echtzeit-Auswertung von Q_NEXUS Qualitäts-Scores, Branchen-Performances und Konversionsquoten</p>
        </div>

        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="display: flex; background: rgba(30, 41, 59, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); padding: 2px;" id="analytics-time-picker">
            <button class="analytics-time-btn active" data-range="7d" style="background: var(--color-primary); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">7 Tage</button>
            <button class="analytics-time-btn" data-range="30d" style="background: transparent; color: var(--color-text-secondary); border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">30 Tage</button>
            <button class="analytics-time-btn" data-range="90d" style="background: transparent; color: var(--color-text-secondary); border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">90 Tage</button>
          </div>

          <button id="btn-export-analytics" class="btn-secondary" style="display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); padding: 8px 14px; border-radius: var(--border-radius-sm); color: var(--color-text-primary); font-size: 0.85rem; cursor: pointer;">
            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Bericht (CSV)
          </button>
        </div>
      </div>

      <!-- KPI Scorecards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Ø Q_NEXUS Score</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;">${data.avgQNexus} <span style="font-size: 0.8rem; color: var(--color-text-muted);">/ 1.0</span></div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 4px;">↑ +4.2% gegenüber Vorwoche</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Conversion Rate</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;">${data.conversionRate}%</div>
          <div style="font-size: 0.75rem; color: #93c5fd; margin-top: 4px;">Optimales Zero-Friction Level</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Lupos Lesbarkeits-Index</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #fbbf24;">${data.avgLuposScore}</div>
          <div style="font-size: 0.75rem; color: #fde68a; margin-top: 4px;">Birkenbihl VFB-Konform</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Bot-Immunität (LUDUS)</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #a7f3d0;">${data.botImmunityScore}%</div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 4px;">Gefilterte Fake-Visits</div>
        </div>
      </div>

      <!-- Main Visual Section (2 Columns) -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- Left: Branch Performance Bar Chart -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary); display: flex; align-items: center; justify-content: space-between;">
            <span>📊 Umsatzverteilung nach Branchen</span>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Gesamt: € 68.199,99</span>
          </h3>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${data.branchPerformance.map(b => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                  <span style="color: var(--color-text-primary); font-weight: 500;">${b.branch} <small style="color: var(--color-text-muted);">(${b.orders} Aufträge)</small></span>
                  <span style="color: #10b981; font-weight: 600;">€ ${b.revenue.toLocaleString('de-AT', { minimumFractionDigits: 2 })} (${b.sharePercent}%)</span>
                </div>
                <div style="width: 100%; height: 10px; background: rgba(30, 41, 59, 0.8); border-radius: 5px; overflow: hidden;">
                  <div style="width: ${b.sharePercent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 5px; transition: width 0.5s ease;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Regional Market Share -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary);">📍 Regionaler Marktanteil</h3>
          
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${data.regionalShare.map(r => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(30, 41, 59, 0.4); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary);">${r.region}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${r.orders} Aufträge lokal</div>
                </div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #60a5fa;">${r.share}%</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Q_NEXUS Formula Simulator Interactive Widget -->
      <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
        <h3 style="font-size: 1.1rem; margin-bottom: 8px; color: var(--color-text-primary);">
          🧮 Q_NEXUS Gewichtungs-Simulator (Synergie-Formel V2)
        </h3>
        <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px;">
          Formel: <code style="color: #60a5fa;">Q_NEXUS = w1*S + w2*V + w3*L + w4*(S*V*L)</code> mit \u2211 w_i = 1.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: center;">
          <div>
            <label style="font-size: 0.8rem; display: flex; justify-content: space-between;">
              <span>Syntax (w1): <strong id="sim-w1-val">0.25</strong></span>
            </label>
            <input type="range" id="sim-w1" min="0.1" max="0.5" step="0.05" value="0.25" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; display: flex; justify-content: space-between;">
              <span>Verifizierung (w2): <strong id="sim-w2-val">0.35</strong></span>
            </label>
            <input type="range" id="sim-w2" min="0.1" max="0.5" step="0.05" value="0.35" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; display: flex; justify-content: space-between;">
              <span>Lupos (w3): <strong id="sim-w3-val">0.25</strong></span>
            </label>
            <input type="range" id="sim-w3" min="0.1" max="0.5" step="0.05" value="0.25" style="width: 100%;">
          </div>
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Simulierter Ø Score</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;" id="sim-q-result">0.885</div>
          </div>
        </div>
      </div>
    </div>
  `;

  setupAnalyticsEventListeners();
}

function setupAnalyticsEventListeners() {
  const timeBtns = document.querySelectorAll(".analytics-time-btn");
  timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      timeBtns.forEach(b => {
        b.style.background = "transparent";
        b.style.color = "var(--color-text-secondary)";
      });
      btn.style.background = "var(--color-primary)";
      btn.style.color = "white";
    });
  });

  const btnExport = document.getElementById("btn-export-analytics");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const csvContent = "data:text/csv;charset=utf-8,Branche,Umsatz,Auftraege\nEntruempelung,28949.99,8\nCloud,13500.00,4\nSecurity,8550.00,5\nDatabase,11600.00,3\nTransport,5600.00,3";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `nexus_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Weight simulator logic
  const w1Input = document.getElementById("sim-w1");
  const w2Input = document.getElementById("sim-w2");
  const w3Input = document.getElementById("sim-w3");
  const resultVal = document.getElementById("sim-q-result");

  const updateSim = () => {
    if (!w1Input || !w2Input || !w3Input || !resultVal) return;
    const w1 = parseFloat(w1Input.value);
    const w2 = parseFloat(w2Input.value);
    const w3 = parseFloat(w3Input.value);
    const w4 = Math.max(0, parseFloat((1 - (w1 + w2 + w3)).toFixed(2)));

    document.getElementById("sim-w1-val").textContent = w1.toString();
    document.getElementById("sim-w2-val").textContent = w2.toString();
    document.getElementById("sim-w3-val").textContent = w3.toString();

    const S = 0.94;
    const V = 0.92;
    const L = 0.89;
    const q = (w1 * S) + (w2 * V) + (w3 * L) + (w4 * (S * V * L));

    resultVal.textContent = q.toFixed(3);
  };

  if (w1Input) w1Input.addEventListener("input", updateSim);
  if (w2Input) w2Input.addEventListener("input", updateSim);
  if (w3Input) w3Input.addEventListener("input", updateSim);
}
