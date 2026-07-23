// ServiceOS Universal Timeline Engine (Audit Trail)

function initTimeline() {
  renderAuditTrail();
  window.addEventListener("storage", renderAuditTrail);

  const clearBtn = document.getElementById("btn-clear-audit");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear the system audit trail? This action is logged.")) {
        ServiceOSStore.set("audit", []);
        ServiceOSStore.logAudit("AUDIT_CLEAR", "System audit logs cleared by user request.");
        renderAuditTrail();
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTimeline);
} else {
  initTimeline();
}

function renderAuditTrail() {
  const auditBody = document.getElementById("audit-list-body");
  if (!auditBody) return;

  auditBody.innerHTML = "";
  const logs = ServiceOSStore.getAuditLogs();

  if (logs.length === 0) {
    auditBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 32px;">No audit records found.</td></tr>`;
    return;
  }

  logs.forEach((log) => {
    const tr = document.createElement("tr");
    tr.className = "animate-row";
    
    // Format timestamp
    const date = new Date(log.timestamp);
    const formattedTime = date.toLocaleString("de-AT", { hour12: false });

    // Determine badge color for action
    let actionBadge = `<span class="badge-status" style="background: rgba(255, 255, 255, 0.05); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${log.action}</span>`;
    
    if (log.action === "USER_SWITCH") {
      actionBadge = `<span class="badge-status" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${log.action}</span>`;
    } else if (log.action === "ORDER_CREATION" || log.action === "WIZARD_INTAKE") {
      actionBadge = `<span class="badge-status" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${log.action}</span>`;
    } else if (log.action === "ORDER_STATUS_CHANGE") {
      actionBadge = `<span class="badge-status" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${log.action}</span>`;
    } else if (log.action === "UNAUTHORIZED_ACCESS_ATTEMPT") {
      actionBadge = `<span class="badge-status" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; animation: pulse 2s infinite;">${log.action}</span>`;
    } else if (log.action === "AUDIT_CLEAR") {
      actionBadge = `<span class="badge-status" style="background: rgba(217, 70, 239, 0.15); color: #d946ef; border: 1px solid rgba(217, 70, 239, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${log.action}</span>`;
    }

    tr.innerHTML = `
      <td style="color: var(--color-text-secondary); font-size: 0.8rem; font-family: monospace;">${formattedTime}</td>
      <td style="font-weight: 500; color: var(--color-text-primary); font-size: 0.85rem;">${log.userName}</td>
      <td style="color: var(--color-text-secondary); font-size: 0.8rem;"><span style="padding: 2px 6px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--color-border);">${log.userRole}</span></td>
      <td>${actionBadge}</td>
      <td style="color: var(--color-text-primary); font-size: 0.85rem;">${log.details}</td>
    `;

    auditBody.appendChild(tr);
  });
}
