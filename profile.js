// profile.js - Benutzer-Profil Modul für Nexus OMS

export function initProfileModule() {
  const container = document.getElementById("tab-profile");
  if (!container) return;

  renderProfileView();
}

export function renderProfileView() {
  const container = document.getElementById("tab-profile");
  if (!container) return;

  const currentUser = window.ServiceOSStore ? window.ServiceOSStore.getCurrentUser() : {
    id: "USR-001",
    name: "Alex Dev",
    role: "Superadmin",
    email: "alex@serviceos.com",
    phone: "+43 1 234 5678",
    company: "Müller Entrümpelung GmbH (Zentrale)",
    gisa: "GISA-12948574",
    language: "de-AT",
    mfa: true
  };

  const allUsers = window.ServiceOSStore ? window.ServiceOSStore.getUsers() : [];
  const allCompanies = window.ServiceOSStore ? window.ServiceOSStore.getCompanies() : [];

  const initials = currentUser.name
    ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "AD";

  const isAdmin = currentUser.role === "Superadmin" || currentUser.role === "Administrator";

  container.innerHTML = `
    <div class="profile-module" style="padding: 24px; max-width: 1000px; margin: 0 auto;">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-premium);">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; border: 3px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
            ${initials}
          </div>
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 4px; color: var(--color-text-primary);" id="profile-display-name">${currentUser.name}</h2>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-size: 0.8rem; padding: 3px 10px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-weight: 600;">${currentUser.role}</span>
              <span style="font-size: 0.85rem; color: var(--color-text-secondary);">${currentUser.email}</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">ID: ${currentUser.id}</span>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-bottom: 4px;">Status Konto-Sicherheit</span>
          <span style="font-size: 0.85rem; font-weight: bold; padding: 4px 12px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: inline-flex; align-items: center; gap: 6px;">
            🛡️ 2FA Geschützt
          </span>
        </div>
      </div>

      <!-- Main Profile Settings Forms -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 28px;">
        <!-- Left: Edit Form -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 20px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">
            👤 Persönliche Angaben & Stammdaten
          </h3>

          <form id="profile-edit-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Vollständiger Name</label>
                <input type="text" id="prof-input-name" class="wizard-input" value="${currentUser.name}" required style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">E-Mail Adresse</label>
                <input type="email" id="prof-input-email" class="wizard-input" value="${currentUser.email}" required style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Telefonnummer</label>
                <input type="text" id="prof-input-phone" class="wizard-input" value="${currentUser.phone || '+43 1 234 5678'}" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Sprache & Region (LINGUA-LOCAL)</label>
                <select id="prof-input-lang" class="wizard-input" style="width: 100%;">
                  <option value="de-AT" ${currentUser.language === 'de-AT' ? 'selected' : ''}>Deutsch (Österreich - de-AT)</option>
                  <option value="de-DE" ${currentUser.language === 'de-DE' ? 'selected' : ''}>Deutsch (Deutschland - de-DE)</option>
                  <option value="de-CH" ${currentUser.language === 'de-CH' ? 'selected' : ''}>Deutsch (Schweiz - de-CH)</option>
                </select>
              </div>
            </div>

            <div style="border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 8px;">
              <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--color-text-primary);">🏢 Zuordnung & Gewerbe-Lizenz (GISA)</h4>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Unternehmen / Hauptpartner</label>
                  <input type="text" id="prof-input-company" class="wizard-input" value="${currentUser.company || 'Müller Entrümpelung GmbH'}" style="width: 100%;">
                </div>
                <div>
                  <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">GISA-Zahl (GewO 1994 AT)</label>
                  <input type="text" id="prof-input-gisa" class="wizard-input" value="${currentUser.gisa || 'GISA-12948574'}" style="width: 100%;">
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
              <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 24px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer;">
                Profil Speichern
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Security & Notification Preferences -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Security Box -->
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
            <h3 style="font-size: 1rem; margin-bottom: 14px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
              🔐 Sicherheit & Zugang
            </h3>
            
            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 12px;">
              Rolle: <strong style="color: var(--color-text-primary);">${currentUser.role}</strong>
            </div>

            <button id="btn-sim-password" class="btn-secondary" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; margin-bottom: 10px;">
              Passwort ändern
            </button>
            <button id="btn-sim-2fa" class="btn-secondary" style="width: 100%; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
              2FA-Schlüssel verwalten
            </button>
          </div>

          <!-- Notification Settings Box -->
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
            <h3 style="font-size: 1rem; margin-bottom: 14px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
              🔔 Benachrichtigungen
            </h3>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: var(--color-text-primary);">
                <input type="checkbox" checked style="accent-color: var(--color-primary);"> E-Mail bei neuen Aufträgen
              </label>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: var(--color-text-primary);">
                <input type="checkbox" checked style="accent-color: var(--color-primary);"> WhatsApp Event-Benachrichtigungen
              </label>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: var(--color-text-primary);">
                <input type="checkbox" checked style="accent-color: var(--color-primary);"> Compliance-Audits & GISA Warnungen
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Console Section: All Accounts Overview -->
      ${isAdmin ? `
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px; box-shadow: var(--shadow-premium);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 1.2rem; font-family: var(--font-heading); color: var(--color-text-primary); display: flex; align-items: center; gap: 10px;">
                <svg style="width: 20px; height: 20px; color: #60a5fa;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                🔑 Admin Console: Alle Systemkonten & Partner-Hierarchie
              </h3>
              <p style="color: var(--color-text-secondary); font-size: 0.85rem;">Übersicht aller Benutzerkonten (Superadmins, Admins, Partnerfirmen, Sub-Partner & Mitarbeiter)</p>
            </div>

            <button id="btn-add-system-user" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 8px 16px; border-radius: var(--border-radius-sm); color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              + Neues Systemkonto anlegen
            </button>
          </div>

          <!-- Accounts Table -->
          <div style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
                  <th style="padding: 12px 14px;">Konto Name / ID</th>
                  <th style="padding: 12px 14px;">Rolle</th>
                  <th style="padding: 12px 14px;">E-Mail & Kontakt</th>
                  <th style="padding: 12px 14px;">Zuordnung (Firma / Partner)</th>
                  <th style="padding: 12px 14px;">GISA Lizenz</th>
                  <th style="padding: 12px 14px; text-align: center;">Status</th>
                  <th style="padding: 12px 14px; text-align: right;">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                ${allUsers.map(u => {
                  const company = allCompanies.find(c => c.id === u.companyId);
                  const parentComp = company && company.parentId ? allCompanies.find(c => c.id === company.parentId) : null;

                  return `
                    <tr style="border-bottom: 1px solid var(--color-border);">
                      <td style="padding: 12px 14px;">
                        <div style="font-weight: 600; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
                          <div style="width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold;">
                            ${u.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          ${u.name}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: ${u.id}</div>
                      </td>
                      <td style="padding: 12px 14px;">
                        <span style="font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 10px; background: ${u.role === 'Superadmin' ? 'rgba(239, 68, 68, 0.2)' : (u.role === 'Administrator' ? 'rgba(59, 130, 246, 0.2)' : (u.role === 'Partner' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'))}; color: ${u.role === 'Superadmin' ? '#f87171' : (u.role === 'Administrator' ? '#60a5fa' : (u.role === 'Partner' ? '#34d399' : '#fbbf24'))};">
                          ${u.role}
                        </span>
                      </td>
                      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-primary);">
                        <div>${u.email}</div>
                      </td>
                      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">
                        <div style="font-weight: 500; color: var(--color-text-primary);">${company ? company.name : 'Zentrale (ServiceOS)'}</div>
                        ${parentComp ? `<div style="font-size: 0.75rem; color: var(--color-text-muted);">Sub-Partner von: ${parentComp.name}</div>` : ''}
                      </td>
                      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">
                        ${company && company.gisa ? `<span style="color: #34d399; font-family: monospace;">✓ ${company.gisa}</span>` : '<span style="color: var(--color-text-muted);">-</span>'}
                      </td>
                      <td style="padding: 12px 14px; text-align: center;">
                        <span style="font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399;">Aktiv</span>
                      </td>
                      <td style="padding: 12px 14px; text-align: right;">
                        <button class="btn btn-sm sys-user-switch-btn" data-id="${u.id}" style="margin-right: 6px;">Konto Wechseln</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

    </div>

    <!-- Create User Modal -->
    <div class="modal-overlay" id="prof-user-modal" style="display: none;">
      <div class="modal-card" style="max-width: 500px; background: var(--color-bg-sidebar); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 1.1rem; color: var(--color-text-primary);">Neues Systemkonto anlegen</h3>
          <button id="btn-close-user-modal" style="background: none; border: none; color: var(--color-text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="prof-user-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Name</label>
            <input type="text" id="add-usr-name" class="wizard-input" required placeholder="z.B. Maria Weber" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">E-Mail</label>
            <input type="email" id="add-usr-email" class="wizard-input" required placeholder="maria@firma.at" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Rolle</label>
            <select id="add-usr-role" class="wizard-input" style="width: 100%;">
              <option value="Administrator">Administrator</option>
              <option value="Partner">Partner</option>
              <option value="Sub-Partner">Sub-Partner</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-user-modal">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Konto Anlegen</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupProfileEventListeners();
}

function setupProfileEventListeners() {
  const form = document.getElementById("profile-edit-form");
  const btnPass = document.getElementById("btn-sim-password");
  const btn2fa = document.getElementById("btn-sim-2fa");
  const btnAddUser = document.getElementById("btn-add-system-user");
  const modalUser = document.getElementById("prof-user-modal");
  const btnCloseUserModal = document.getElementById("btn-close-user-modal");
  const btnCancelUserModal = document.getElementById("btn-cancel-user-modal");
  const userForm = document.getElementById("prof-user-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("prof-input-name").value.trim();
      const email = document.getElementById("prof-input-email").value.trim();
      const phone = document.getElementById("prof-input-phone").value.trim();
      const lang = document.getElementById("prof-input-lang").value;
      const company = document.getElementById("prof-input-company").value.trim();
      const gisa = document.getElementById("prof-input-gisa").value.trim();

      if (window.ServiceOSStore) {
        const currentUser = window.ServiceOSStore.getCurrentUser();
        const updated = {
          ...currentUser,
          name,
          email,
          phone,
          language: lang,
          company,
          gisa
        };

        const users = window.ServiceOSStore.getUsers();
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx > -1) {
          users[idx] = updated;
          window.ServiceOSStore.set("users", users);
        }

        window.ServiceOSStore.logAudit("PROFILE_UPDATED", `Benutzerprofil ${name} (${currentUser.id}) aktualisiert.`);
      }

      // Update avatar and header in UI dynamically
      const avatarEl = document.getElementById("current-user-avatar");
      const nameEl = document.getElementById("current-user-name");
      if (avatarEl && name) {
        avatarEl.textContent = name.split(" ").map(n => n[0]).join("").toUpperCase();
      }
      if (nameEl && name) {
        nameEl.textContent = name;
      }

      alert("✓ Benutzerprofil wurde erfolgreich aktualisiert!");
      renderProfileView();
    });
  }

  if (btnAddUser) {
    btnAddUser.addEventListener("click", () => {
      if (modalUser) modalUser.style.display = "flex";
    });
  }

  if (btnCloseUserModal) btnCloseUserModal.addEventListener("click", () => modalUser.style.display = "none");
  if (btnCancelUserModal) btnCancelUserModal.addEventListener("click", () => modalUser.style.display = "none");

  if (userForm) {
    userForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("add-usr-name").value.trim();
      const email = document.getElementById("add-usr-email").value.trim();
      const role = document.getElementById("add-usr-role").value;

      if (window.ServiceOSStore) {
        const users = window.ServiceOSStore.getUsers();
        const newUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          email,
          role,
          companyId: "COMP-001"
        };
        users.push(newUser);
        window.ServiceOSStore.set("users", users);
        window.ServiceOSStore.logAudit("USER_CREATED", `Neues Systemkonto ${name} (${role}) angelegt.`);
      }

      if (modalUser) modalUser.style.display = "none";
      renderProfileView();
    });
  }

  document.querySelectorAll(".sys-user-switch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-id");
      if (window.ServiceOSStore) {
        window.ServiceOSStore.setCurrentUserId(targetId);
        const userSelect = document.getElementById("role-selector");
        if (userSelect) userSelect.value = targetId;
        alert(`✓ Konto gewechselt zu ID ${targetId}`);
        location.reload();
      }
    });
  });

  if (btnPass) {
    btnPass.addEventListener("click", () => {
      alert("🔐 Ein Link zum Zurücksetzen Ihres Passworts wurde an Ihre E-Mail gesendet.");
    });
  }

  if (btn2fa) {
    btn2fa.addEventListener("click", () => {
      alert("🛡️ 2-Faktor-Authentifizierung (2FA) ist aktiv und mit Ihrer Authenticator-App verknüpft.");
    });
  }
}
