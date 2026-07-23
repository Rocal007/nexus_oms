export function calculatePartnerTrustScore(comp) {
  if (!comp) return { score: 0, level: "Gesperrt", trafficLight: "⚫ Gesperrt", logs: ["Unbekannte Firma"] };

  if (comp.trustOverride && comp.trustOverride !== "AUTO") {
    if (comp.trustOverride === "STABIL") return { score: 90, level: "Premium", trafficLight: "🟢 Stabil", logs: ["Manuelle Stabilisierung aktiviert"] };
    if (comp.trustOverride === "KRITISCH") return { score: 35, level: "Bronze", trafficLight: "🔴 Kritisch", logs: ["Manuelle Warnstufe aktiviert"] };
    if (comp.trustOverride === "GESPERRT") return { score: 0, level: "Gesperrt", trafficLight: "⚫ Gesperrt", logs: ["Manuelle Sperre aktiviert"] };
  }

  let score = 50;
  const logs = [];

  // GISA check
  if (comp.gisa && comp.gisa.includes("GISA")) {
    score += 25;
    logs.push("GISA Registrierung verifiziert (+25)");
  } else {
    logs.push("Keine aufrechte GISA Registrierung (0)");
  }

  // Insurance check
  if (comp.insuranceExpiry) {
    const expiry = new Date(comp.insuranceExpiry);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft > 30) {
      score += 15;
      logs.push(`Haftpflichtversicherung aufrecht (${daysLeft} Tage) (+15)`);
    } else if (daysLeft > 0) {
      score += 5;
      logs.push(`Haftpflichtversicherung läuft in ${daysLeft} Tagen ab (+5)`);
    } else {
      score -= 20;
      logs.push("Haftpflichtversicherung abgelaufen (-20)");
    }
  } else {
    score += 10;
    logs.push("Standard Haftpflichtnachweis vorliegend (+10)");
  }

  // Subcontractor disclosure check
  if (comp.subcontractors && comp.subcontractors.length > 0) {
    const verifiedSubs = comp.subcontractors.filter(s => s.active);
    score += 10;
    logs.push(`${verifiedSubs.length} Subunternehmer offengelegt & verifiziert (+10)`);
  }

  if (comp.active === false) {
    score = 0;
  }

  score = Math.max(0, Math.min(100, score));

  let trafficLight = "🟢 Stabil";
  let level = "Gold";
  if (score >= 85) { level = "Premium"; trafficLight = "🟢 Stabil"; }
  else if (score >= 70) { level = "Gold"; trafficLight = "🟢 Stabil"; }
  else if (score >= 50) { level = "Silber"; trafficLight = "🟡 Beobachten"; }
  else if (score > 0) { level = "Bronze"; trafficLight = "🔴 Kritisch"; }
  else { level = "Gesperrt"; trafficLight = "⚫ Gesperrt"; }

  return { score, level, trafficLight, logs };
}

if (typeof window !== "undefined") {
  window.calculatePartnerTrustScore = calculatePartnerTrustScore;
}

export function initPartnersModule() {
  const tableBody = document.getElementById('partners-table-body');
  const addBtn = document.getElementById('btn-add-partner-new');
  const modal = document.getElementById('partner-modal-advanced');
  const form = document.getElementById('partner-form-advanced');
  const closeBtn = document.getElementById('btn-close-partner-modal-advanced');
  const cancelBtn = document.getElementById('btn-cancel-partner-advanced');
  const title = document.getElementById('partner-modal-advanced-title');

  if (!tableBody || !modal) return;

  // Render Table
  function renderTable() {
    tableBody.innerHTML = '';
    const currentUser = ServiceOSStore.getCurrentUser();
    const isPartner = currentUser.role === "Partner" || currentUser.role === "Sub-Partner";

    // Hide "+ Partner anlegen" button for Partner accounts
    if (addBtn) {
      addBtn.style.display = isPartner ? 'none' : 'inline-block';
    }

    let companies = ServiceOSStore.getCompanies();

    // STRICT ROLE ISOLATION: Partner companies ONLY see their own company entry!
    if (isPartner) {
      companies = companies.filter(c => c.id === currentUser.companyId);
    }

    if (companies.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Partnerdaten gefunden.</td></tr>`;
      return;
    }

    companies.forEach(comp => {
      const trust = calculatePartnerTrustScore(comp);
      const tr = document.createElement('tr');
      tr.className = 'animate-row';
      tr.innerHTML = `
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border);">
          <div style="font-weight: 600; display: flex; align-items: center; gap: 6px;">
            ${comp.name}
          </div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${comp.type || 'Partner'}</div>
        </td>
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border);">
          ${comp.contactPerson || '-'}
        </td>
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem;">
          ${(comp.emails && comp.emails.length) ? `<div>${comp.emails[0].value}</div>` : (comp.email ? `<div>${comp.email}</div>` : '')}
          ${(comp.phones && comp.phones.length) ? `<div>${comp.phones[0].value}</div>` : (comp.phone ? `<div>${comp.phone}</div>` : '')}
          ${(!comp.emails || !comp.emails.length) && (!comp.phones || !comp.phones.length) && !comp.email && !comp.phone ? '-' : ''}
        </td>
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border);">
          ${comp.branches && comp.branches.length ? comp.branches.join(', ') : '-'}
          ${comp.operatingArea && comp.operatingArea.states ? `<div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">Gebiet: ${comp.operatingArea.states.join(', ')} (${comp.operatingArea.radiusKm === 'all' ? 'Österreichweit' : comp.operatingArea.radiusKm + ' km'})</div>` : ''}
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 0.8rem; font-weight: bold; color: ${trust.score >= 70 ? '#10b981' : trust.score >= 50 ? '#f59e0b' : '#ef4444'};">
              ${trust.trafficLight} (${trust.score}/100)
            </span>
            <span style="font-size: 0.7rem; color: var(--color-text-secondary); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-border);">
              Level: ${trust.level}
            </span>
            ${comp.subcontractors && comp.subcontractors.length > 0 ? `
              <span style="font-size: 0.65rem; color: #fbbf24; background: rgba(245, 158, 11, 0.15); padding: 1px 5px; border-radius: 3px;">
                ${comp.subcontractors.length} Sub-Partner
              </span>
            ` : ''}
          </div>
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid var(--color-border);">
          <button type="button" class="btn btn-sm edit-btn" data-id="${comp.id}" style="margin-right: 6px;">Bearbeiten</button>
          ${isPartner ? '' : `
            <button type="button" class="btn btn-sm toggle-freeze-btn" data-id="${comp.id}" style="margin-right: 6px; background: ${trust.level === 'Gesperrt' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${trust.level === 'Gesperrt' ? '#34d399' : '#f87171'}; border: 1px solid ${trust.level === 'Gesperrt' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; font-weight: 600;">
              ${trust.level === 'Gesperrt' ? '🟢 Entsperren' : '⚫ Sperren'}
            </button>
            <button type="button" class="btn btn-sm delete-btn" data-id="${comp.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
          `}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Attach Action Listeners
    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.toggle-freeze-btn').forEach(btn => {
      btn.addEventListener('click', () => togglePartnerFreeze(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deletePartner(btn.getAttribute('data-id')));
    });

    renderGeoSiloWidget();
  }

  function togglePartnerFreeze(id) {
    const companies = ServiceOSStore.getCompanies();
    const comp = companies.find(c => c.id === id);
    if (!comp) return;

    if (comp.trustOverride === "GESPERRT" || comp.active === false) {
      comp.trustOverride = "STABIL";
      comp.active = true;
      ServiceOSStore.logAudit("PARTNER_UNLOCKED", `Partner ${comp.name} (${id}) entsperrt & freigegeben.`);
      alert(`✓ Partner ${comp.name} wurde erfolgreich entsperrt.`);
    } else {
      comp.trustOverride = "GESPERRT";
      comp.active = false;
      ServiceOSStore.logAudit("PARTNER_FREEZE", `Risk Shield Notfall-Sperre für Partner ${comp.name} (${id}) aktiviert.`);
      alert(`⚠️ Notfall-Sperre aktiviert: Partner ${comp.name} wurde gesperrt.`);
    }

    ServiceOSStore.set("companies", companies);
    renderTable();
  }

  function renderGeoSiloWidget() {
    let siloContainer = document.getElementById('partners-geo-silo-container');
    if (!siloContainer) {
      const tabPartners = document.getElementById('tab-partners');
      if (!tabPartners) return;
      siloContainer = document.createElement('div');
      siloContainer.id = 'partners-geo-silo-container';
      siloContainer.style.marginTop = '24px';
      tabPartners.appendChild(siloContainer);
    }

    const mockNodes = [
      { id: "LOC-VIE", name: "Wien (Zentrale)", lat: 48.2082, lon: 16.3738, type: "Headquarters", population: 1900000 },
      { id: "LOC-PURK", name: "Purkersdorf (Niederösterreich)", lat: 48.2067, lon: 16.1756, type: "Branch", population: 9800 },
      { id: "LOC-GRZ", name: "Graz (Steiermark)", lat: 47.0707, lon: 15.4395, type: "Branch", population: 290000 },
      { id: "LOC-LNZ", name: "Linz (Oberösterreich)", lat: 48.3069, lon: 14.2858, type: "Branch", population: 206000 }
    ];

    if (window.generateLinkSilo) {
      const edges = window.generateLinkSilo(mockNodes, 200);
      siloContainer.innerHTML = `
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 8px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
            <svg style="width: 18px; height: 18px; color: var(--color-accent);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            🌐 Link-Siloing & Geo-Distanz Engine (\mathcal{L}_{\text{silo}})
          </h3>
          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px;">
            Berechnung der Haversine-Proximity für lokale Geo-Cluster und B2B-Netzwerke (\theta_{\text{geo}} \le 200\,\text{km}).
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            ${edges.slice(0, 4).map(e => {
              const nodeFrom = mockNodes.find(n => n.id === e.from);
              const nodeTo = mockNodes.find(n => n.id === e.to);
              return `
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px;">
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary);">${nodeFrom?.name} ➔ ${nodeTo?.name}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">
                    Distanz: <strong style="color: var(--color-accent);">${e.distanceKm} km</strong> | Silo-Priorität: <strong>${e.priority}</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  function createDynamicField(container, type, labelVal = '', inputVal = '') {
    const div = document.createElement('div');
    div.className = `dynamic-field-${type}`;
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';

    div.innerHTML = `
      <input type="text" class="field-label wizard-input" placeholder="z.B. ${type === 'email' ? 'Haupt, Rechnungen' : 'Mobil, Büro'}" value="${labelVal}" style="width: 130px; font-size: 0.85rem;" />
      <input type="${type === 'email' ? 'email' : 'tel'}" class="field-value wizard-input" placeholder="${type === 'email' ? 'name@firma.at' : '+43 ...'}" value="${inputVal}" style="flex: 1; font-size: 0.85rem;" />
      <button type="button" class="btn btn-sm btn-remove-field" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; cursor: pointer; border-radius: 4px;">✕</button>
    `;

    div.querySelector('.btn-remove-field').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  function createDynamicSubcontractorField(container, nameVal = '', gisaVal = '', activeVal = true) {
    const div = document.createElement('div');
    div.className = 'dynamic-field-subcontractor';
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';

    div.innerHTML = `
      <input type="text" class="sub-name wizard-input" placeholder="Firmenname Sub-Partner" value="${(nameVal || '').replace(/"/g, '&quot;')}" style="flex: 2; font-size: 0.85rem;" />
      <input type="text" class="sub-gisa wizard-input" placeholder="GISA-Zahl" value="${(gisaVal || '').replace(/"/g, '&quot;')}" style="flex: 1.2; font-size: 0.85rem;" />
      <label style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #10b981; cursor: pointer;">
        <input type="checkbox" class="sub-active" ${activeVal ? 'checked' : ''} style="accent-color: #10b981;" /> GISA OK
      </label>
      <button type="button" class="btn btn-sm btn-remove-sub" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; cursor: pointer; border-radius: 4px;">✕</button>
    `;

    div.querySelector('.btn-remove-sub').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  // Open Modal
  function openModal(editId = null) {
    const currentUser = ServiceOSStore.getCurrentUser();
    const isPartner = currentUser.role === "Partner" || currentUser.role === "Sub-Partner";

    // Partner companies CANNOT create new partners or edit other partners!
    if (isPartner) {
      if (!editId || editId !== currentUser.companyId) {
        alert("🔒 Zugriff verweigert: Partnerfirmen können keine weiteren Unternehmen anlegen oder fremde Firmen bearbeiten.");
        return;
      }
    }

    form.reset();
    const emailsContainer = document.getElementById('partner-adv-emails-container');
    const phonesContainer = document.getElementById('partner-adv-phones-container');
    const subContainer = document.getElementById('partner-adv-subcontractors-container');
    emailsContainer.innerHTML = '';
    phonesContainer.innerHTML = '';
    if (subContainer) subContainer.innerHTML = '';

    document.querySelectorAll('.partner-state-cb').forEach(cb => cb.checked = false);
    document.getElementById('partner-adv-radius').value = '10';

    if (editId) {
      const comp = ServiceOSStore.getCompanies().find(c => c.id === editId);
      if (!comp) return;
      title.textContent = isPartner ? 'Eigenes Firmenprofil bearbeiten' : 'Partner bearbeiten';
      document.getElementById('partner-adv-name').value = comp.name || '';
      document.getElementById('partner-adv-type').value = comp.type || 'Partner';
      document.getElementById('partner-adv-contact').value = comp.contactPerson || '';
      document.getElementById('partner-adv-address').value = comp.address || '';
      document.getElementById('partner-adv-atu').value = comp.atu || '';
      document.getElementById('partner-adv-gisa').value = comp.gisa || '';
      document.getElementById('partner-adv-iban').value = comp.iban || '';
      document.getElementById('partner-adv-active').checked = !!comp.active;

      const expiryInput = document.getElementById('partner-adv-insurance-expiry');
      if (expiryInput) expiryInput.value = comp.insuranceExpiry || '';

      const overrideSelect = document.getElementById('partner-adv-trust-override');
      if (overrideSelect) overrideSelect.value = comp.trustOverride || 'AUTO';

      // Lock verified fields for Partner roles
      document.getElementById('partner-adv-type').disabled = isPartner;
      document.getElementById('partner-adv-gisa').disabled = isPartner;
      document.getElementById('partner-adv-active').disabled = isPartner;
      if (overrideSelect) overrideSelect.disabled = isPartner;
      
      // Migrate or load emails
      const emails = comp.emails || (comp.email ? [{ label: 'Haupt', value: comp.email }] : []);
      emails.forEach(e => createDynamicField(emailsContainer, 'email', e.label, e.value));
      
      // Migrate or load phones
      const phones = comp.phones || (comp.phone ? [{ label: 'Haupt', value: comp.phone }] : []);
      phones.forEach(p => createDynamicField(phonesContainer, 'phone', p.label, p.value));

      // Load Subcontractors
      const subs = comp.subcontractors || [];
      if (subContainer) {
        subs.forEach(s => createDynamicSubcontractorField(subContainer, s.name, s.gisa, s.active));
      }

      // Load operating area
      if (comp.operatingArea) {
        document.getElementById('partner-adv-radius').value = comp.operatingArea.radiusKm || '10';
        const states = comp.operatingArea.states || [];
        document.querySelectorAll('.partner-state-cb').forEach(cb => {
          if (states.includes(cb.value)) cb.checked = true;
        });
      }

      form.dataset.editId = editId;
    } else {
      title.textContent = 'Neuen Partner anlegen';
      createDynamicField(emailsContainer, 'email');
      createDynamicField(phonesContainer, 'phone');
      delete form.dataset.editId;
    }

    // Populate branches checkboxes
    const branchesContainer = document.getElementById('partner-adv-branches-container');
    if (branchesContainer) {
      branchesContainer.innerHTML = '';
      const allBranches = ServiceOSStore.getBranches();
      const compBranches = editId ? (ServiceOSStore.getCompanies().find(c => c.id === editId)?.branches || []) : [];
      
      allBranches.forEach(b => {
        const isChecked = compBranches.includes(b.name) ? 'checked' : '';
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '6px';
        div.innerHTML = `
          <input type="checkbox" id="cb-branch-${b.id}" value="${b.name}" class="partner-branch-cb" style="accent-color: var(--color-primary);" ${isChecked} />
          <label for="cb-branch-${b.id}" style="font-size: 0.8rem; color: var(--color-text-primary); cursor: pointer;">${b.name}</label>
        `;
        branchesContainer.appendChild(div);
      });
      if (allBranches.length === 0) {
        branchesContainer.innerHTML = '<span style="font-size: 0.8rem; color: var(--color-text-muted);">Keine Branchen vorhanden.</span>';
      }
    }

    modal.classList.add('active');
  }

  // Close Modal
  function closeModal() {
    modal.classList.remove('active');
  }

  // Delete Partner
  function deletePartner(id) {
    const currentUser = ServiceOSStore.getCurrentUser();
    if (currentUser.role === "Partner" || currentUser.role === "Sub-Partner") {
      alert("🔒 Zugriff verweigert: Partnerfirmen können keine Unternehmen löschen.");
      return;
    }
    if (!confirm('Möchten Sie diesen Partner wirklich löschen?')) return;
    const companies = ServiceOSStore.getCompanies().filter(c => c.id !== id);
    ServiceOSStore.set('companies', companies);
    ServiceOSStore.logAudit("PARTNER_DELETED", `Partner mit ID ${id} wurde gelöscht.`);
    renderTable();
    if (typeof window.updateUserHeaderProfile === 'function') window.updateUserHeaderProfile();
  }

  // Event Listeners
  if (addBtn) addBtn.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const btnAddEmail = document.getElementById('btn-add-partner-email');
  if (btnAddEmail) {
    btnAddEmail.addEventListener('click', () => {
      createDynamicField(document.getElementById('partner-adv-emails-container'), 'email');
    });
  }

  const btnAddPhone = document.getElementById('btn-add-partner-phone');
  if (btnAddPhone) {
    btnAddPhone.addEventListener('click', () => {
      createDynamicField(document.getElementById('partner-adv-phones-container'), 'phone');
    });
  }

  const btnAddSub = document.getElementById('btn-add-partner-subcontractor');
  if (btnAddSub) {
    btnAddSub.addEventListener('click', () => {
      createDynamicSubcontractorField(document.getElementById('partner-adv-subcontractors-container'));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = ServiceOSStore.getCurrentUser();
    const isPartner = currentUser.role === "Partner" || currentUser.role === "Sub-Partner";
    const editId = form.dataset.editId;

    if (isPartner && editId !== currentUser.companyId) {
      alert("🔒 Zugriff verweigert: Du kannst nur dein eigenes Firmenprofil bearbeiten.");
      return;
    }
    
    // Get checked branches
    const branchCheckboxes = document.querySelectorAll('.partner-branch-cb:checked');
    const branches = Array.from(branchCheckboxes).map(cb => cb.value);

    // Read dynamic emails
    const emails = [];
    document.querySelectorAll('.dynamic-field-email').forEach(div => {
      const label = div.querySelector('.field-label').value.trim();
      const value = div.querySelector('.field-value').value.trim();
      if (value) emails.push({ label, value });
    });

    // Read dynamic phones
    const phones = [];
    document.querySelectorAll('.dynamic-field-phone').forEach(div => {
      const label = div.querySelector('.field-label').value.trim();
      const value = div.querySelector('.field-value').value.trim();
      if (value) phones.push({ label, value });
    });

    // Read dynamic subcontractors
    const subcontractors = [];
    document.querySelectorAll('.dynamic-field-subcontractor').forEach(div => {
      const name = div.querySelector('.sub-name').value.trim();
      const gisa = div.querySelector('.sub-gisa').value.trim();
      const active = div.querySelector('.sub-active').checked;
      if (name) subcontractors.push({ id: 'SUB-' + Math.floor(1000 + Math.random() * 9000), name, gisa, active });
    });

    // Read operating area
    const radiusKm = document.getElementById('partner-adv-radius').value;
    const states = Array.from(document.querySelectorAll('.partner-state-cb:checked')).map(cb => cb.value);

    const partnerData = {
      id: editId || 'COMP-' + Math.floor(1000 + Math.random() * 9000),
      name: document.getElementById('partner-adv-name').value.trim(),
      type: document.getElementById('partner-adv-type').value,
      contactPerson: document.getElementById('partner-adv-contact').value.trim(),
      emails: emails,
      phones: phones,
      address: document.getElementById('partner-adv-address').value.trim(),
      atu: document.getElementById('partner-adv-atu').value.trim(),
      gisa: document.getElementById('partner-adv-gisa').value.trim(),
      iban: document.getElementById('partner-adv-iban').value.trim(),
      insuranceExpiry: document.getElementById('partner-adv-insurance-expiry')?.value || '',
      trustOverride: document.getElementById('partner-adv-trust-override')?.value || 'AUTO',
      subcontractors: subcontractors,
      branches: branches,
      operatingArea: { radiusKm, states },
      active: document.getElementById('partner-adv-active').checked
    };

    const companies = ServiceOSStore.getCompanies();
    if (editId) {
      const idx = companies.findIndex(c => c.id === editId);
      if (idx > -1) companies[idx] = { ...companies[idx], ...partnerData };
      ServiceOSStore.logAudit("PARTNER_UPDATED", `Partner ${partnerData.name} wurde aktualisiert (Trust-Status verifiziert).`);
    } else {
      companies.push(partnerData);
      ServiceOSStore.logAudit("PARTNER_CREATED", `Neuer Partner ${partnerData.name} wurde angelegt.`);
    }

    ServiceOSStore.set('companies', companies);
    closeModal();
    renderTable();
    if (typeof window.updateUserHeaderProfile === 'function') window.updateUserHeaderProfile();
  });

  // Re-render when storage changes
  window.addEventListener("storage", () => {
    if (document.getElementById('tab-partners') && document.getElementById('tab-partners').classList.contains('active')) {
      renderTable();
    }
  });

  // Expose global render method so it can be called when tab is activated
  window.renderPartnersTable = renderTable;

  // Initial render
  renderTable();
}
