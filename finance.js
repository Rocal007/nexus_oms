// finance.js - Finanzen, Billing & Provisions-Abrechnung Modul für Nexus OMS

const DEFAULT_INVOICES = [];

export function calculateCommissionAndPayout(grossAmount, rate = 15) {
  const gross = parseFloat(grossAmount) || 0;
  const commission = Math.round((gross * (rate / 100)) * 100) / 100;
  const partnerPayout = Math.round((gross - commission) * 100) / 100;
  return { gross, commission, partnerPayout, rate };
}

if (typeof window !== "undefined") {
  window.calculateCommissionAndPayout = calculateCommissionAndPayout;
}

export function syncInvoicesFromOrders() {
  if (!window.ServiceOSStore) return;
  const orders = ServiceOSStore.getOrders();
  const invoices = getInvoices();

  let added = false;
  orders.forEach(ord => {
    if (!invoices.some(inv => inv.orderId === ord.id)) {
      const gross = ord.value || 450.00;
      const netto = Math.round((gross / 1.2) * 100) / 100;
      const vat = Math.round((gross - netto) * 100) / 100;
      const calc = calculateCommissionAndPayout(gross, 15);

      const genId = window.generateCryptographicId || function(p) { return p + "-2026-" + Math.floor(1000 + Math.random() * 9000); };
      const invId = genId("INV");

      const today = new Date();
      const dueDateObj = new Date(today);
      dueDateObj.setDate(dueDateObj.getDate() + 14);

      const newInv = {
        id: invId,
        orderId: ord.id,
        caseId: ord.caseId || ord.caseNumber || null,
        client: ord.client || "Auftraggeber",
        companyId: ord.companyId || null,
        partner: ord.partner || "Zentrale",
        date: ord.date || today.toISOString().split("T")[0],
        dueDate: dueDateObj.toISOString().split("T")[0],
        paymentMethod: "Banküberweisung",
        netAmount: netto,
        vatRate: 20,
        vatAmount: vat,
        grossAmount: gross,
        commissionRate: 15,
        commissionAmount: calc.commission,
        partnerPayout: calc.partnerPayout,
        payoutStatus: "Offen",
        status: ord.status === "Delivered" ? "Bezahlt" : "Offen"
      };

      invoices.unshift(newInv);
      added = true;

      if (ord.caseId && ServiceOSStore.addTimelineEventToCase) {
        ServiceOSStore.addTimelineEventToCase(ord.caseId, {
          type: "BILLING_GENERATED",
          title: `Fakturierung ${invId}`,
          description: `Automatische Fakturierung über € ${gross.toFixed(2)} (Provision: € ${calc.commission.toFixed(2)}, Partner-Auszahlung: € ${calc.partnerPayout.toFixed(2)}).`,
          author: "Billing Engine"
        });
      }
    }
  });

  if (added) {
    saveInvoices(invoices);
  }
}

export function initFinanceModule() {
  const container = document.getElementById("tab-finance");
  if (!container) return;

  if (!localStorage.getItem("serviceos_invoices")) {
    localStorage.setItem("serviceos_invoices", JSON.stringify(DEFAULT_INVOICES));
  }

  syncInvoicesFromOrders();
  renderFinanceView();
}

function getInvoices() {
  const data = localStorage.getItem("serviceos_invoices");
  return data ? JSON.parse(data) : DEFAULT_INVOICES;
}

function saveInvoices(invoices) {
  localStorage.setItem("serviceos_invoices", JSON.stringify(invoices));
  window.dispatchEvent(new Event('storage'));
}

export function renderFinanceView() {
  const container = document.getElementById("tab-finance");
  if (!container) return;

  syncInvoicesFromOrders();
  const invoices = getInvoices();

  const totalGross = invoices.reduce((acc, inv) => acc + (inv.grossAmount || 0), 0);
  const unpaidGross = invoices.filter(inv => inv.status === "Offen" || inv.status === "Überfällig").reduce((acc, inv) => acc + (inv.grossAmount || 0), 0);
  const totalCommission = invoices.reduce((acc, inv) => acc + (inv.commissionAmount || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === "Bezahlt").length;
  const paidRatio = invoices.length ? Math.round((paidCount / invoices.length) * 100) : 0;

  container.innerHTML = `
    <div class="finance-module" style="padding: 24px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Finanzen & Abrechnung (Invoicing & Revenue)
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Automatisierte Fakturierung, USt-Berechnung (20% AT / 19% DE) und Partner-Provisionsabrechnung</p>
        </div>

        <button id="btn-add-invoice-fin" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neue Rechnung ausstellen
        </button>
      </div>

      <!-- KPI Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Gesamtfakturierung (Brutto)</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;">€ ${totalGross.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Offene Forderungen</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #f87171;">€ ${unpaidGross.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">System-Provisionen (15%)</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;">€ ${totalCommission.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Zahlungsquote</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #fbbf24;">${paidRatio}% <span style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: normal;">(${paidCount}/${invoices.length})</span></div>
        </div>
      </div>

      <!-- Filters -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
          <input type="text" id="fin-search-input" class="wizard-input" placeholder="Rechnungsnummer, Kunde oder Auftrag suchen..." style="width: 100%; height: 40px; padding: 0 14px;">
        </div>
        <select id="fin-status-filter" class="wizard-input" style="width: 200px; height: 40px; padding: 0 12px; cursor: pointer;">
          <option value="ALL">Alle Status</option>
          <option value="Bezahlt">Bezahlt</option>
          <option value="Offen">Offen</option>
          <option value="Überfällig">Überfällig</option>
        </select>
      </div>

      <!-- Invoices Table -->
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-premium);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
              <th style="padding: 14px 16px;">Rechnung Nr.</th>
              <th style="padding: 14px 16px;">Kunde & Auftrag</th>
              <th style="padding: 14px 16px;">Datum / Fälligkeit</th>
              <th style="padding: 14px 16px;">Betrag (Netto / USt)</th>
              <th style="padding: 14px 16px;">Brutto Gesamt</th>
              <th style="padding: 14px 16px;">Provision</th>
              <th style="padding: 14px 16px; text-align: center;">Status</th>
              <th style="padding: 14px 16px; text-align: right;">Aktionen</th>
            </tr>
          </thead>
          <tbody id="fin-table-body">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invoice PDF Preview Modal -->
    <div class="modal-overlay" id="fin-pdf-modal" style="display: none;">
      <div class="modal-card" style="max-width: 700px; background: #ffffff; color: #0f172a; border-radius: 8px; padding: 32px; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
          <div>
            <h2 style="margin: 0; color: #0f172a; font-size: 1.5rem;">NEXUS OMS SYSTEM</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.85rem;">Fakturierung & Abrechnungsdienstleister AUSTRIA</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; color: #3b82f6; font-size: 1.3rem;" id="pdf-inv-num">RE-2026-001</h3>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.85rem;" id="pdf-inv-date">Datum: 15.07.2026</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; font-size: 0.9rem;">
          <div>
            <strong style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Empfänger (Kunde):</strong>
            <div id="pdf-inv-client" style="font-weight: bold; margin-top: 4px; font-size: 1.05rem;">Google Cloud DE</div>
            <div id="pdf-inv-order" style="color: #475569; font-size: 0.85rem; margin-top: 2px;">Auftrag: NEX-2980</div>
          </div>
          <div style="text-align: right;">
            <strong style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Zahlungskondition:</strong>
            <div id="pdf-inv-payment" style="font-weight: bold; margin-top: 4px;">Banküberweisung</div>
            <div id="pdf-inv-due" style="color: #ef4444; font-size: 0.85rem; margin-top: 2px;">Fällig bis: 29.07.2026</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.9rem;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left; color: #334155;">
              <th style="padding: 10px;">Position</th>
              <th style="padding: 10px; text-align: right;">Netto</th>
              <th style="padding: 10px; text-align: right;">USt (20%)</th>
              <th style="padding: 10px; text-align: right;">Brutto</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 10px;" id="pdf-inv-pos">Dienstleistung gem. Auftrag NEX-2980</td>
              <td style="padding: 12px 10px; text-align: right;" id="pdf-inv-net">€ 3.750,00</td>
              <td style="padding: 12px 10px; text-align: right;" id="pdf-inv-vat">€ 750,00</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold;" id="pdf-inv-gross">€ 4.500,00</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; border: 1px dashed #cbd5e1;">
          <span>System-Provision Partner (15%): <strong id="pdf-inv-comm">€ 675,00</strong></span>
          <span style="padding: 4px 10px; border-radius: 12px; font-weight: bold; background: #dcfce7; color: #15803d;" id="pdf-inv-status-badge">BEZAHLT</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button class="btn btn-secondary" id="btn-close-pdf-modal" style="background: #e2e8f0; color: #0f172a; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Schließen</button>
          <button class="btn btn-primary" onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">🖨️ Drucken / PDF Speichern</button>
        </div>
      </div>
    </div>
  `;

  renderInvoiceRows();
  setupFinanceEventListeners();
}

function renderInvoiceRows() {
  const tableBody = document.getElementById("fin-table-body");
  if (!tableBody) return;

  const searchVal = (document.getElementById("fin-search-input")?.value || "").toLowerCase();
  const statusVal = document.getElementById("fin-status-filter")?.value || "ALL";

  let invoices = getInvoices();

  if (statusVal !== "ALL") {
    invoices = invoices.filter(i => i.status === statusVal);
  }
  if (searchVal) {
    invoices = invoices.filter(i => 
      i.id.toLowerCase().includes(searchVal) ||
      i.client.toLowerCase().includes(searchVal) ||
      i.orderId.toLowerCase().includes(searchVal)
    );
  }

  tableBody.innerHTML = "";

  if (invoices.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Rechnungen für die Filterkriterien vorhanden.</td></tr>`;
    return;
  }

  invoices.forEach(inv => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--color-border)";
    tr.innerHTML = `
      <td style="padding: 12px 16px;">
        <div style="font-weight: 700; color: #60a5fa;">${inv.id}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${inv.paymentMethod}</div>
      </td>
      <td style="padding: 12px 16px;">
        <div style="font-weight: 600; color: var(--color-text-primary);">${inv.client}</div>
        <div style="font-size: 0.75rem; color: var(--color-accent);">Auftrag: ${inv.orderId}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div>Ausgestellt: ${inv.date}</div>
        <div style="font-size: 0.75rem; color: ${inv.status === 'Überfällig' ? '#f87171' : 'var(--color-text-muted)'};">Fällig: ${inv.dueDate}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div>Netto: € ${(inv.netAmount || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">USt (${inv.vatRate}%): € ${(inv.vatAmount || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.95rem; font-weight: 700; color: #10b981;">
        € ${(inv.grossAmount || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div>€ ${(inv.commissionAmount || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${inv.commissionRate}% Provision</div>
      </td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 3px 10px; border-radius: 10px; background: ${inv.status === 'Bezahlt' ? 'rgba(16, 185, 129, 0.2)' : (inv.status === 'Offen' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)')}; color: ${inv.status === 'Bezahlt' ? '#34d399' : (inv.status === 'Offen' ? '#fbbf24' : '#f87171')};">
          ${inv.status}
        </span>
      </td>
      <td style="padding: 12px 16px; text-align: right;">
        <button class="btn btn-sm fin-view-pdf-btn" data-id="${inv.id}" style="margin-right: 6px;">PDF Vorschau</button>
        <button class="btn btn-sm fin-toggle-status-btn" data-id="${inv.id}" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3);">Status</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".fin-view-pdf-btn").forEach(btn => {
    btn.addEventListener("click", () => openPdfModal(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".fin-toggle-status-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleInvoiceStatus(btn.getAttribute("data-id")));
  });
}

function setupFinanceEventListeners() {
  const searchInput = document.getElementById("fin-search-input");
  const statusFilter = document.getElementById("fin-status-filter");
  const closePdfBtn = document.getElementById("btn-close-pdf-modal");

  if (searchInput) searchInput.addEventListener("input", renderInvoiceRows);
  if (statusFilter) statusFilter.addEventListener("change", renderInvoiceRows);
  if (closePdfBtn) {
    closePdfBtn.addEventListener("click", () => {
      document.getElementById("fin-pdf-modal").style.display = "none";
    });
  }
}

function openPdfModal(invoiceId) {
  const inv = getInvoices().find(i => i.id === invoiceId);
  if (!inv) return;

  const modal = document.getElementById("fin-pdf-modal");
  if (!modal) return;

  document.getElementById("pdf-inv-num").textContent = inv.id;
  document.getElementById("pdf-inv-date").textContent = `Datum: ${inv.date}`;
  document.getElementById("pdf-inv-client").textContent = inv.client;
  document.getElementById("pdf-inv-order").textContent = `Auftrag Referenz: ${inv.orderId}`;
  document.getElementById("pdf-inv-payment").textContent = inv.paymentMethod;
  document.getElementById("pdf-inv-due").textContent = `Fällig bis: ${inv.dueDate}`;
  document.getElementById("pdf-inv-pos").textContent = `Dienstleistung gem. Auftrag ${inv.orderId}`;
  document.getElementById("pdf-inv-net").textContent = `€ ${inv.netAmount.toLocaleString('de-AT', { minimumFractionDigits: 2 })}`;
  document.getElementById("pdf-inv-vat").textContent = `€ ${inv.vatAmount.toLocaleString('de-AT', { minimumFractionDigits: 2 })}`;
  document.getElementById("pdf-inv-gross").textContent = `€ ${inv.grossAmount.toLocaleString('de-AT', { minimumFractionDigits: 2 })}`;
  document.getElementById("pdf-inv-comm").textContent = `€ ${inv.commissionAmount.toLocaleString('de-AT', { minimumFractionDigits: 2 })}`;

  const badge = document.getElementById("pdf-inv-status-badge");
  if (badge) {
    badge.textContent = inv.status.toUpperCase();
    if (inv.status === "Bezahlt") {
      badge.style.background = "#dcfce7";
      badge.style.color = "#15803d";
    } else if (inv.status === "Offen") {
      badge.style.background = "#fef3c7";
      badge.style.color = "#b45309";
    } else {
      badge.style.background = "#fee2e2";
      badge.style.color = "#b91c1c";
    }
  }

  modal.style.display = "flex";
}

function toggleInvoiceStatus(invoiceId) {
  const invoices = getInvoices();
  const inv = invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  if (inv.status === "Offen") inv.status = "Bezahlt";
  else if (inv.status === "Bezahlt") inv.status = "Überfällig";
  else inv.status = "Offen";

  saveInvoices(invoices);
  renderFinanceView();
}
