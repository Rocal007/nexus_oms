// crm.js - Kunden CRM Modul für Nexus OMS

const DEFAULT_CUSTOMERS = [];

export function initCrmModule() {
  const container = document.getElementById("tab-crm");
  if (!container) return;

  // Initialize LocalStorage for CRM if not present
  if (!localStorage.getItem("serviceos_customers")) {
    localStorage.setItem("serviceos_customers", JSON.stringify(DEFAULT_CUSTOMERS));
  }

  renderCrmView();
}

function getCustomers() {
  const data = localStorage.getItem("serviceos_customers");
  return data ? JSON.parse(data) : DEFAULT_CUSTOMERS;
}

function saveCustomers(customers) {
  localStorage.setItem("serviceos_customers", JSON.stringify(customers));
  window.dispatchEvent(new Event('storage'));
}

export function renderCrmView() {
  const container = document.getElementById("tab-crm");
  if (!container) return;

  const customers = getCustomers();

  container.innerHTML = `
    <div class="crm-module" style="padding: 24px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: var(--color-primary);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Kunden CRM (Customer Relationship Management)
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Verwaltung von B2B & B2C Kundenstamm, Kontaktpersonen und Umsatzhistorie</p>
        </div>

        <button id="btn-add-customer-crm" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neuen Kunden anlegen
        </button>
      </div>

      <!-- Stats Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Gesamtkunden</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: var(--color-text-primary);" id="crm-stat-total">${customers.length}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">VIP Kunden</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #fbbf24;" id="crm-stat-vip">${customers.filter(c => c.status === 'VIP').length}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">B2B Enterprise</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;" id="crm-stat-b2b">${customers.filter(c => c.type.includes('B2B')).length}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Gesamtumsatz Kunden</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;" id="crm-stat-revenue">€ ${customers.reduce((acc, c) => acc + (c.totalRevenue || 0), 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
          <input type="text" id="crm-search-input" class="wizard-input" placeholder="Kunden nach Name, Ort, E-Mail suchen..." style="width: 100%; height: 40px; padding: 0 14px;">
        </div>
        <select id="crm-type-filter" class="wizard-input" style="width: 200px; height: 40px; padding: 0 12px; cursor: pointer;">
          <option value="ALL">Alle Kundentypen</option>
          <option value="B2B Enterprise">B2B Enterprise</option>
          <option value="B2C Privatkunde">B2C Privatkunde</option>
          <option value="B2B Partner">B2B Partner</option>
          <option value="Öffentlicher Auftraggeber">Öffentlicher Auftraggeber</option>
        </select>
      </div>

      <!-- Customer Table -->
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-premium);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
              <th style="padding: 14px 16px;">Kunde / Firma</th>
              <th style="padding: 14px 16px;">Typ</th>
              <th style="padding: 14px 16px;">Kontaktperson</th>
              <th style="padding: 14px 16px;">Ort / Adresse</th>
              <th style="padding: 14px 16px;">Aufträge & Umsatz</th>
              <th style="padding: 14px 16px; text-align: center;">Status</th>
              <th style="padding: 14px 16px; text-align: right;">Aktionen</th>
            </tr>
          </thead>
          <tbody id="crm-table-body">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal-overlay" id="crm-customer-modal" style="display: none;">
      <div class="modal-card" style="max-width: 650px; background: var(--color-bg-sidebar); border: 1px solid var(--color-border); box-shadow: var(--shadow-premium);">
        <div class="modal-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 id="crm-modal-title" style="font-size: 1.2rem; font-family: var(--font-heading); color: var(--color-text-primary);">Neuen Kunden anlegen</h3>
          <button id="btn-close-crm-modal" style="background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 1.5rem;">&times;</button>
        </div>
        <form id="crm-customer-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kunden- / Firmenname</label>
              <input type="text" id="crm-cust-name" class="wizard-input" required placeholder="z.B. Google Cloud DE" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kundentyp</label>
              <select id="crm-cust-type" class="wizard-input" style="width: 100%;">
                <option value="B2B Enterprise">B2B Enterprise</option>
                <option value="B2C Privatkunde">B2C Privatkunde</option>
                <option value="B2B Partner">B2B Partner</option>
                <option value="Öffentlicher Auftraggeber">Öffentlicher Auftraggeber</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kontaktperson</label>
              <input type="text" id="crm-cust-contact" class="wizard-input" placeholder="z.B. Dr. Martin Weber" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
              <select id="crm-cust-status" class="wizard-input" style="width: 100%;">
                <option value="Aktiv">Aktiv</option>
                <option value="VIP">VIP</option>
                <option value="Inaktiv">Inaktiv</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">E-Mail Adresse</label>
              <input type="email" id="crm-cust-email" class="wizard-input" required placeholder="name@firma.at" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Telefonnummer</label>
              <input type="text" id="crm-cust-phone" class="wizard-input" placeholder="+43 1 23456" style="width: 100%;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Ort / Stadt</label>
              <input type="text" id="crm-cust-city" class="wizard-input" placeholder="Wien" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Vollständige Adresse</label>
              <input type="text" id="crm-cust-address" class="wizard-input" placeholder="Musterstraße 12, 1010 Wien" style="width: 100%;">
            </div>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Notizen & Verträge</label>
            <textarea id="crm-cust-notes" class="wizard-input" rows="3" placeholder="Zusätzliche Notizen, Rahmenverträge..." style="width: 100%;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-crm-modal">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Kunden Speichern</button>
          </div>
        </form>
      </div>
    </div>
  `;

  renderCustomerRows();
  setupCrmEventListeners();
}

function renderCustomerRows() {
  const tableBody = document.getElementById("crm-table-body");
  if (!tableBody) return;

  const searchVal = (document.getElementById("crm-search-input")?.value || "").toLowerCase();
  const typeVal = document.getElementById("crm-type-filter")?.value || "ALL";

  let customers = getCustomers();

  // Apply filters
  if (typeVal !== "ALL") {
    customers = customers.filter(c => c.type === typeVal);
  }
  if (searchVal) {
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(searchVal) ||
      (c.city || "").toLowerCase().includes(searchVal) ||
      (c.email || "").toLowerCase().includes(searchVal) ||
      (c.contactPerson || "").toLowerCase().includes(searchVal)
    );
  }

  tableBody.innerHTML = "";

  if (customers.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Kunden für die ausgewählten Kriterien gefunden.</td></tr>`;
    return;
  }

  customers.forEach(c => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--color-border)";
    tr.innerHTML = `
      <td style="padding: 12px 16px;">
        <div style="font-weight: 600; color: var(--color-text-primary);">${c.name}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: ${c.id}</div>
      </td>
      <td style="padding: 12px 16px;">
        <span style="font-size: 0.8rem; padding: 4px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa;">${c.type}</span>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-primary);">
        <div>${c.contactPerson || '-'}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${c.email}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div style="font-weight: 500; color: var(--color-text-primary);">${c.city || '-'}</div>
        <div style="font-size: 0.75rem;">${c.address || ''}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem;">
        <div style="font-weight: 600; color: #10b981;">€ ${(c.totalRevenue || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${c.totalOrders || 0} Auftrag/Aufträge</div>
      </td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 10px; background: ${c.status === 'VIP' ? 'rgba(245, 158, 11, 0.2)' : (c.status === 'Aktiv' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')}; color: ${c.status === 'VIP' ? '#fbbf24' : (c.status === 'Aktiv' ? '#34d399' : '#f87171')};">
          ${c.status}
        </span>
      </td>
      <td style="padding: 12px 16px; text-align: right;">
        <button class="btn btn-sm crm-edit-btn" data-id="${c.id}" style="margin-right: 6px;">Bearbeiten</button>
        <button class="btn btn-sm crm-delete-btn" data-id="${c.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".crm-edit-btn").forEach(btn => {
    btn.addEventListener("click", () => openCustomerModal(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".crm-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteCustomer(btn.getAttribute("data-id")));
  });
}

function setupCrmEventListeners() {
  const searchInput = document.getElementById("crm-search-input");
  const typeFilter = document.getElementById("crm-type-filter");
  const addBtn = document.getElementById("btn-add-customer-crm");
  const modal = document.getElementById("crm-customer-modal");
  const closeBtn = document.getElementById("btn-close-crm-modal");
  const cancelBtn = document.getElementById("btn-cancel-crm-modal");
  const form = document.getElementById("crm-customer-form");

  if (searchInput) searchInput.addEventListener("input", renderCustomerRows);
  if (typeFilter) typeFilter.addEventListener("change", renderCustomerRows);
  if (addBtn) addBtn.addEventListener("click", () => openCustomerModal());
  if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
  if (cancelBtn) cancelBtn.addEventListener("click", () => modal.style.display = "none");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const editId = form.dataset.editId;
      const customers = getCustomers();

      const custData = {
        id: editId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: document.getElementById("crm-cust-name").value.trim(),
        type: document.getElementById("crm-cust-type").value,
        contactPerson: document.getElementById("crm-cust-contact").value.trim(),
        status: document.getElementById("crm-cust-status").value,
        email: document.getElementById("crm-cust-email").value.trim(),
        phone: document.getElementById("crm-cust-phone").value.trim(),
        city: document.getElementById("crm-cust-city").value.trim(),
        address: document.getElementById("crm-cust-address").value.trim(),
        notes: document.getElementById("crm-cust-notes").value.trim(),
        totalOrders: editId ? (customers.find(c => c.id === editId)?.totalOrders || 0) : 0,
        totalRevenue: editId ? (customers.find(c => c.id === editId)?.totalRevenue || 0.0) : 0.0
      };

      if (editId) {
        const idx = customers.findIndex(c => c.id === editId);
        if (idx > -1) customers[idx] = custData;
      } else {
        customers.push(custData);
      }

      saveCustomers(customers);
      modal.style.display = "none";
      renderCrmView();
    });
  }
}

function openCustomerModal(editId = null) {
  const modal = document.getElementById("crm-customer-modal");
  const form = document.getElementById("crm-customer-form");
  const title = document.getElementById("crm-modal-title");
  if (!modal || !form) return;

  form.reset();

  if (editId) {
    const cust = getCustomers().find(c => c.id === editId);
    if (!cust) return;
    title.textContent = "Kunden bearbeiten";
    document.getElementById("crm-cust-name").value = cust.name || "";
    document.getElementById("crm-cust-type").value = cust.type || "B2B Enterprise";
    document.getElementById("crm-cust-contact").value = cust.contactPerson || "";
    document.getElementById("crm-cust-status").value = cust.status || "Aktiv";
    document.getElementById("crm-cust-email").value = cust.email || "";
    document.getElementById("crm-cust-phone").value = cust.phone || "";
    document.getElementById("crm-cust-city").value = cust.city || "";
    document.getElementById("crm-cust-address").value = cust.address || "";
    document.getElementById("crm-cust-notes").value = cust.notes || "";
    form.dataset.editId = editId;
  } else {
    title.textContent = "Neuen Kunden anlegen";
    delete form.dataset.editId;
  }

  modal.style.display = "flex";
}

function deleteCustomer(id) {
  if (!confirm("Möchten Sie diesen Kunden wirklich aus dem CRM löschen?")) return;
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
  renderCrmView();
}
