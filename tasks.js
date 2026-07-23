// tasks.js - Meine Aufgaben Modul für Nexus OMS

const DEFAULT_TASKS = [];

export function initTasksModule() {
  const container = document.getElementById("tab-tasks");
  if (!container) return;

  if (!localStorage.getItem("serviceos_tasks")) {
    localStorage.setItem("serviceos_tasks", JSON.stringify(DEFAULT_TASKS));
  }

  renderTasksView();
}

function getTasks() {
  const data = localStorage.getItem("serviceos_tasks");
  return data ? JSON.parse(data) : DEFAULT_TASKS;
}

function saveTasks(tasks) {
  localStorage.setItem("serviceos_tasks", JSON.stringify(tasks));
  window.dispatchEvent(new Event('storage'));
}

export function renderTasksView() {
  const container = document.getElementById("tab-tasks");
  if (!container) return;

  const currentUser = window.ServiceOSStore ? window.ServiceOSStore.getCurrentUser() : { name: "Alex Dev" };
  const allTasks = getTasks();

  const myTasksCount = allTasks.filter(t => t.assignedTo === currentUser.name && t.status !== "Erledigt").length;
  const criticalCount = allTasks.filter(t => (t.priority === "Critical" || t.priority === "High") && t.status !== "Erledigt").length;
  const completedCount = allTasks.filter(t => t.status === "Erledigt").length;

  container.innerHTML = `
    <div class="tasks-module" style="padding: 24px; max-width: 1100px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #3b82f6;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Meine Aufgaben & Task-Management
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Verwaltung von Compliance-Audits, Rechnungsfreigaben und Partner-Aufgaben</p>
        </div>

        <button id="btn-add-task-modal" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neue Aufgabe anlegen
        </button>
      </div>

      <!-- Stats Scorecards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Meine Offenen Aufgaben</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;">${myTasksCount}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Dringend & Kritisch</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #f87171;">${criticalCount}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Erledigte Aufgaben</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;">${completedCount}</div>
        </div>
      </div>

      <!-- Filters & Tabs -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 8px;" id="tasks-filter-tabs">
          <button class="task-filter-btn active" data-filter="MY" style="background: var(--color-primary); color: white; border: none; padding: 8px 16px; border-radius: var(--border-radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Meine Aufgaben</button>
          <button class="task-filter-btn" data-filter="ALL" style="background: rgba(30, 41, 59, 0.6); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 8px 16px; border-radius: var(--border-radius-sm); font-size: 0.85rem; cursor: pointer;">Alle Aufgaben</button>
          <button class="task-filter-btn" data-filter="DONE" style="background: rgba(30, 41, 59, 0.6); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 8px 16px; border-radius: var(--border-radius-sm); font-size: 0.85rem; cursor: pointer;">Erledigt</button>
        </div>

        <div style="min-width: 250px;">
          <input type="text" id="task-search-input" class="wizard-input" placeholder="Aufgabe, Kat, Auftrag suchen..." style="width: 100%; height: 38px; padding: 0 12px; font-size: 0.85rem;">
        </div>
      </div>

      <!-- Task List Container -->
      <div style="display: flex; flex-direction: column; gap: 12px;" id="tasks-list-body">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Create Task Modal -->
    <div class="modal-overlay" id="task-create-modal" style="display: none;">
      <div class="modal-card" style="max-width: 550px; background: var(--color-bg-sidebar); border: 1px solid var(--color-border); box-shadow: var(--shadow-premium);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 1.15rem; font-family: var(--font-heading); color: var(--color-text-primary);">Neue Aufgabe anlegen</h3>
          <button id="btn-close-task-modal" style="background: none; border: none; color: var(--color-text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="task-create-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Titel der Aufgabe</label>
            <input type="text" id="task-title-input" class="wizard-input" required placeholder="z.B. GISA-Validierung für Partner durchführen" style="width: 100%;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Zugewiesen an</label>
              <select id="task-assign-input" class="wizard-input" style="width: 100%;">
                <option value="Alex Dev">Alex Dev (Superadmin)</option>
                <option value="Sarah Admin">Sarah Admin (Administrator)</option>
                <option value="Klaus Müller">Klaus Müller (Partner)</option>
                <option value="Hans Schmid">Hans Schmid (Sub-Partner)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Priorität</label>
              <select id="task-priority-input" class="wizard-input" style="width: 100%;">
                <option value="Normal">Normal</option>
                <option value="High">Hoch (High)</option>
                <option value="Critical">Kritisch (Critical)</option>
                <option value="Low">Niedrig (Low)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Fällig am</label>
              <input type="date" id="task-date-input" class="wizard-input" value="${new Date().toISOString().split('T')[0]}" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kategorie</label>
              <select id="task-cat-input" class="wizard-input" style="width: 100%;">
                <option value="Compliance">Compliance & Legal</option>
                <option value="Finanzen">Finanzen & Abrechnung</option>
                <option value="Partner Onboarding">Partner Onboarding</option>
                <option value="System Audit">System Audit</option>
                <option value="IT Infrastructure">IT Infrastructure</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Beschreibung & Notizen</label>
            <textarea id="task-desc-input" class="wizard-input" rows="3" placeholder="Zusätzliche Details..." style="width: 100%;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-task-modal">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Aufgabe Speichern</button>
          </div>
        </form>
      </div>
    </div>
  `;

  renderTaskList();
  setupTaskEventListeners();
}

function renderTaskList() {
  const container = document.getElementById("tasks-list-body");
  if (!container) return;

  const currentUser = window.ServiceOSStore ? window.ServiceOSStore.getCurrentUser() : { name: "Alex Dev" };
  const searchVal = (document.getElementById("task-search-input")?.value || "").toLowerCase();
  
  const activeTabBtn = document.querySelector(".task-filter-btn.active");
  const filterType = activeTabBtn ? activeTabBtn.getAttribute("data-filter") : "MY";

  let tasks = getTasks();

  if (filterType === "MY") {
    tasks = tasks.filter(t => t.assignedTo === currentUser.name && t.status !== "Erledigt");
  } else if (filterType === "DONE") {
    tasks = tasks.filter(t => t.status === "Erledigt");
  } else if (filterType === "ALL") {
    tasks = tasks.filter(t => t.status !== "Erledigt");
  }

  if (searchVal) {
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchVal) ||
      t.category.toLowerCase().includes(searchVal) ||
      t.description.toLowerCase().includes(searchVal)
    );
  }

  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 32px; text-align: center; color: var(--color-text-muted);">
        Keine Aufgaben für die ausgewählten Kriterien gefunden.
      </div>
    `;
    return;
  }

  tasks.forEach(t => {
    const isDone = t.status === "Erledigt";
    const card = document.createElement("div");
    card.style.background = isDone ? "rgba(15, 23, 42, 0.4)" : "rgba(30, 41, 59, 0.6)";
    card.style.border = "1px solid var(--color-border)";
    card.style.borderRadius = "var(--border-radius-md)";
    card.style.padding = "16px";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifySpaceBetween = "space-between";
    card.style.gap = "16px";
    card.style.transition = "all 0.2s";

    let priorityColor = "#60a5fa";
    let priorityBg = "rgba(59, 130, 246, 0.2)";
    if (t.priority === "Critical") {
      priorityColor = "#f87171";
      priorityBg = "rgba(239, 68, 68, 0.2)";
    } else if (t.priority === "High") {
      priorityColor = "#fbbf24";
      priorityBg = "rgba(245, 158, 11, 0.2)";
    } else if (t.priority === "Low") {
      priorityColor = "#94a3b8";
      priorityBg = "rgba(148, 163, 184, 0.2)";
    }

    card.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1;">
        <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${isDone ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #10b981; cursor: pointer; margin-top: 2px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
            <span style="font-weight: 600; font-size: 1rem; color: ${isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)'}; text-decoration: ${isDone ? 'line-through' : 'none'};">
              ${t.title}
            </span>
            <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: bold; background: ${priorityBg}; color: ${priorityColor};">
              ${t.priority}
            </span>
            <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); color: var(--color-text-secondary); border: 1px solid var(--color-border);">
              ${t.category}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0 0 8px 0; line-height: 1.4;">
            ${t.description}
          </p>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); display: flex; gap: 16px; flex-wrap: wrap;">
            <span>👤 Zugewiesen: <strong>${t.assignedTo}</strong></span>
            <span>📅 Fällig: <strong style="color: ${t.dueDate < new Date().toISOString().split('T')[0] && !isDone ? '#f87171' : 'inherit'};">${t.dueDate}</strong></span>
            ${t.relatedOrder !== '-' ? `<span>🔗 Auftrag: <strong>${t.relatedOrder}</strong></span>` : ''}
          </div>
        </div>
      </div>
      <div>
        <button class="btn btn-sm task-delete-btn" data-id="${t.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
      </div>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll(".task-checkbox").forEach(cb => {
    cb.addEventListener("change", () => toggleTaskStatus(cb.getAttribute("data-id")));
  });

  container.querySelectorAll(".task-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteTask(btn.getAttribute("data-id")));
  });
}

function setupTaskEventListeners() {
  const searchInput = document.getElementById("task-search-input");
  const filterBtns = document.querySelectorAll(".task-filter-btn");
  const btnAdd = document.getElementById("btn-add-task-modal");
  const modal = document.getElementById("task-create-modal");
  const btnClose = document.getElementById("btn-close-task-modal");
  const btnCancel = document.getElementById("btn-cancel-task-modal");
  const form = document.getElementById("task-create-form");

  if (searchInput) searchInput.addEventListener("input", renderTaskList);

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("active");
        b.style.background = "rgba(30, 41, 59, 0.6)";
        b.style.color = "var(--color-text-secondary)";
      });
      btn.classList.add("active");
      btn.style.background = "var(--color-primary)";
      btn.style.color = "white";
      renderTaskList();
    });
  });

  if (btnAdd) btnAdd.addEventListener("click", () => modal.style.display = "flex");
  if (btnClose) btnClose.addEventListener("click", () => modal.style.display = "none");
  if (btnCancel) btnCancel.addEventListener("click", () => modal.style.display = "none");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("task-title-input").value.trim();
      const assignedTo = document.getElementById("task-assign-input").value;
      const priority = document.getElementById("task-priority-input").value;
      const dueDate = document.getElementById("task-date-input").value;
      const category = document.getElementById("task-cat-input").value;
      const description = document.getElementById("task-desc-input").value.trim();

      const tasks = getTasks();
      const newTask = {
        id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
        title,
        assignedTo,
        priority,
        status: "Offen",
        dueDate,
        relatedOrder: "-",
        category,
        description
      };

      tasks.unshift(newTask);
      saveTasks(tasks);
      modal.style.display = "none";
      renderTasksView();
    });
  }
}

function toggleTaskStatus(taskId) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = task.status === "Erledigt" ? "Offen" : "Erledigt";
  saveTasks(tasks);
  renderTasksView();
}

function deleteTask(taskId) {
  if (!confirm("Möchten Sie diese Aufgabe wirklich löschen?")) return;
  const tasks = getTasks().filter(t => t.id !== taskId);
  saveTasks(tasks);
  renderTasksView();
}
