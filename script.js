/* ----------------------------------------------------------
   State – persisted in localStorage
---------------------------------------------------------- */
let employees = JSON.parse(localStorage.getItem('employees')) || [
  { name: 'Eduarda' },
  { name: 'Isabelle' },
  { name: 'Aline' }
];

let scheduleData = JSON.parse(localStorage.getItem('scheduleData') || '{}');
// scheduleData[`${year}-${month}`] = [{employee, status}, ...]

let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();
let schedule = [];  // active month entries

const calendarElement         = document.getElementById('calendar');
const employeeListElement     = document.getElementById('employeeList');
const monthLabel              = document.getElementById('monthLabel');
const generatePdfButton       = document.getElementById('generatePdf');
const newScheduleButton       = document.getElementById('newSchedule');
const addCollaboratorButton   = document.getElementById('addCollaborator');
const saveTeamButton          = document.getElementById('saveTeam');
const syncStatusButton        = document.getElementById('syncStatus');
const assignmentDaySelect     = document.getElementById('assignmentDay');
const assignmentEmployeeSelect= document.getElementById('assignmentEmployee');
const assignmentStatusSelect  = document.getElementById('assignmentStatus');
const saveAssignmentButton    = document.getElementById('saveAssignment');

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

/* ----------------------------------------------------------
   Storage helpers
---------------------------------------------------------- */
function saveEmployees() {
  localStorage.setItem('employees', JSON.stringify(employees));
}

function saveScheduleMonth() {
  const key = `${currentYear}-${currentMonth}`;
  scheduleData[key] = schedule.map(e => ({
    employee: e.employee,
    status:   e.status
  }));
  localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
}

/* ----------------------------------------------------------
   Schedule helpers
---------------------------------------------------------- */
function getSaturdays(year, month) {
  const saturdays = [];
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    if (date.getDay() === 6) saturdays.push(date);
  }
  return saturdays;
}

/** Find which employee index to start with for a given month.
 *  Looks at the last entry in the previous month and picks the next
 *  employee – so no one who just finished the previous month starts again. */
function getStartIndex(year, month) {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear  = month === 0 ? year - 1 : year;
  const prev = scheduleData[`${prevYear}-${prevMonth}`];
  if (!prev || prev.length === 0 || employees.length === 0) return 0;
  const lastEmp = prev[prev.length - 1].employee;
  const idx = employees.findIndex(e => e.name === lastEmp);
  return idx === -1 ? 0 : (idx + 1) % employees.length;
}

function buildSchedule(year, month) {
  schedule.length = 0;
  const saturdays = getSaturdays(year, month);
  const start = getStartIndex(year, month);
  saturdays.forEach((date, i) => {
    const emp = employees.length > 0
      ? employees[(start + i) % employees.length]
      : { name: '—' };
    schedule.push({ date, employee: emp.name, status: 'pending' });
  });
  saveScheduleMonth();
  populateAssignmentSelects();
}

function loadOrBuildSchedule(year, month) {
  const key = `${year}-${month}`;
  const saved = scheduleData[key];
  const saturdays = getSaturdays(year, month);
  if (saved && saved.length === saturdays.length) {
    schedule.length = 0;
    saved.forEach((e, i) => {
      schedule.push({ date: saturdays[i], employee: e.employee, status: e.status });
    });
    populateAssignmentSelects();
  } else {
    buildSchedule(year, month);
  }
}

/* ----------------------------------------------------------
   Employee sidebar
---------------------------------------------------------- */
function createEmployeeCards() {
  employeeListElement.innerHTML = '';
  employees.forEach((employee, index) => {
    const card = document.createElement('div');
    card.className = 'employee-card';
    card.setAttribute('draggable', 'true');
    card.innerHTML = `
      <input type="text" value="${employee.name}" data-index="${index}" class="employee-name-input" />
      <button class="outline-button remove-button" data-index="${index}">✕</button>`;

    card.addEventListener('dragstart', (e) => {
      const name = card.querySelector('.employee-name-input').value;
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.setData('drag-source', 'sidebar');
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));

    employeeListElement.appendChild(card);
  });

  document.querySelectorAll('.employee-name-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const oldName = employees[idx].name;
      employees[idx].name = e.target.value;
      schedule.forEach(entry => {
        if (entry.employee === oldName) entry.employee = e.target.value;
      });
      saveEmployees();
      saveScheduleMonth();
      populateEmployeeSelect();
      renderCalendar();
    });
  });

  document.querySelectorAll('.remove-button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      employees.splice(idx, 1);
      saveEmployees();
      createEmployeeCards();
      populateEmployeeSelect();
    });
  });
}

/* ----------------------------------------------------------
   Sidebar assignment selects
---------------------------------------------------------- */
function populateEmployeeSelect() {
  assignmentEmployeeSelect.innerHTML = '';
  employees.forEach((emp) => {
    const option = document.createElement('option');
    option.value = emp.name;
    option.textContent = emp.name;
    assignmentEmployeeSelect.appendChild(option);
  });
}

function populateAssignmentSelects() {
  assignmentDaySelect.innerHTML = '';
  schedule.forEach((entry, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${entry.date.getDate()} ${monthNames[currentMonth]}`;
    assignmentDaySelect.appendChild(option);
  });
  populateEmployeeSelect();
}

/* ----------------------------------------------------------
   Calendar rendering
---------------------------------------------------------- */
function getStatusClass(status) {
  if (status === 'on-time') return 'status-green';
  if (status === 'late')    return 'status-orange';
  if (status === 'absent')  return 'status-red';
  return '';
}

function renderCalendar() {
  calendarElement.innerHTML = '';
  monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  dayNames.forEach((name) => {
    const cell = document.createElement('div');
    cell.className = 'day-name';
    cell.textContent = name;
    calendarElement.appendChild(cell);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const emptyCells = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < emptyCells; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell inactive';
    calendarElement.appendChild(empty);
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let satIdx = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    if (date.getDay() === 6) {
      const idx = satIdx; // capture for closures
      const entry = schedule[idx];

      // Drop target events on the cell
      cell.classList.add('droppable');
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('drag-over');
        const empName = e.dataTransfer.getData('text/plain');
        const source  = e.dataTransfer.getData('drag-source');
        if (source === 'calendar') {
          const fromIdx = parseInt(e.dataTransfer.getData('from-index'), 10);
          if (!isNaN(fromIdx) && fromIdx !== idx) {
            // Swap the two entries
            const temp = schedule[fromIdx].employee;
            schedule[fromIdx].employee = schedule[idx].employee;
            schedule[idx].employee = temp;
          }
        } else {
          // Sidebar drop
          schedule[idx].employee = empName;
        }
        saveScheduleMonth();
        renderCalendar();
        populateAssignmentSelects();
      });

      // Draggable assignment chip
      const assignmentWrap = document.createElement('div');
      assignmentWrap.className = 'assignment-wrap';
      assignmentWrap.setAttribute('draggable', 'true');
      assignmentWrap.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', entry.employee);
        e.dataTransfer.setData('drag-source', 'calendar');
        e.dataTransfer.setData('from-index', String(idx));
      });

      const assignmentLabel = document.createElement('div');
      assignmentLabel.className = 'assignment';
      assignmentLabel.textContent = entry.employee || '—';
      assignmentWrap.appendChild(assignmentLabel);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-assignment-btn';
      deleteBtn.title = 'Remover desta data';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        schedule[idx].employee = '—';
        schedule[idx].status = 'pending';
        saveScheduleMonth();
        renderCalendar();
        populateAssignmentSelects();
      });
      assignmentWrap.appendChild(deleteBtn);
      cell.appendChild(assignmentWrap);

      const scheduleNote = document.createElement('div');
      scheduleNote.className = 'schedule-note';
      scheduleNote.textContent = '11h às 12h';
      cell.appendChild(scheduleNote);

      const statusText = document.createElement('div');
      statusText.className = `status-label ${getStatusClass(entry.status)}`;
      if (entry.status === 'on-time') statusText.textContent = '🟢 Pontuou no horário';
      else if (entry.status === 'late') statusText.textContent = '🟠 Fora do horário';
      else if (entry.status === 'absent') statusText.textContent = '🔴 Não pontuou';
      else {
        statusText.textContent = '⏳ Aguardando';
        statusText.className = 'status-label status-pending';
      }
      cell.appendChild(statusText);

      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.textContent = 'Editar';
      editButton.addEventListener('click', () => selectDayForEdit(idx));
      cell.appendChild(editButton);

      satIdx += 1;
    }

    calendarElement.appendChild(cell);
  }
}

/* ----------------------------------------------------------
   Sidebar edit form
---------------------------------------------------------- */
function selectDayForEdit(index) {
  assignmentDaySelect.value = index;
  assignmentEmployeeSelect.value = schedule[index].employee;
  assignmentStatusSelect.value = schedule[index].status;
}

function saveAssignment() {
  const idx = parseInt(assignmentDaySelect.value, 10);
  const entry = schedule[idx];
  if (!entry) return;
  entry.employee = assignmentEmployeeSelect.value;
  entry.status = assignmentStatusSelect.value;
  saveScheduleMonth();
  renderCalendar();
}

/* ----------------------------------------------------------
   Secullum sync simulation
---------------------------------------------------------- */
function simulateSecullumSync() {
  schedule.forEach((entry) => {
    const r = Math.random();
    entry.status = r < 0.2 ? 'absent' : r < 0.45 ? 'late' : 'on-time';
  });
  saveScheduleMonth();
  renderCalendar();
}

/* ----------------------------------------------------------
   Events
---------------------------------------------------------- */
function attachEvents() {
  // Nova Escala – advance to next month with fairness algorithm
  newScheduleButton.addEventListener('click', () => {
    const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    const key = `${nextY}-${nextM}`;
    if (scheduleData[key] && scheduleData[key].length > 0) {
      if (!confirm(`Já existe escala para ${monthNames[nextM]} ${nextY}. Deseja regenerar?`)) return;
    }
    currentMonth = nextM;
    currentYear  = nextY;
    buildSchedule(currentYear, currentMonth);
    renderCalendar();
  });

  // Month navigation arrows
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth -= 1;
    if (currentMonth < 0) { currentMonth = 11; currentYear -= 1; }
    loadOrBuildSchedule(currentYear, currentMonth);
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth += 1;
    if (currentMonth > 11) { currentMonth = 0; currentYear += 1; }
    loadOrBuildSchedule(currentYear, currentMonth);
    renderCalendar();
  });

  addCollaboratorButton.addEventListener('click', () => {
    employees.push({ name: `Colaboradora ${employees.length + 1}` });
    saveEmployees();
    createEmployeeCards();
    populateEmployeeSelect();
  });

  saveTeamButton.addEventListener('click', () => {
    saveEmployees();
    buildSchedule(currentYear, currentMonth);
    renderCalendar();
  });

  saveAssignmentButton.addEventListener('click', saveAssignment);

  syncStatusButton.addEventListener('click', simulateSecullumSync);

  // PDF – dark background matching the app
  generatePdfButton.addEventListener('click', async () => {
    const wrapper = document.querySelector('.page-wrapper');
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#070707',
      logging: false
    });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Escala-Instagram-${monthNames[currentMonth]}-${currentYear}.pdf`);
  });
}

/* ----------------------------------------------------------
   Init
---------------------------------------------------------- */
function init() {
  createEmployeeCards();
  loadOrBuildSchedule(currentYear, currentMonth);
  renderCalendar();
  attachEvents();
}

init();
