const employees = [
  { name: 'Eduarda' },
  { name: 'Isabelle' },
  { name: 'Aline' }
];
const schedule = [];
const calendarElement = document.getElementById('calendar');
const employeeListElement = document.getElementById('employeeList');
const monthLabel = document.getElementById('monthLabel');
const generatePdfButton = document.getElementById('generatePdf');
const newScheduleButton = document.getElementById('newSchedule');
const addCollaboratorButton = document.getElementById('addCollaborator');
const saveTeamButton = document.getElementById('saveTeam');
const syncStatusButton = document.getElementById('syncStatus');
const assignmentDaySelect = document.getElementById('assignmentDay');
const assignmentEmployeeSelect = document.getElementById('assignmentEmployee');
const assignmentStatusSelect = document.getElementById('assignmentStatus');
const saveAssignmentButton = document.getElementById('saveAssignment');

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function createEmployeeCards() {
  employeeListElement.innerHTML = '';
  employees.forEach((employee, index) => {
    const card = document.createElement('div');
    card.className = 'employee-card';
    card.innerHTML = `
      <input type="text" value="${employee.name}" data-index="${index}" class="employee-name-input" />
      <button class="outline-button remove-button" data-index="${index}">Remover</button>`;
    employeeListElement.appendChild(card);
  });

  const inputs = document.querySelectorAll('.employee-name-input');
  inputs.forEach((input) => {
    input.addEventListener('input', (event) => {
      const index = parseInt(event.target.dataset.index, 10);
      employees[index].name = event.target.value;
      populateEmployeeSelect();
    });
  });

  const removeButtons = document.querySelectorAll('.remove-button');
  removeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const index = parseInt(event.target.dataset.index, 10);
      employees.splice(index, 1);
      createEmployeeCards();
      populateEmployeeSelect();
    });
  });
}

function getSaturdays(year, month) {
  const saturdays = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    if (date.getDay() === 6) saturdays.push(date);
  }
  return saturdays;
}

function buildSchedule() {
  schedule.length = 0;
  const saturdays = getSaturdays(currentYear, currentMonth);
  saturdays.forEach((date, index) => {
    const employee = employees[index % employees.length] || { name: 'Sem escala' };
    schedule.push({
      date,
      employee: employee.name,
      status: 'pending',
      checkIn: null,
      checkOut: null
    });
  });
  populateAssignmentSelects();
}

function populateEmployeeSelect() {
  assignmentEmployeeSelect.innerHTML = '';
  employees.forEach((employee) => {
    const option = document.createElement('option');
    option.value = employee.name;
    option.textContent = employee.name;
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

function getStatusBadge(status) {
  if (status === 'on-time') return 'status-green';
  if (status === 'late') return 'status-orange';
  if (status === 'absent') return 'status-red';
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

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const emptyCellsCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  for (let i = 0; i < emptyCellsCount; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell inactive';
    calendarElement.appendChild(emptyCell);
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let saturdayIndex = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentYear, currentMonth, day);
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const isSaturday = date.getDay() === 6;
    if (isSaturday) {
      const entry = schedule[saturdayIndex];
      const assignment = document.createElement('div');
      assignment.className = 'assignment';
      assignment.textContent = `Escala: ${entry.employee}`;
      cell.appendChild(assignment);

      const scheduleNote = document.createElement('div');
      scheduleNote.className = 'schedule-note';
      scheduleNote.textContent = '11h às 12h';
      cell.appendChild(scheduleNote);

      const statusText = document.createElement('div');
      statusText.className = `status-label ${getStatusBadge(entry.status)}`;
      if (entry.status === 'on-time') statusText.textContent = 'Verde: pontuou no horário';
      if (entry.status === 'late') statusText.textContent = 'Laranja: fora do horário';
      if (entry.status === 'absent') statusText.textContent = 'Vermelho: não pontuou';
      if (entry.status === 'pending') {
        statusText.textContent = 'Aguardando dados do Secullum';
        statusText.className = 'status-label status-pending';
      }
      cell.appendChild(statusText);

      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.textContent = 'Editar escala';
      editButton.addEventListener('click', () => selectDayForEdit(saturdayIndex));
      cell.appendChild(editButton);

      saturdayIndex += 1;
    }

    calendarElement.appendChild(cell);
  }
}

function selectDayForEdit(index) {
  assignmentDaySelect.value = index;
  assignmentEmployeeSelect.value = schedule[index].employee;
  assignmentStatusSelect.value = schedule[index].status;
}

function saveAssignment() {
  const selectedIndex = parseInt(assignmentDaySelect.value, 10);
  const entry = schedule[selectedIndex];
  if (!entry) return;

  entry.employee = assignmentEmployeeSelect.value;
  entry.status = assignmentStatusSelect.value;
  renderCalendar();
}

function simulateSecullumSync() {
  schedule.forEach((entry) => {
    const random = Math.random();
    if (random < 0.2) entry.status = 'absent';
    else if (random < 0.45) entry.status = 'late';
    else entry.status = 'on-time';
  });
  renderCalendar();
}

function attachEvents() {
  newScheduleButton.addEventListener('click', () => {
    buildSchedule();
    renderCalendar();
  });

  addCollaboratorButton.addEventListener('click', () => {
    employees.push({ name: `Colaboradora ${employees.length + 1}` });
    createEmployeeCards();
    populateEmployeeSelect();
  });

  saveTeamButton.addEventListener('click', () => {
    buildSchedule();
    renderCalendar();
  });

  saveAssignmentButton.addEventListener('click', () => saveAssignment());

  syncStatusButton.addEventListener('click', () => simulateSecullumSync());

  generatePdfButton.addEventListener('click', async () => {
    const wrapper = document.querySelector('.page-wrapper');
    const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Escala-Instagram-${monthNames[currentMonth]}-${currentYear}.pdf`);
  });
}

function init() {
  createEmployeeCards();
  buildSchedule();
  renderCalendar();
  attachEvents();
}

init();
