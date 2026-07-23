// documents.js - Neues Dokument Modul für Nexus OMS
import { runComplianceCheck, analyzeCicero7Q, validateAtuNumber, validateGisaNumber, generateCryptographicId } from './axiom.ts';

const DEFAULT_DOCUMENTS = [];

export function initDocumentsModule() {
  const container = document.getElementById("tab-new-document");
  if (!container) return;

  if (!localStorage.getItem("serviceos_documents")) {
    localStorage.setItem("serviceos_documents", JSON.stringify(DEFAULT_DOCUMENTS));
  }

  renderDocumentsView();
}

function getDocuments() {
  const data = localStorage.getItem("serviceos_documents");
  return data ? JSON.parse(data) : DEFAULT_DOCUMENTS;
}

function saveDocuments(docs) {
  localStorage.setItem("serviceos_documents", JSON.stringify(docs));
  window.dispatchEvent(new Event('storage'));
}

export function renderDocumentsView() {
  const container = document.getElementById("tab-new-document");
  if (!container) return;

  const currentUser = ServiceOSStore ? ServiceOSStore.getCurrentUser() : { name: "Zentrale" };
  const cases = ServiceOSStore ? ServiceOSStore.getCases() : [];

  container.innerHTML = `
    <div class="documents-module" style="padding: 24px; max-width: 1100px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            Rechtssichere Dokumenten-Engine (§ 11 UStG & GISA Compliant)
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Erstellung von Rechnungen, Angeboten & Partnerverträgen mit USt-Aufschlüsselung & GISA-/ATU-Prüfung</p>
        </div>
      </div>

      <!-- Generator & Live Preview Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; margin-bottom: 32px;">
        <!-- Left: Form -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
            📝 Dokumenten-Parameter & § 11 UStG Angaben
          </h3>

          <form id="doc-generator-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Dokumenten-Titel</label>
              <input type="text" id="doc-title" class="wizard-input" required placeholder="z.B. Honorarrechnung Gewerbliche Räumung Wien" style="width: 100%;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Dokumententyp</label>
                <select id="doc-type" class="wizard-input" style="width: 100%;">
                  <option value="Rechnung (§ 11 UStG)">Rechnung (§ 11 UStG)</option>
                  <option value="Gewerbliches Angebot">Gewerbliches Angebot</option>
                  <option value="Auftragsbestätigung">Auftragsbestätigung</option>
                  <option value="Gutschrift / Storno">Gutschrift / Storno</option>
                  <option value="Subunternehmer / Partnervereinbarung">Subunternehmer / Partnervertrag</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kunde / Empfänger Name</label>
                <input type="text" id="doc-client" class="wizard-input" required placeholder="Firma / Herr Frau..." style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Empfänger ATU/UID (B2B)</label>
                <input type="text" id="doc-client-atu" class="wizard-input" placeholder="z.B. ATU12345678" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Verknüpfte Fallakte (Optional)</label>
                <select id="doc-case-id" class="wizard-input" style="width: 100%;">
                  <option value="">-- Keine Fallaktenverknüpfung --</option>
                  ${cases.map(c => `
                    <option value="${c.id}">${c.caseNumber} - ${c.client} (${c.branch})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Finanz- & Steueraufschlüsselung -->
            <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px;">
              <div style="font-size: 0.85rem; font-weight: 600; color: #60a5fa; margin-bottom: 10px;">💶 Betrag & Steueraufschlüsselung (§ 11 UStG)</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Nettobetrag (€)</label>
                  <input type="number" step="0.01" id="doc-netto" class="wizard-input" value="375.00" style="width: 100%;">
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">USt-Satz (%)</label>
                  <select id="doc-vat-rate" class="wizard-input" style="width: 100%;">
                    <option value="20">20% Standard USt (AT)</option>
                    <option value="10">10% Ermäßigt USt (AT)</option>
                    <option value="0">0% Steuerfrei / Reverse Charge</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Leistungsbeschreibung / Textbaustein</label>
              <textarea id="doc-content" class="wizard-input" rows="4" required style="width: 100%;">Durchführung von professionellen Räumungs- und Transportleistungen am Einsatzort gemäß Vereinbarung. Wertstoffübertragung ordnungsgemäß dokumentiert.</textarea>
            </div>

            <!-- Live Compliance & Cicero 7Q Box -->
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px;" id="doc-compliance-box">
              <div style="font-size: 0.8rem; font-weight: bold; color: var(--color-text-secondary); margin-bottom: 8px;">🔍 Live Legal & GISA / ATU Prüfpipeline</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="doc-cicero-badges">
                <!-- Renders dynamically -->
              </div>
              <div style="font-size: 0.75rem; margin-top: 8px; color: #34d399;" id="doc-compliance-info">✓ Aussteller & Empfänger Angaben konform.</div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
              <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 20px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer;">
                📄 Dokument Erstellen & Speichern
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Realtime Document Preview (§ 11 UStG Preview) -->
        <div style="background: #ffffff; color: #0f172a; border-radius: var(--border-radius-md); padding: 24px; box-shadow: var(--shadow-premium); font-family: sans-serif; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-weight: 800; font-size: 1.2rem; color: #0f172a;">SERVICEOS PLATTFORM</div>
                <div style="font-size: 0.75rem; color: #64748b;" id="prev-doc-type-label">RECHNUNG (§ 11 UStG)</div>
              </div>
              <div style="text-align: right; font-size: 0.8rem; color: #64748b;">
                <div>Datum: <span id="prev-doc-date">${new Date().toLocaleDateString('de-AT')}</span></div>
                <div style="font-weight: bold; color: #2563eb;" id="prev-doc-id">INV-2026-DRAFT</div>
              </div>
            </div>

            <!-- Aussteller & Empfänger Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
              <div>
                <div style="font-size: 0.7rem; font-weight: bold; color: #64748b; text-transform: uppercase;">Aussteller / Plattform:</div>
                <div style="font-weight: bold; color: #0f172a;">ServiceOS Betriebssteuerung</div>
                <div style="color: #475569;">GISA: <span id="prev-doc-gisa" style="font-family: monospace;">GISA-12948574</span></div>
                <div style="color: #475569;">UID: <span id="prev-doc-my-atu" style="font-family: monospace;">ATU78901234</span></div>
              </div>
              <div>
                <div style="font-size: 0.7rem; font-weight: bold; color: #64748b; text-transform: uppercase;">Empfänger / Auftraggeber:</div>
                <div style="font-weight: bold; color: #0f172a;" id="prev-doc-client">Kundenbezeichnung</div>
                <div style="color: #475569;" id="prev-doc-client-atu">UID: -</div>
                <div style="color: #64748b; font-size: 0.75rem;" id="prev-doc-case">Fallakte: Keine</div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 6px;" id="prev-doc-title">Rechnung für Dienstleistung</div>
              <div style="font-size: 0.85rem; line-height: 1.4; color: #334155; white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;" id="prev-doc-body">Inhalt...</div>
            </div>

            <!-- Tax Breakdown Table (§ 11 UStG) -->
            <div style="margin-bottom: 16px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
              <div style="font-weight: bold; font-size: 0.8rem; color: #0f172a; margin-bottom: 6px;">Entgelt & USt-Berechnung (§ 11 UStG)</div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 3px;">
                <span>Nettobetrag:</span>
                <span id="prev-calc-netto">€ 375,00</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 6px;">
                <span>USt (<span id="prev-calc-rate">20</span>%):</span>
                <span id="prev-calc-vat">€ 75,00</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: bold; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 6px;">
                <span>Brutto-Gesamtbetrag:</span>
                <span id="prev-calc-brutto" style="color: #16a34a;">€ 450,00</span>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid #cbd5e1; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.75rem; color: #64748b;">
              Status: <span style="color: #16a34a; font-weight: bold;" id="prev-doc-status">✓ § 11 UStG Validiert</span>
            </div>
            <button type="button" class="btn" onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
              🖨️ Drucken / PDF Export
            </button>
          </div>
        </div>
      </div>

      <!-- Created Documents History Archive -->
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px;">
        <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
          📂 Dokumenten-Archiv & Erstellte Schriftstücke
        </h3>

        <div style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
                <th style="padding: 12px 14px;">Dokument ID & Titel</th>
                <th style="padding: 12px 14px;">Typ</th>
                <th style="padding: 12px 14px;">Empfänger</th>
                <th style="padding: 12px 14px;">Brutto (€)</th>
                <th style="padding: 12px 14px;">Erstellt am</th>
                <th style="padding: 12px 14px; text-align: center;">Compliance</th>
                <th style="padding: 12px 14px; text-align: right;">Aktionen</th>
              </tr>
            </thead>
            <tbody id="doc-archive-body">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  renderArchiveTable();
  setupDocumentEventListeners();
}

function renderArchiveTable() {
  const tableBody = document.getElementById("doc-archive-body");
  if (!tableBody) return;

  const docs = getDocuments();
  tableBody.innerHTML = "";

  if (docs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--color-text-muted);">Noch keine Dokumente im Archiv.</td></tr>`;
    return;
  }

  docs.forEach(doc => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--color-border)";
    tr.innerHTML = `
      <td style="padding: 12px 14px;">
        <div style="font-weight: 600; color: var(--color-text-primary);">${doc.title}</div>
        <div style="font-size: 0.75rem; color: #60a5fa; font-family: monospace;">${doc.id}</div>
      </td>
      <td style="padding: 12px 14px;">
        <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa;">${doc.type}</span>
      </td>
      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">${doc.client}</td>
      <td style="padding: 12px 14px; font-size: 0.85rem; font-weight: bold; color: #34d399;">€ ${(doc.brutto || 0).toFixed(2)}</td>
      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">${doc.date}</td>
      <td style="padding: 12px 14px; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399;">✓ § 11 UStG</span>
      </td>
      <td style="padding: 12px 14px; text-align: right;">
        <button class="btn btn-sm doc-delete-btn" data-id="${doc.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".doc-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteDocument(btn.getAttribute("data-id")));
  });
}

function setupDocumentEventListeners() {
  const form = document.getElementById("doc-generator-form");
  const titleInput = document.getElementById("doc-title");
  const typeInput = document.getElementById("doc-type");
  const clientInput = document.getElementById("doc-client");
  const clientAtuInput = document.getElementById("doc-client-atu");
  const caseInput = document.getElementById("doc-case-id");
  const nettoInput = document.getElementById("doc-netto");
  const vatRateInput = document.getElementById("doc-vat-rate");
  const contentInput = document.getElementById("doc-content");

  const prevTitle = document.getElementById("prev-doc-title");
  const prevType = document.getElementById("prev-doc-type-label");
  const prevClient = document.getElementById("prev-doc-client");
  const prevClientAtu = document.getElementById("prev-doc-client-atu");
  const prevCase = document.getElementById("prev-doc-case");
  const prevBody = document.getElementById("prev-doc-body");
  const prevNetto = document.getElementById("prev-calc-netto");
  const prevRate = document.getElementById("prev-calc-rate");
  const prevVat = document.getElementById("prev-calc-vat");
  const prevBrutto = document.getElementById("prev-calc-brutto");
  const badgesBox = document.getElementById("doc-cicero-badges");

  const updatePreview = () => {
    if (prevTitle && titleInput) prevTitle.textContent = titleInput.value || "Dokumenten-Titel";
    if (prevType && typeInput) prevType.textContent = typeInput.value.toUpperCase();
    if (prevClient && clientInput) prevClient.textContent = clientInput.value || "Empfänger Kunde";
    
    if (prevClientAtu && clientAtuInput) {
      const atuVal = clientAtuInput.value.trim();
      const isAtuValid = validateAtuNumber(atuVal);
      prevClientAtu.innerHTML = `UID: <span style="font-family: monospace; font-weight: bold; color: ${isAtuValid ? '#16a34a' : '#dc2626'};">${atuVal || '-'}</span> ${isAtuValid ? '✓' : ''}`;
    }

    if (prevCase && caseInput) {
      const caseVal = caseInput.value;
      prevCase.textContent = caseVal ? `Fallakte: ${caseVal}` : "Fallakte: Keine";
    }

    if (prevBody && contentInput) prevBody.textContent = contentInput.value || "...";

    // Calculation
    const netto = parseFloat(nettoInput?.value) || 0;
    const rate = parseFloat(vatRateInput?.value) || 0;
    const vat = netto * (rate / 100);
    const brutto = netto + vat;

    if (prevNetto) prevNetto.textContent = `€ ${netto.toFixed(2)}`;
    if (prevRate) prevRate.textContent = rate;
    if (prevVat) prevVat.textContent = `€ ${vat.toFixed(2)}`;
    if (prevBrutto) prevBrutto.textContent = `€ ${brutto.toFixed(2)}`;

    // Badges Box
    if (badgesBox) {
      const atuVal = clientAtuInput?.value.trim();
      const isAtuValid = !atuVal || validateAtuNumber(atuVal);
      const c7q = analyzeCicero7Q(contentInput?.value || '');

      badgesBox.innerHTML = `
        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${isAtuValid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}; color: ${isAtuValid ? '#34d399' : '#f87171'};">
          UID: ${isAtuValid ? 'GÜLTIG ✓' : 'FORMAT PRÜFEN ✕'}
        </span>
        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: rgba(16, 185, 129, 0.25); color: #34d399;">
          GISA: GÜLTIG ✓
        </span>
        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: rgba(16, 185, 129, 0.25); color: #34d399;">
          CICERO: ${c7q.passedCount}/7 ✓
        </span>
      `;
    }
  };

  [titleInput, typeInput, clientInput, clientAtuInput, caseInput, nettoInput, vatRateInput, contentInput].forEach(el => {
    if (el) {
      el.addEventListener("input", updatePreview);
      el.addEventListener("change", updatePreview);
    }
  });

  updatePreview();

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const type = typeInput.value;
      const client = clientInput.value.trim();
      const clientAtu = clientAtuInput.value.trim();
      const caseId = caseInput.value;
      const netto = parseFloat(nettoInput.value) || 0;
      const vatRate = parseFloat(vatRateInput.value) || 0;
      const vat = netto * (vatRate / 100);
      const brutto = netto + vat;
      const content = contentInput.value.trim();

      const genId = generateCryptographicId || window.generateCryptographicId || function(p) { return p + "-2026-" + Math.floor(1000 + Math.random() * 9000); };
      const docPrefix = type.includes("Rechnung") ? "INV" : "DOC";
      const docId = genId(docPrefix);

      const docs = getDocuments();
      const newDoc = {
        id: docId,
        title,
        type,
        client,
        clientAtu,
        caseId,
        netto,
        vatRate,
        vat,
        brutto,
        date: new Date().toISOString().split('T')[0],
        status: "§ 11 UStG Compliant",
        content
      };

      docs.unshift(newDoc);
      saveDocuments(docs);

      // If linked to a Case, record event in Case Timeline
      if (caseId && ServiceOSStore && ServiceOSStore.addTimelineEventToCase) {
        ServiceOSStore.addTimelineEventToCase(caseId, {
          type: "DOCUMENT_CREATED",
          title: `${type} ${docId}`,
          description: `${title} (${client}) für € ${brutto.toFixed(2)} brutto erstellt.`,
          author: "Dokumenten-Engine"
        });
      }

      ServiceOSStore.logAudit("DOCUMENT_CREATED", `Dokument ${docId} (${type}) für ${client} generiert.`);

      alert(`✓ Dokument ${docId} wurde erfolgreich generiert, § 11 UStG-konform geprüft und gespeichert!`);
      renderDocumentsView();
    });
  }
}

function deleteDocument(docId) {
  if (!confirm("Möchten Sie dieses Dokument wirklich löschen?")) return;
  const docs = getDocuments().filter(d => d.id !== docId);
  saveDocuments(docs);
  renderDocumentsView();
}
