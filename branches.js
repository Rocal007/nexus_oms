// branches.js - Logic for the Branchen Module

export function initBranchesModule() {
  const tableBody = document.getElementById('branches-table-body');
  const addBtn = document.getElementById('btn-add-branch');
  const modal = document.getElementById('branch-modal');
  const form = document.getElementById('branch-form');
  const closeBtn = document.getElementById('btn-close-branch-modal');
  const cancelBtn = document.getElementById('btn-cancel-branch');
  const title = document.getElementById('branch-modal-title');

  if (!tableBody || !modal) return;

  // Function to append a single subcategory input row
  function addSubcategoryRow(value = '', groupName = '') {
    const container = document.getElementById('branch-subcats-rows-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'subcat-input-row';
    if (groupName) {
      row.dataset.group = groupName;
    }
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    row.style.width = '100%';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'wizard-input branch-subcat-field';
    input.value = value;
    input.placeholder = groupName ? `z.B. ${groupName} Unterpunkt` : 'z.B. Unterbereich Name';
    input.style.flex = '1';
    input.style.minWidth = '0';
    input.style.width = '100%';
    input.style.height = '40px';
    input.style.padding = '0 14px';
    input.style.fontSize = '0.9rem';
    input.style.background = 'rgba(15, 23, 42, 0.8)';
    input.style.border = '1px solid var(--color-border)';
    input.style.borderRadius = 'var(--border-radius-sm)';
    input.style.color = 'var(--color-text-primary)';
    input.style.boxSizing = 'border-box';

    // Pressing Enter adds the next line dynamically
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubcategoryRow('', groupName);
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-subcat-row-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.style.width = '40px';
    removeBtn.style.minWidth = '40px';
    removeBtn.style.height = '40px';
    removeBtn.style.flexShrink = '0';
    removeBtn.style.background = 'rgba(239, 68, 68, 0.15)';
    removeBtn.style.color = '#ef4444';
    removeBtn.style.border = '1px solid rgba(239, 68, 68, 0.4)';
    removeBtn.style.borderRadius = 'var(--border-radius-sm)';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.display = 'inline-flex';
    removeBtn.style.alignItems = 'center';
    removeBtn.style.justifyContent = 'center';
    removeBtn.style.fontWeight = 'bold';
    removeBtn.style.fontSize = '1.1rem';
    removeBtn.title = 'Zeile löschen';

    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      row.remove();
    });

    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);

    if (!value) {
      setTimeout(() => input.focus(), 50);
    }
  }

  // Add group header divider inside rows container
  function addGroupHeader(titleText) {
    const container = document.getElementById('branch-subcats-rows-container');
    if (!container) return;

    const header = document.createElement('div');
    header.className = 'subcat-group-header';
    header.dataset.groupTitle = titleText;
    header.style.marginTop = '12px';
    header.style.marginBottom = '4px';
    header.style.padding = '6px 10px';
    header.style.background = 'rgba(59, 130, 246, 0.1)';
    header.style.borderLeft = '3px solid #60a5fa';
    header.style.borderRadius = '4px';
    header.style.color = '#60a5fa';
    header.style.fontSize = '0.85rem';
    header.style.fontWeight = '600';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    header.innerHTML = `
      <span>📌 ${titleText}</span>
      <button type="button" class="btn-add-in-group" style="background: none; border: none; color: #60a5fa; font-size: 0.75rem; cursor: pointer; text-decoration: underline;">+ Zeile in Gruppe</button>
    `;

    header.querySelector('.btn-add-in-group').addEventListener('click', () => {
      addSubcategoryRow('', titleText);
    });

    container.appendChild(header);
  }

  // Delegated listener for + Zeile hinzufügen button
  document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'btn-add-subcat-row' || e.target.closest('#btn-add-subcat-row'))) {
      e.preventDefault();
      addSubcategoryRow('');
    }
  });

  // Render Table
  function renderTable() {
    tableBody.innerHTML = '';
    const branches = ServiceOSStore.getBranches();

    if (branches.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Branchen gefunden.</td></tr>`;
      return;
    }

    branches.forEach(branch => {
      const subcats = branch.subcategories || [];
      let subcatBadges = '';

      if (subcats.length > 0) {
        if (typeof subcats[0] === 'object' && subcats[0] !== null && 'group' in subcats[0]) {
          subcatBadges = subcats.map(g => `
            <div style="margin-bottom: 6px;">
              <div style="font-size: 0.75rem; font-weight: 600; color: #60a5fa; margin-bottom: 2px;">${g.group}:</div>
              ${(g.items || []).map(s => `<span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); margin-right: 4px; display: inline-block; margin-bottom: 4px;">${s}</span>`).join('')}
            </div>
          `).join('');
        } else {
          subcatBadges = subcats.map(s => `<span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); margin-right: 4px; display: inline-block; margin-bottom: 4px;">${s}</span>`).join('');
        }
      } else {
        subcatBadges = `<span style="font-size: 0.75rem; color: var(--color-text-muted);">-</span>`;
      }

      const tr = document.createElement('tr');
      tr.className = 'animate-row';
      tr.innerHTML = `
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-family: monospace;">
          ${branch.id}
        </td>
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); font-weight: 600;">
          ${branch.name}
        </td>
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; max-width: 320px;">
          ${subcatBadges}
        </td>
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem;">
          ${branch.description || '-'}
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid var(--color-border);">
          ${branch.active 
            ? `<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Aktiv</span>` 
            : `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Inaktiv</span>`}
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid var(--color-border);">
          <button type="button" class="btn btn-sm edit-btn" data-id="${branch.id}" style="margin-right: 8px;">Bearbeiten</button>
          <button type="button" class="btn btn-sm delete-btn" data-id="${branch.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Attach Action Listeners
    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteBranch(btn.getAttribute('data-id')));
    });
  }

  // Open Modal
  function openModal(editId = null) {
    form.reset();
    const rowsContainer = document.getElementById('branch-subcats-rows-container');
    if (rowsContainer) rowsContainer.innerHTML = '';

    if (editId) {
      const branch = ServiceOSStore.getBranches().find(b => b.id === editId);
      if (!branch) return;
      title.textContent = 'Branche bearbeiten';
      document.getElementById('branch-name').value = branch.name || '';
      document.getElementById('branch-description').value = branch.description || '';
      document.getElementById('branch-active').checked = !!branch.active;
      
      const subcats = branch.subcategories || [];
      if (subcats.length > 0) {
        if (typeof subcats[0] === 'object' && subcats[0] !== null && 'group' in subcats[0]) {
          subcats.forEach(g => {
            addGroupHeader(g.group);
            (g.items || []).forEach(sub => addSubcategoryRow(sub, g.group));
          });
        } else {
          subcats.forEach(sub => addSubcategoryRow(sub));
        }
      } else {
        addSubcategoryRow('');
      }
      form.dataset.editId = editId;
    } else {
      title.textContent = 'Neue Branche anlegen';
      addSubcategoryRow('');
      delete form.dataset.editId;
    }
    modal.classList.add('active');
  }

  // Close Modal
  function closeModal() {
    modal.classList.remove('active');
  }

  // Delete Branch
  function deleteBranch(id) {
    if (!confirm('Möchten Sie diese Branche wirklich löschen?')) return;
    const branches = ServiceOSStore.getBranches().filter(b => b.id !== id);
    ServiceOSStore.set('branches', branches);
    ServiceOSStore.logAudit("BRANCH_DELETED", `Branche mit ID ${id} wurde gelöscht.`);
    renderTable();
  }

  // Event Listeners
  if (addBtn) addBtn.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = form.dataset.editId;

    const rowsContainer = document.getElementById('branch-subcats-rows-container');
    const groupHeaders = rowsContainer ? Array.from(rowsContainer.querySelectorAll('.subcat-group-header')) : [];

    let subcategories = [];

    if (groupHeaders.length > 0) {
      groupHeaders.forEach(gh => {
        const groupTitle = gh.dataset.groupTitle;
        const items = [];
        let nextEl = gh.nextElementSibling;
        while (nextEl && !nextEl.classList.contains('subcat-group-header')) {
          const field = nextEl.querySelector('.branch-subcat-field');
          if (field && field.value.trim().length > 0) {
            items.push(field.value.trim());
          }
          nextEl = nextEl.nextElementSibling;
        }
        if (items.length > 0) {
          subcategories.push({ group: groupTitle, items: items });
        }
      });
    } else {
      const subcatFields = document.querySelectorAll('.branch-subcat-field');
      subcategories = Array.from(subcatFields)
        .map(field => field.value.trim())
        .filter(val => val.length > 0);
    }

    const branchData = {
      id: editId || 'BR-' + Math.floor(1000 + Math.random() * 9000),
      name: document.getElementById('branch-name').value.trim(),
      subcategories: subcategories,
      description: document.getElementById('branch-description').value.trim(),
      active: document.getElementById('branch-active').checked
    };

    const branches = ServiceOSStore.getBranches();
    if (editId) {
      const idx = branches.findIndex(b => b.id === editId);
      if (idx > -1) branches[idx] = { ...branches[idx], ...branchData };
      ServiceOSStore.logAudit("BRANCH_UPDATED", `Branche ${branchData.name} wurde aktualisiert.`);
    } else {
      branches.push(branchData);
      ServiceOSStore.logAudit("BRANCH_CREATED", `Neue Branche ${branchData.name} wurde angelegt.`);
    }

    ServiceOSStore.set('branches', branches);
    closeModal();
    renderTable();
  });

  // Re-render when storage changes
  window.addEventListener("storage", () => {
    if (document.getElementById('tab-branches') && document.getElementById('tab-branches').classList.contains('active')) {
      renderTable();
    }
  });

  // Expose global render method
  window.renderBranchesTable = renderTable;

  // Initial render
  renderTable();
}
