/**
 * GovernanceView.js — Renders AOD v3 modular Knowledge Objects in a rich, interactive UI.
 */

import { BaseView } from './BaseView.js';

export class GovernanceView extends BaseView {
  constructor(container) {
    super(container);
    this._data = null;
    this._activeTab = 'foundation';
    this._selectedRule = null;
    this._searchQuery = '';
    this._filters = {
      Mandatory: true,
      Recommended: true,
      Optional: true
    };
  }

  render(data) {
    this._data = data;
    this.destroy();

    this.el = document.createElement('div');
    this.el.className = 'gov-container';
    this.container.appendChild(this.el);

    this._renderHeader();
    this._renderTabs();
    this._renderPanes();
    this._renderDetailPanel();

    this._bindEvents();
    this._showTab(this._activeTab);
  }

  _renderHeader() {
    const header = document.createElement('header');
    header.className = 'gov-header';
    header.innerHTML = `
      <h1>🏛️ AI Operational Directive v3</h1>
      <p>Modular Governance Platform for Humans, AI Agents, and Automated Workflows. 
         Status: RADICAL OBJECTIVITY &amp; SYSTEM FIXPOINT SECURED. Compiled: v${this._data.version || '3.0.0'}</p>
    `;
    this.el.appendChild(header);
  }

  _renderTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'gov-tabs';
    tabsContainer.innerHTML = `
      <button class="gov-tab-btn" data-tab="foundation">📚 Foundation</button>
      <button class="gov-tab-btn" data-tab="rules">⚙️ Regelkatalog</button>
      <button class="gov-tab-btn" data-tab="workflows">🔄 Workflows</button>
      <button class="gov-tab-btn" data-tab="checklists">🛡️ Checklisten</button>
      <button class="gov-tab-btn" data-tab="decision_models">🧠 Entscheidungsmodelle</button>
    `;
    this.el.appendChild(tabsContainer);
  }

  _renderPanes() {
    // Foundation Pane
    const foundationPane = document.createElement('div');
    foundationPane.className = 'gov-pane' + (this._activeTab === 'foundation' ? ' active' : '');
    foundationPane.id = 'pane-foundation';
    this._buildFoundation(foundationPane);
    this.el.appendChild(foundationPane);

    // Rules Pane
    const rulesPane = document.createElement('div');
    rulesPane.className = 'gov-pane' + (this._activeTab === 'rules' ? ' active' : '');
    rulesPane.id = 'pane-rules';
    this._buildRules(rulesPane);
    this.el.appendChild(rulesPane);

    // Workflows Pane
    const workflowsPane = document.createElement('div');
    workflowsPane.className = 'gov-pane' + (this._activeTab === 'workflows' ? ' active' : '');
    workflowsPane.id = 'pane-workflows';
    this._buildWorkflows(workflowsPane);
    this.el.appendChild(workflowsPane);

    // Checklists Pane
    const checklistsPane = document.createElement('div');
    checklistsPane.className = 'gov-pane' + (this._activeTab === 'checklists' ? ' active' : '');
    checklistsPane.id = 'pane-checklists';
    this._buildChecklists(checklistsPane);
    this.el.appendChild(checklistsPane);

    // Decision Models Pane
    const decisionPane = document.createElement('div');
    decisionPane.className = 'gov-pane' + (this._activeTab === 'decision_models' ? ' active' : '');
    decisionPane.id = 'pane-decision_models';
    this._buildDecisionModels(decisionPane);
    this.el.appendChild(decisionPane);
  }

  _buildFoundation(container) {
    let html = `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
    `;

    // Core Axioms
    const axioms = this._data.principles?.find(p => p.filename === 'core_axioms.md');
    if (axioms) {
      html += `
        <article class="gov-header" style="background: rgba(15, 23, 42, 0.25);">
          <h2 style="color:#f8fafc; font-size:1.5rem; margin-bottom:1rem;">Algebraische System-Axiome (Logic DNA)</h2>
          <div class="gov-math-box">
            Systemoperator T:
            <span class="gov-math-formula">T = C ∘ P_J ∘ D_L ∘ F</span>
            Fixpunkt-Bedingung:
            <span class="gov-math-formula">T(X*) = X*</span>
            Radikale Objektivität (RO):
            <span class="gov-math-formula">Output = Inference(Input, Location, Service) ∘ DECORUM_Filter</span>
          </div>
          <div style="font-size:0.95rem; color:#cbd5e1; line-height:1.6;">
            Die Inferenz basiert auf der puren Payload-Logik, bei der Floskeln entfernt und nur verifizierte Daten eingeblasen werden.
          </div>
        </article>
      `;
    }

    // Stability Theory
    const stability = this._data.principles?.find(p => p.filename === 'stability_theory.md');
    if (stability) {
      html += `
        <article class="gov-header" style="background: rgba(15, 23, 42, 0.25);">
          <h2 style="color:#f8fafc; font-size:1.5rem; margin-bottom:1rem;">Stabilitäts- &amp; Konvergenztheorie</h2>
          <div class="gov-math-box">
            Lemma 1: Decorum-Projektion ist idempotent:
            <span class="gov-math-formula">D_L(D_L(X)) = D_L(X)</span>
            Lemma 2: Cache ist idempotent:
            <span class="gov-math-formula">C(C(X)) = C(X)</span>
            Komplexitätsreduktions-Satz:
            <span class="gov-math-formula">E[T] = (1 - h) · O(F) + O(C)</span>
          </div>
          <div style="font-size:0.95rem; color:#cbd5e1; line-height:1.6;">
            Für hitrates h → 1 konvergiert der Rechenaufwand gegen O(C). Somit wird das rechenintensive LLM-Inferenzieren asymptotisch vernachlässigbar.
          </div>
        </article>
      `;
    }

    // Visibility Vector
    const visibility = this._data.principles?.find(p => p.filename === 'visibility_vector.md');
    if (visibility) {
      html += `
        <article class="gov-header" style="background: rgba(15, 23, 42, 0.25);">
          <h2 style="color:#f8fafc; font-size:1.5rem; margin-bottom:1rem;">NEXUS Supremacy &amp; Q_NEXUS</h2>
          <div class="gov-math-box">
            Sichtbarkeits-Gleichung:
            <span class="gov-math-formula">V_NEXUS = [ ∑ (Sind_i · Walg_i) ] · lim_{Δ_CoP → 0} ( Ω_RO(L, J) / (Δ_CoP + ε) )</span>
            Q_NEXUS Score V2:
            <span class="gov-math-formula">Q_NEXUS = w_1 · S + w_2 · V + w_3 · L + w_4 · (S · V · L)</span>
          </div>
        </article>
      `;
    }

    // Glossary
    const glossary = this._data.glossary?.[0];
    if (glossary) {
      html += `
        <article class="gov-header" style="background: rgba(15, 23, 42, 0.25);">
          <h2 style="color:#f8fafc; font-size:1.5rem; margin-bottom:1rem;">Glossar &amp; System-Terminologie</h2>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; font-size:0.9rem;">
            <div><strong>DECORUM:</strong> Radikaler Sachlichkeitsfilter.</div>
            <div><strong>LINGUA-LOCA:</strong> Geozentrisches Übersetzungstool.</div>
            <div><strong>LUDUS:</strong> Emotionsgesteuertes UX-Routing.</div>
            <div><strong>FACTORIUM:</strong> Zero-JS Static Page Compiler.</div>
            <div><strong>VISIUM:</strong> Asset und Styling Pipeline.</div>
            <div><strong>AXIOM:</strong> SQLite Data Engine.</div>
          </div>
        </article>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }

  _buildRules(container) {
    container.innerHTML = `
      <div class="gov-filters">
        <div style="display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; min-width: 250px;">
          <label class="gov-filter-label" for="gov-rule-search">Suche nach ID oder Name</label>
          <input type="text" id="gov-rule-search" placeholder="z.B. AOD-RULE-001..." style="background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.5rem; color:#fff;" />
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <span class="gov-filter-label">Normative Stufe filtern</span>
          <div class="gov-checkbox-group">
            <label class="gov-checkbox-label"><input type="checkbox" data-level="Mandatory" checked /> Mandatory</label>
            <label class="gov-checkbox-label"><input type="checkbox" data-level="Recommended" checked /> Recommended</label>
            <label class="gov-checkbox-label"><input type="checkbox" data-level="Optional" checked /> Optional</label>
          </div>
        </div>
      </div>
      <div class="gov-table-wrapper">
        <table class="gov-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Stufe</th>
              <th>Priorität</th>
              <th>Verantwortlich</th>
            </tr>
          </thead>
          <tbody id="gov-rules-table-body">
            <!-- Dynamic content -->
          </tbody>
        </table>
      </div>
    `;
    this._filterRules();
  }

  _filterRules() {
    const tbody = this.el.querySelector('#gov-rules-table-body');
    if (!tbody) return;

    const filtered = (this._data.rules || []).filter(rule => {
      const matchSearch = (rule.id || '').toLowerCase().includes(this._searchQuery.toLowerCase()) || 
                          (rule.name || '').toLowerCase().includes(this._searchQuery.toLowerCase());
      const matchLevel = this._filters[rule.normative_level] === true;
      return matchSearch && matchLevel;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:2rem;">Keine Regeln gefunden.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(rule => {
      let levelClass = 'gov-badge-medium';
      if (rule.normative_level === 'Mandatory') levelClass = 'gov-badge-critical';
      if (rule.normative_level === 'Optional') levelClass = 'gov-badge-low';

      let priorityClass = 'gov-badge-medium';
      if (rule.priority === 'Critical') priorityClass = 'gov-badge-critical';
      if (rule.priority === 'High') priorityClass = 'gov-badge-high';
      if (rule.priority === 'Low') priorityClass = 'gov-badge-low';

      return `
        <tr style="cursor:pointer;" data-rule-id="${rule.id}">
          <td style="font-family:'JetBrains Mono', monospace; font-weight:bold; color:#38bdf8;">${rule.id}</td>
          <td style="font-weight:600;">${rule.name}</td>
          <td><span class="gov-badge ${levelClass}">${rule.normative_level}</span></td>
          <td><span class="gov-badge ${priorityClass}">${rule.priority}</span></td>
          <td style="color:#94a3b8;">${rule.owner}</td>
        </tr>
      `;
    }).join('');

    // Bind row click
    tbody.querySelectorAll('tr[data-rule-id]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-rule-id');
        const rule = this._data.rules.find(r => r.id === id);
        this._showRuleDetails(rule);
      });
    });
  }

  _showRuleDetails(rule) {
    this._selectedRule = rule;
    const panel = this.el.querySelector('#gov-detail-panel');
    if (!panel) return;

    let levelClass = 'gov-badge-medium';
    if (rule.normative_level === 'Mandatory') levelClass = 'gov-badge-critical';
    if (rule.normative_level === 'Optional') levelClass = 'gov-badge-low';

    let priorityClass = 'gov-badge-medium';
    if (rule.priority === 'Critical') priorityClass = 'gov-badge-critical';
    if (rule.priority === 'High') priorityClass = 'gov-badge-high';
    if (rule.priority === 'Low') priorityClass = 'gov-badge-low';

    panel.querySelector('#panel-content').innerHTML = `
      <div class="gov-detail-section">
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:0.25rem;">${rule.id}</h2>
        <h3 style="font-size:1.2rem; color:#cbd5e1; font-weight:500; margin-bottom:1.5rem;">${rule.name}</h3>
        <div style="display:flex; gap:0.5rem; margin-bottom:2rem;">
          <span class="gov-badge ${levelClass}">${rule.normative_level}</span>
          <span class="gov-badge ${priorityClass}">${rule.priority}</span>
        </div>
      </div>
      
      <div class="gov-detail-section">
        <div class="gov-detail-label">Zweck</div>
        <div class="gov-detail-val">${rule.purpose}</div>
      </div>

      <div class="gov-detail-section">
        <div class="gov-detail-label">Aussage</div>
        <div class="gov-detail-val" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.1); padding:1rem; border-radius:6px; font-weight:600; line-height:1.5; color:#38bdf8;">
          ${rule.statement}
        </div>
      </div>

      <div class="gov-detail-section">
        <div class="gov-detail-label">Begründung</div>
        <div class="gov-detail-val">${rule.rationale}</div>
      </div>

      <div class="gov-detail-section">
        <div class="gov-detail-label">Gültigkeitsbereich</div>
        <div class="gov-detail-val">${rule.scope || 'Codebase-wide'}</div>
      </div>

      <div class="gov-detail-section">
        <div class="gov-detail-label">Validierung</div>
        <div class="gov-detail-val">${rule.validation}</div>
      </div>

      <div class="gov-detail-section">
        <div class="gov-detail-label">Verstöße</div>
        <div class="gov-detail-val" style="color:#f87171;">${rule.violations}</div>
      </div>

      ${rule.dependencies && rule.dependencies.length > 0 ? `
        <div class="gov-detail-section">
          <div class="gov-detail-label">Abhängigkeiten</div>
          <div class="gov-detail-val" style="font-family:monospace; color:#60a5fa;">${rule.dependencies.join(', ')}</div>
        </div>
      ` : ''}
    `;

    panel.classList.add('open');
  }

  _buildWorkflows(container) {
    container.innerHTML = `
      <div class="gov-grid">
        ${(this._data.workflows || []).map(wf => {
          return `
            <div class="gov-card">
              <div class="gov-card-subtitle">${wf.id}</div>
              <h3 class="gov-card-title">${wf.name}</h3>
              <div class="gov-card-desc" style="margin-top:0.75rem;">
                <ol style="padding-left:1.2rem; display:flex; flex-direction:column; gap:0.4rem; font-size:0.9rem; color:#cbd5e1;">
                  ${(wf.steps || []).map(step => `<li>${step}</li>`).join('')}
                </ol>
              </div>
              <div class="gov-card-footer" style="flex-direction:column; align-items:flex-start; gap:0.5rem;">
                <div style="font-size:0.75rem; color:#94a3b8;">
                  <strong>Input:</strong> ${Array.isArray(wf.inputs) ? wf.inputs.join(', ') : wf.inputs}
                </div>
                <div style="font-size:0.75rem; color:#94a3b8;">
                  <strong>Output:</strong> ${Array.isArray(wf.outputs) ? wf.outputs.join(', ') : wf.outputs}
                </div>
                <div style="font-size:0.75rem; color:#38bdf8; margin-top:0.5rem; font-family:'JetBrains Mono', monospace; font-size:0.7rem;">
                  Rules: ${Array.isArray(wf.rules_used) ? wf.rules_used.join(', ') : wf.rules_used}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  _buildChecklists(container) {
    container.innerHTML = `
      <div class="gov-grid" style="align-items:start;">
        ${(this._data.checklists || []).map(cl => {
          return `
            <div class="gov-card" style="background: rgba(15, 23, 42, 0.45);">
              <div class="gov-card-subtitle">${cl.id}</div>
              <h3 class="gov-card-title" style="margin-bottom:1rem;">${cl.name}</h3>
              <div class="gov-card-desc">
                ${(cl.items || []).map(item => `
                  <div class="gov-checklist-item">
                    <div class="gov-checklist-checkbox">✓</div>
                    <span style="font-size:0.9rem; line-height:1.4;">${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind checklist clicks
    container.querySelectorAll('.gov-checklist-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
      });
    });
  }

  _buildDecisionModels(container) {
    let selectOptions = '';
    (this._data.decision_models || []).forEach(dm => {
      selectOptions += `<option value="${dm.id}">${dm.id} - ${dm.name}</option>`;
    });

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem; align-items:start;">
        <div class="gov-grid" style="grid-template-columns: 1fr;">
          ${(this._data.decision_models || []).map(dm => {
            return `
              <div class="gov-card" style="margin-bottom:1rem;">
                <div class="gov-card-subtitle">${dm.id}</div>
                <h3 class="gov-card-title">${dm.name}</h3>
                <div class="gov-card-desc" style="margin-top:0.75rem; font-size:0.95rem;">
                  ${dm.description.replace(/```mermaid[\s\S]*?```/g, '')}
                </div>
                <div class="gov-card-footer" style="gap:1rem;">
                  <div style="font-size:0.75rem; color:#94a3b8;"><strong>Eingang:</strong> ${Array.isArray(dm.inputs) ? dm.inputs.join(', ') : dm.inputs}</div>
                  <div style="font-size:0.75rem; color:#38bdf8;"><strong>Ausgabe:</strong> ${Array.isArray(dm.outputs) ? dm.outputs.join(', ') : dm.outputs}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Interactive Decision simulator -->
        <div class="gov-card" style="position:sticky; top:1.5rem; background:rgba(0, 82, 204, 0.05); border-color: rgba(0, 82, 204, 0.25);">
          <h3 class="gov-card-title" style="margin-bottom:1.5rem; color:#38bdf8;">Decision Engine Simulator</h3>
          
          <div class="gov-simulator">
            <div class="gov-sim-field">
              <label for="sim-model-select">Modell wählen</label>
              <select id="sim-model-select">
                <option value="Q_NEXUS">Q_NEXUS Score Calculator</option>
                <option value="LUDUS">LUDUS Gamification Router</option>
                <option value="TEMPLATE">SSG Template Allocator (AOD-DM-005)</option>
              </select>
            </div>
            
            <!-- Dynamic Simulator Controls -->
            <div id="sim-dynamic-controls">
              <!-- Rendered dynamically -->
            </div>
            
            <button class="gov-sim-btn" id="gov-sim-run-btn">Auswertung starten</button>
            
            <div class="gov-sim-result" id="gov-sim-result-box">
              Ergebnis bereit...
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindSimulator();
  }

  _bindSimulator() {
    const select = this.el.querySelector('#sim-model-select');
    const controls = this.el.querySelector('#sim-dynamic-controls');
    const runBtn = this.el.querySelector('#gov-sim-run-btn');
    const resultBox = this.el.querySelector('#gov-sim-result-box');

    if (!select || !controls || !runBtn || !resultBox) return;

    const renderControls = () => {
      const val = select.value;
      if (val === 'Q_NEXUS') {
        controls.innerHTML = `
          <div class="gov-sim-field">
            <label>Syntax Score (S): <span id="val-s">0.95</span></label>
            <input type="range" id="sim-s" min="0" max="1" step="0.01" value="0.95" />
          </div>
          <div class="gov-sim-field">
            <label>Verification Score (V): <span id="val-v">0.98</span></label>
            <input type="range" id="sim-v" min="0" max="1" step="0.01" value="0.98" />
          </div>
          <div class="gov-sim-field">
            <label>Lupos Score (L): <span id="val-l">0.85</span></label>
            <input type="range" id="sim-l" min="0" max="1" step="0.01" value="0.85" />
          </div>
        `;
        // Setup slider live display
        ['s', 'v', 'l'].forEach(key => {
          const slider = controls.querySelector(`#sim-${key}`);
          const display = controls.querySelector(`#val-${key}`);
          slider?.addEventListener('input', () => display.textContent = slider.value);
        });
      } else if (val === 'LUDUS') {
        controls.innerHTML = `
          <div class="gov-sim-field">
            <label>Dienstleistungs-Branche</label>
            <select id="sim-branch">
              <option value="Recht">Kanzlei / Rechtsanwalt (High-Anxiety)</option>
              <option value="Notdienst">Notdienst / Schlüsseldienst (High-Anxiety)</option>
              <option value="Handwerk">Elektriker / Erdbau (Goal-Oriented)</option>
              <option value="Spedition">Räumung / Spedition (Goal-Oriented)</option>
              <option value="Lifestyle">Lifestyle / E-Commerce (Desire-Driven)</option>
            </select>
          </div>
        `;
      } else if (val === 'TEMPLATE') {
        controls.innerHTML = `
          <div class="gov-sim-field">
            <label>Einwohnerzahl der Gemeinde (Population)</label>
            <input type="number" id="sim-population" value="12500" min="0" />
          </div>
        `;
      }
    };

    select.addEventListener('change', renderControls);
    renderControls();

    runBtn.addEventListener('click', () => {
      const val = select.value;
      if (val === 'Q_NEXUS') {
        const s = parseFloat(controls.querySelector('#sim-s').value);
        const v = parseFloat(controls.querySelector('#sim-v').value);
        const l = parseFloat(controls.querySelector('#sim-l').value);
        // Weights: w1=0.3, w2=0.3, w3=0.2, w4=0.2
        const score = 0.3 * s + 0.3 * v + 0.2 * l + 0.2 * (s * v * l);
        resultBox.innerHTML = `
          <strong>Q_NEXUS Score:</strong> ${score.toFixed(4)}<br/>
          <strong>Wertung:</strong> ${score >= 0.90 ? '🏆 Industrial Gold standard' : score >= 0.75 ? '🥈 Standard Quality' : '❌ Revision required'}
        `;
      } else if (val === 'LUDUS') {
        const branch = controls.querySelector('#sim-branch').value;
        let route = '';
        let uiComponents = '';
        if (branch === 'Recht' || branch === 'Notdienst') {
          route = 'T_Control (High-Anxiety)';
          uiComponents = 'Zeigarnik-Wizards, Checklisten, De-escalation triggers';
        } else if (branch === 'Handwerk' || branch === 'Spedition') {
          route = 'T_Config (Goal-Oriented)';
          uiComponents = 'Cost Calculators, Before/After Slider, ROI map';
        } else {
          route = 'T_Reward (Desire-Driven)';
          uiComponents = 'Micro-animations, Instant discount unlock, Scarcity triggers';
        }
        resultBox.innerHTML = `
          <strong>LUDUS Route:</strong> ${route}<br/>
          <strong>UI Target:</strong> ${uiComponents}
        `;
      } else if (val === 'TEMPLATE') {
        const pop = parseInt(controls.querySelector('#sim-population').value, 10);
        const template = pop >= 10000 ? 'Template C (Full Silo Experience)' : 'Template D (Lean Experience)';
        const details = pop >= 10000 
          ? 'Heavy content injected (PAA, Processes, high Crawl Weight = 0.8).' 
          : 'Low budget configuration (Coat-of-Arms personalization only, Crawl Weight = 0.4).';
        resultBox.innerHTML = `
          <strong>Template:</strong> ${template}<br/>
          <strong>Details:</strong> ${details}
        `;
      }
    });
  }

  _renderDetailPanel() {
    let panel = this.el.querySelector('#gov-detail-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'gov-detail-panel';
      panel.className = 'gov-detail-panel';
      panel.innerHTML = `
        <button class="gov-detail-close">&times;</button>
        <div id="panel-content"></div>
      `;
      this.el.appendChild(panel);
    }
  }

  _bindEvents() {
    // Tab switching
    this.el.querySelectorAll('.gov-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this._showTab(tab);
      });
    });

    // Close slide-out panel
    const closeBtn = this.el.querySelector('.gov-detail-close');
    const panel = this.el.querySelector('#gov-detail-panel');
    closeBtn?.addEventListener('click', () => {
      panel?.classList.remove('open');
    });

    // Rules search
    const searchInput = this.el.querySelector('#gov-rule-search');
    searchInput?.addEventListener('input', (e) => {
      this._searchQuery = e.target.value;
      this._filterRules();
    });

    // Rules checkbox filters
    this.el.querySelectorAll('.gov-checkbox-group input').forEach(cb => {
      cb.addEventListener('change', () => {
        const level = cb.getAttribute('data-level');
        this._filters[level] = cb.checked;
        this._filterRules();
      });
    });
  }

  _showTab(tab) {
    this._activeTab = tab;
    this.el.querySelectorAll('.gov-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.el.querySelectorAll('.gov-pane').forEach(pane => {
      if (pane.id === `pane-${tab}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Close panel when shifting tabs
    this.el.querySelector('#gov-detail-panel')?.classList.remove('open');
  }

  destroy() {
    super.destroy();
    this._selectedRule = null;
  }
}
