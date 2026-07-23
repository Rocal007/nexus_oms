// calendar.js - Basic Calendar Logic

let currentDate = new Date();

const monthNames = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];
const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function initCalendar() {
  renderCalendar();
  
  // Expose to window for inline onclick handlers in HTML
  window.calendarPrevMonth = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  };
  
  window.calendarNextMonth = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  };
  
  window.calendarCurrentMonth = () => {
    currentDate = new Date();
    renderCalendar();
  };
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const monthYearLabel = document.getElementById("calendar-month-year");
  if (!grid || !monthYearLabel) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  monthYearLabel.innerText = `${monthNames[month]} ${year}`;
  
  // Clear grid
  grid.innerHTML = "";
  
  // Add weekday headers
  dayNames.forEach(day => {
    const el = document.createElement("div");
    el.style.background = "var(--color-bg-card)";
    el.style.padding = "12px";
    el.style.textAlign = "center";
    el.style.fontWeight = "bold";
    el.style.color = "var(--color-text-secondary)";
    el.innerText = day;
    grid.appendChild(el);
  });
  
  // Calculate days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();
  
  // Previous month padding
  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement("div");
    el.style.background = "rgba(255,255,255,0.02)";
    el.style.minHeight = "100px";
    el.style.padding = "8px";
    el.style.color = "var(--color-text-muted)";
    el.innerHTML = `<div style="font-weight: 500; margin-bottom: 4px;">${daysInPrevMonth - startOffset + i + 1}</div>`;
    grid.appendChild(el);
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const el = document.createElement("div");
    el.style.background = "var(--color-bg-card)";
    el.style.minHeight = "100px";
    el.style.padding = "8px";
    
    if (isCurrentMonth && i === currentDay) {
      el.style.border = "2px solid var(--color-primary)";
      el.innerHTML = `<div style="font-weight: bold; color: var(--color-primary); margin-bottom: 4px;">${i}</div>`;
    } else {
      el.innerHTML = `<div style="font-weight: 500; margin-bottom: 4px;">${i}</div>`;
    }
    
    // Example: Mockup event on the 15th
    if (i === 15) {
      el.innerHTML += `<div style="font-size: 0.7rem; background: rgba(99, 102, 241, 0.2); color: var(--color-primary); padding: 4px; border-radius: 4px; margin-top: 4px; cursor: pointer;">Entrümpelung Müller</div>`;
    }
    
    grid.appendChild(el);
  }
  
  // Next month padding
  const totalCells = startOffset + daysInMonth;
  const endOffset = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= endOffset; i++) {
    const el = document.createElement("div");
    el.style.background = "rgba(255,255,255,0.02)";
    el.style.minHeight = "100px";
    el.style.padding = "8px";
    el.style.color = "var(--color-text-muted)";
    el.innerHTML = `<div style="font-weight: 500; margin-bottom: 4px;">${i}</div>`;
    grid.appendChild(el);
  }
}
