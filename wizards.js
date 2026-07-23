// ServiceOS Intake Wizard Engine

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWizard);
} else {
  initWizard();
}

function initWizard() {
  const wizardForm = document.getElementById("wizard-form");
  if (!wizardForm) return;

  const steps = Array.from(document.querySelectorAll(".wizard-panel"));
  const indicators = Array.from(document.querySelectorAll(".wizard-step-indicator"));
  const prevBtn = document.getElementById("wizard-prev-btn");
  const nextBtn = document.getElementById("wizard-next-btn");
  const branchCards = document.querySelectorAll(".branch-card");
  const mediaDrop = document.getElementById("wizard-media-drop");
  const mediaInput = document.getElementById("wizard-media");
  const uploadText = document.getElementById("wizard-upload-text");

  let currentStep = 1;
  let wizardData = {
    sources: [],
    categories: [],
    subcategories: [],
    branch: "Entrümpelung",
    address: {
      plz: "",
      ort: "",
      bundesland: "",
      strasse: "",
      hausnr: "",
      stiege: "",
      tuer: "",
      ausland: ""
    },
    location: "",
    client: "",
    contact: {
      clientPhone: "",
      clientEmail: "",
      vertretung: "",
      vertretungPhone: "",
      vertretungEmail: ""
    },
    description: "",
    mediaCount: 0,
    partnerId: null,
    isOpenOrder: false
  };

  // Helper to render Subcategories dynamically for selected Branch
  function renderSubcategoriesForBranch(branchName) {
    const container = document.getElementById("subcategories-container");
    if (!container) return;

    const branches = (window.ServiceOSStore && typeof window.ServiceOSStore.getBranches === "function")
      ? window.ServiceOSStore.getBranches()
      : [];

    const selectedBranchObj = branches.find(b => b.name === branchName);

    if (!selectedBranchObj || !selectedBranchObj.subcategories || selectedBranchObj.subcategories.length === 0) {
      container.innerHTML = `
        <div style="margin-top: 12px; font-size: 0.85rem; color: var(--color-text-muted);">
          Keine spezifischen Unterbereiche für ${branchName} definiert.
        </div>
      `;
      return;
    }

    const subcats = selectedBranchObj.subcategories;
    const isGrouped = typeof subcats[0] === 'object' && subcats[0] !== null && 'group' in subcats[0];

    if (isGrouped) {
      container.innerHTML = subcats.map(g => `
        <div class="subcat-group" style="display: block; margin-top: 16px; padding: 16px; background: var(--color-bg-sidebar); border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <h4 style="margin-bottom: 12px; font-size: 0.95rem; color: #60a5fa; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
            📌 ${g.group}
          </h4>
          <div class="checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;">
            ${(g.items || []).map(sub => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--color-text-secondary); cursor: pointer;">
                <input type="checkbox" class="wizard-checkbox subcat-checkbox" name="wizard-subcategory" value="${sub}"> ${sub}
              </label>
            `).join('')}
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `
        <div class="subcat-group" style="display: block; margin-top: 16px; padding: 16px; background: var(--color-bg-sidebar); border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <h4 style="margin-bottom: 12px; font-size: 0.95rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
            📌 Unterbereiche & Spezialisierung: <strong style="color: #60a5fa;">${selectedBranchObj.name}</strong>
          </h4>
          <div class="checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
            ${subcats.map(sub => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--color-text-secondary); cursor: pointer;">
                <input type="checkbox" class="wizard-checkbox subcat-checkbox" name="wizard-subcategory" value="${sub}"> ${sub}
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // Populate Branch radio buttons dynamically from ServiceOSStore
  function syncBranchRadios() {
    const branchGrid = document.getElementById("wizard-branch-grid");
    if (branchGrid && window.ServiceOSStore && typeof window.ServiceOSStore.getBranches === "function") {
      const branches = window.ServiceOSStore.getBranches().filter(b => b.active);
      if (branches.length > 0) {
        branchGrid.innerHTML = branches.map((b, idx) => `
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: var(--color-text-secondary); cursor: pointer;">
            <input type="radio" class="wizard-radio wizard-branch" name="wizard-branch" value="${b.name}" ${idx === 0 ? 'checked' : ''}> ${b.name}
          </label>
        `).join('');

        // Initial render for selected branch subcategories
        const selectedRadio = branchGrid.querySelector("input[name='wizard-branch']:checked");
        if (selectedRadio) {
          renderSubcategoriesForBranch(selectedRadio.value);
        }
      }
    }
  }

  syncBranchRadios();

  // Listen for Branch Radio changes to switch Subcategories dynamically
  document.addEventListener("change", (e) => {
    if (e.target && e.target.classList.contains("wizard-branch")) {
      const selectedBranchName = e.target.value;
      wizardData.branch = selectedBranchName;
      renderSubcategoriesForBranch(selectedBranchName);
    }
  });

  // Ausland Toggle Logic
  const btnAuslandToggle = document.getElementById("btn-ausland-toggle");
  const auslandOptions = document.getElementById("ausland-options");
  if (btnAuslandToggle && auslandOptions) {
    btnAuslandToggle.addEventListener("click", () => {
      if (auslandOptions.style.display === "none" || !auslandOptions.style.display) {
        auslandOptions.style.display = "block";
        btnAuslandToggle.innerText = "- Ausland entfernen";
        btnAuslandToggle.style.background = "rgba(220, 38, 38, 0.1)";
        btnAuslandToggle.style.borderColor = "rgba(220, 38, 38, 0.3)";
      } else {
        auslandOptions.style.display = "none";
        btnAuslandToggle.innerText = "+ Ausland / Internationale Fahrt";
        btnAuslandToggle.style.background = "rgba(255,255,255,0.05)";
        btnAuslandToggle.style.borderColor = "var(--color-border)";
        const auslandRadios = document.querySelectorAll("input[name='wizard-ausland']");
        auslandRadios.forEach(r => r.checked = false);
      }
    });
  }

  // Media Drag & Drop Handlers
  if (mediaDrop) {
    mediaDrop.addEventListener("click", () => mediaInput.click());
    
    if (mediaInput) {
      mediaInput.addEventListener("change", (e) => {
        const files = e.target.files;
        wizardData.mediaCount = files.length;
        if (files.length > 0) {
          uploadText.innerText = `${files.length} Bild(er) erfolgreich ausgewählt.`;
          uploadText.style.color = "var(--color-delivered)";
        }
      });
    }

    mediaDrop.addEventListener("dragover", (e) => {
      e.preventDefault();
      mediaDrop.style.borderColor = "var(--color-primary)";
    });

    mediaDrop.addEventListener("dragleave", () => {
      mediaDrop.style.borderColor = "var(--color-border)";
    });

    mediaDrop.addEventListener("drop", (e) => {
      e.preventDefault();
      mediaDrop.style.borderColor = "var(--color-border)";
      const files = e.dataTransfer.files;
      wizardData.mediaCount = files.length;
      if (files.length > 0) {
        uploadText.innerText = `${files.length} Bild(er) erfolgreich abgelegt.`;
        uploadText.style.color = "var(--color-delivered)";
      }
    });
  }

  const wizardDesc = document.getElementById("wizard-description");
  const complianceFeedback = document.getElementById("wizard-compliance-feedback");
  const qnexusBadge = document.getElementById("wizard-qnexus-badge");
  const complianceDetails = document.getElementById("wizard-compliance-details");

  if (wizardDesc) {
    wizardDesc.addEventListener("input", (e) => {
      const text = e.target.value;
      if (text.trim().length === 0) {
        complianceFeedback.style.display = "none";
        return;
      }

      complianceFeedback.style.display = "block";
      
      if (typeof window.calculateQNexusScore === "function") {
        const metrics = window.calculateQNexusScore(text, wizardData.branch, wizardData.partnerId);
        qnexusBadge.innerText = `Q_NEXUS: ${metrics.qNexus}`;
        
        if (metrics.qNexus >= 0.85) {
          qnexusBadge.style.background = "var(--color-delivered-glow)";
          qnexusBadge.style.color = "var(--color-delivered)";
        } else if (metrics.qNexus >= 0.6) {
          qnexusBadge.style.background = "var(--color-pending-glow)";
          qnexusBadge.style.color = "var(--color-pending)";
        } else {
          qnexusBadge.style.background = "var(--color-cancelled-glow)";
          qnexusBadge.style.color = "var(--color-cancelled)";
        }

        let ciceroHtml = "";
        if (window.analyzeCicero7Q) {
          const cicero = window.analyzeCicero7Q(text);
          ciceroHtml = `
            <div style="margin-top: 10px; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--color-border); border-radius: 6px;">
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--color-primary-light); margin-bottom: 6px;">
                🏛️ Cicero 7Q-Completeness-Check: ${(cicero.score * 100).toFixed(0)}% (${cicero.passedCount}/7)
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${Object.entries(cicero.details).map(([key, val]) => `
                  <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${val.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)'}; color: ${val.passed ? '#34d399' : '#94a3b8'}; border: 1px solid ${val.passed ? 'rgba(16, 185, 129, 0.4)' : 'transparent'};">
                    ${val.passed ? '✓' : '✗'} ${key.toUpperCase()}
                  </span>
                `).join('')}
              </div>
            </div>
          `;
        }

        if (metrics.compliance.isCompliant) {
          complianceDetails.innerHTML = `<span style="color: var(--color-delivered);">✓ Alle branchenspezifischen Vorgaben für <strong>${wizardData.branch}</strong> sind erfüllt.</span> ${ciceroHtml}`;
        } else {
          const mods = metrics.compliance.modifications.map(m => `<li>${m}</li>`).join('');
          complianceDetails.innerHTML = `
            <div style="color: var(--color-pending); margin-bottom: 4px;">
              ⚠️ Folgende Bezeichnungen werden automatisch für die Region AT/DE angepasst:
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary);">
              ${mods}
            </ul>
            ${ciceroHtml}
          `;
        }
      }
    });
  }

  function updateStepsUI() {
    steps.forEach((panel, idx) => {
      if (idx + 1 === currentStep) {
        panel.style.display = "block";
        panel.classList.add("active");
      } else {
        panel.style.display = "none";
        panel.classList.remove("active");
      }
    });

    indicators.forEach((ind, idx) => {
      if (idx + 1 === currentStep) {
        ind.classList.add("active");
      } else {
        ind.classList.remove("active");
      }
    });

    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === steps.length) {
      nextBtn.innerText = "Auftrag kostenpflichtig anlegen";
      nextBtn.style.background = "var(--color-delivered)";
    } else {
      nextBtn.innerText = "Weiter";
      nextBtn.style.background = "var(--color-primary)";
    }
  }

  function validateAndSaveStep(step) {
    if (step === 1) {
      const checkedSources = Array.from(document.querySelectorAll("input[name='wizard-source']:checked")).map(el => el.value);
      const selectedBranchRadio = document.querySelector("input[name='wizard-branch']:checked");
      const checkedSubcategories = Array.from(document.querySelectorAll("input[name='wizard-subcategory']:checked")).map(el => el.value);
      
      if (checkedSources.length === 0) {
        alert("Bitte wählen Sie mindestens eine Anfragequelle aus.");
        return false;
      }
      
      wizardData.sources = checkedSources;
      wizardData.branch = selectedBranchRadio ? selectedBranchRadio.value : "Entrümpelung";
      wizardData.subcategories = checkedSubcategories;
      wizardData.categories = [wizardData.branch];
    } else if (step === 2) {
      const plz = document.getElementById("wizard-plz") ? document.getElementById("wizard-plz").value.trim() : "";
      const ort = document.getElementById("wizard-ort") ? document.getElementById("wizard-ort").value.trim() : "";
      
      if (!plz && !ort) {
        alert("Bitte geben Sie zumindest eine Postleitzahl oder einen Ort ein.");
        return false;
      }
      
      wizardData.address.plz = plz;
      wizardData.address.ort = ort;
      wizardData.address.bundesland = document.getElementById("wizard-bundesland") ? document.getElementById("wizard-bundesland").value.trim() : "";
      wizardData.address.strasse = document.getElementById("wizard-strasse") ? document.getElementById("wizard-strasse").value.trim() : "";
      wizardData.address.hausnr = document.getElementById("wizard-hausnr") ? document.getElementById("wizard-hausnr").value.trim() : "";
      wizardData.address.stiege = document.getElementById("wizard-stiege") ? document.getElementById("wizard-stiege").value.trim() : "";
      wizardData.address.tuer = document.getElementById("wizard-tuer") ? document.getElementById("wizard-tuer").value.trim() : "";
      
      const auslandSelected = document.querySelector("input[name='wizard-ausland']:checked");
      wizardData.address.ausland = auslandSelected ? auslandSelected.value : "";

      wizardData.location = `${plz} ${ort}`.trim();
    } else if (step === 3) {
      const client = document.getElementById("wizard-client").value.trim();
      const clientPhone = document.getElementById("wizard-client-phone") ? document.getElementById("wizard-client-phone").value.trim() : "";
      const clientEmail = document.getElementById("wizard-client-email") ? document.getElementById("wizard-client-email").value.trim() : "";
      
      const vertretung = document.getElementById("wizard-vertretung") ? document.getElementById("wizard-vertretung").value.trim() : "";
      const vertretungPhone = document.getElementById("wizard-vertretung-phone") ? document.getElementById("wizard-vertretung-phone").value.trim() : "";
      const vertretungEmail = document.getElementById("wizard-vertretung-email") ? document.getElementById("wizard-vertretung-email").value.trim() : "";
      
      const desc = document.getElementById("wizard-description").value.trim();
      
      if (!client || !desc) {
        alert("Bitte geben Sie den Kundennamen und eine Beschreibung ein.");
        return false;
      }
      
      let finalDesc = desc;
      if (typeof window.calculateQNexusScore === "function") {
        const metrics = window.calculateQNexusScore(desc, wizardData.branch, wizardData.partnerId);
        if (metrics.compliance.correctedText !== desc) {
          document.getElementById("wizard-description").value = metrics.compliance.correctedText;
          finalDesc = metrics.compliance.correctedText;
          alert("Linguistische Anpassungen durchgeführt: Text wurde automatisch für die Zielregion angepasst.");
        }
      }
      
      wizardData.client = client;
      wizardData.contact.clientPhone = clientPhone;
      wizardData.contact.clientEmail = clientEmail;
      wizardData.contact.vertretung = vertretung;
      wizardData.contact.vertretungPhone = vertretungPhone;
      wizardData.contact.vertretungEmail = vertretungEmail;
      wizardData.description = finalDesc;
    } else if (step === 5) {
      const selectedPartner = document.querySelector("input[name='wizard-partner']:checked");
      const isOpenOrder = document.getElementById("wizard-open-order") ? document.getElementById("wizard-open-order").checked : false;
      
      wizardData.partnerId = selectedPartner ? selectedPartner.value : null;
      wizardData.isOpenOrder = isOpenOrder;
    }
    return true;
  }

  function renderStep4Summary() {
    const summaryContainer = document.getElementById("wizard-summary");
    if (!summaryContainer) return;
    
    let subcatText = wizardData.subcategories.length > 0 ? wizardData.subcategories.join(", ") : "Keine ausgewählt";
    
    summaryContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.95rem;">
        <div>
          <strong style="color: var(--color-text-secondary);">Anfragequelle:</strong>
          <div>${wizardData.sources.join(", ") || "Keine"}</div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Branche:</strong>
          <div><span style="font-weight: bold; color: #60a5fa;">${wizardData.branch}</span></div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Unterbereiche:</strong>
          <div>${subcatText}</div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Standort:</strong>
          <div>${wizardData.address.strasse} ${wizardData.address.hausnr}, ${wizardData.address.plz} ${wizardData.address.ort} (${wizardData.address.bundesland || 'AT'}) ${wizardData.address.ausland ? ' - ' + wizardData.address.ausland : ''}</div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Kunde:</strong>
          <div>${wizardData.client} (${wizardData.contact.clientPhone || 'Keine Tel'}, ${wizardData.contact.clientEmail || 'Keine Mail'})</div>
        </div>
        ${wizardData.contact.vertretung ? `
        <div>
          <strong style="color: var(--color-text-secondary);">Vertretung / Ansprechpartner:</strong>
          <div>${wizardData.contact.vertretung} (${wizardData.contact.vertretungPhone || 'Keine Tel'}, ${wizardData.contact.vertretungEmail || 'Keine Mail'})</div>
        </div>` : ''}
        <div style="grid-column: span 2;">
          <strong style="color: var(--color-text-secondary);">Beschreibung & Aufgabenstellung:</strong>
          <div style="background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--color-border); margin-top: 4px;">
            ${wizardData.description}
          </div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Angehängte Medien:</strong>
          <div>${wizardData.mediaCount} Bild(er)</div>
        </div>
      </div>
    `;
  }

  function renderStep5Partners() {
    const partnerContainer = document.getElementById("wizard-partner-list");
    if (!partnerContainer) return;
    
    const partners = ServiceOSStore.getCompanies();
    
    if (partners.length === 0) {
      partnerContainer.innerHTML = `<div style="color: var(--color-text-muted);">Keine registrierten Partnerfirmen im System gefunden.</div>`;
      return;
    }
    
    partnerContainer.innerHTML = partners.map(p => `
      <label style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); cursor: pointer;">
        <input type="radio" name="wizard-partner" value="${p.id}" style="margin-top: 4px; accent-color: var(--color-primary);">
        <div>
          <div style="font-weight: 600; color: var(--color-text-primary);">${p.name} <small style="color: var(--color-text-muted);">(${p.id})</small></div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary);">Branchen: ${p.branches ? p.branches.join(", ") : "Allgemein"}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-muted);">GISA-Status: ${p.gisa ? '✓ aufrecht' : '⚠️ Inaktiv'}</div>
        </div>
      </label>
    `).join('');
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!validateAndSaveStep(currentStep)) return;

      if (currentStep < steps.length) {
        currentStep++;
        if (currentStep === 4) {
          renderStep4Summary();
        } else if (currentStep === 5) {
          renderStep5Partners();
        }
        updateStepsUI();
      } else {
        submitWizard();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepsUI();
      }
    });
  }

  function submitWizard() {
    const orders = ServiceOSStore.getOrders();
    
    let partnerName = "Direktauftrag (Zentrale)";
    if (wizardData.partnerId) {
      const partner = ServiceOSStore.getCompanies().find(c => c.id === wizardData.partnerId);
      if (partner) partnerName = partner.name;
    }

    const genId = window.generateCryptographicId || function(p) { return p + "-" + Math.floor(1000 + Math.random() * 9000); };
    const orderId = genId("ORD");
    const caseId = genId("CAS");
    const caseNumber = genId("SO");

    // Create Case (Fallakte) in Store
    const newCase = ServiceOSStore.createCase({
      id: caseId,
      caseNumber: caseNumber,
      client: wizardData.client,
      location: wizardData.location || (typeof wizardData.address === "string" ? wizardData.address : wizardData.address?.ort || "k.A."),
      branch: wizardData.branch,
      reason: wizardData.description || wizardData.branch,
      subcategories: wizardData.subcategories,
      status: "Pending",
      companyId: wizardData.partnerId || null,
      orders: [orderId],
      author: wizardData.client || "Intake Wizard"
    });

    const newOrder = {
      id: orderId,
      caseId: newCase.id,
      caseNumber: newCase.caseNumber,
      client: wizardData.client,
      branch: wizardData.branch,
      subcategories: wizardData.subcategories,
      description: wizardData.description,
      partner: partnerName,
      partnerId: wizardData.partnerId,
      status: "Pending", // Alle neu angelegten Einträge sind Anfragen
      value: 450.00,
      amount: 450.00, // Standard-Erstkalkulation
      date: new Date().toISOString().split("T")[0],
      location: wizardData.location,
      address: wizardData.address,
      contact: wizardData.contact,
      sources: wizardData.sources
    };

    orders.unshift(newOrder);
    ServiceOSStore.set("orders", orders);
    ServiceOSStore.logAudit("ORDER_CREATED", `Neue Anfrage ${newOrder.id} (Fallakte ${newCase.caseNumber}, ${newOrder.branch}) für ${newOrder.client} angelegt.`);

    alert(`✓ Neue Anfrage ${newOrder.id} (Fallakte ${newCase.caseNumber}) wurde erfolgreich angelegt!`);
    
    currentStep = 1;
    wizardForm.reset();
    updateStepsUI();

    const overviewBtn = document.querySelector("button[data-tab='tab-dashboard']");
    if (overviewBtn) overviewBtn.click();
  }

  updateStepsUI();
}
