/* =========================================================
   Corp911 – Corporation Suspension Checker
   script.js
   ========================================================= */

'use strict';

/* ---- Tab Switching ---- */

function switchTab(tabName) {
  const allBtns   = document.querySelectorAll('.tab-btn');
  const allPanels = document.querySelectorAll('.tab-panel');

  allBtns.forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  allPanels.forEach(panel => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.classList.toggle('active', isActive);
    panel.hidden = !isActive;
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      switchTab(btn.dataset.tab);
    }
  });
});

/* ---- Suspension Search ---- */

const stateNames = {
  CA:'California', TX:'Texas', FL:'Florida', NY:'New York', IL:'Illinois',
  PA:'Pennsylvania', OH:'Ohio', GA:'Georgia', NC:'North Carolina', MI:'Michigan',
  NJ:'New Jersey', VA:'Virginia', WA:'Washington', AZ:'Arizona', MA:'Massachusetts',
  TN:'Tennessee', IN:'Indiana', MO:'Missouri', MD:'Maryland', WI:'Wisconsin',
  CO:'Colorado', MN:'Minnesota', SC:'South Carolina', AL:'Alabama', LA:'Louisiana',
  KY:'Kentucky', OR:'Oregon', OK:'Oklahoma', CT:'Connecticut', UT:'Utah',
  NV:'Nevada', AR:'Arkansas', MS:'Mississippi', KS:'Kansas', NM:'New Mexico',
  NE:'Nebraska', WV:'West Virginia', ID:'Idaho', HI:'Hawaii', NH:'New Hampshire',
  ME:'Maine', MT:'Montana', RI:'Rhode Island', DE:'Delaware', SD:'South Dakota',
  ND:'North Dakota', AK:'Alaska', DC:'District of Columbia', VT:'Vermont', WY:'Wyoming'
};

/** Deterministic mock status based on the search inputs */
function getMockResult(corpName, state, entityNum) {
  const seed = (corpName + state + entityNum).length % 3;
  const statuses = ['suspended', 'active', 'pending'];
  const status = statuses[seed];

  const entityTypes = ['Corporation', 'Limited Liability Company', 'S-Corporation', 'Professional Corporation'];
  const agents = ['CT Corporation System', 'Registered Agents Inc.', 'National Registered Agents', 'The Corporation Trust Company'];

  // Mock date fields – deterministic based on corp name chars so same input yields same output
  const FILED_YEAR_BASE = 2008;
  const FILED_YEAR_RANGE = 15;          // spans 2008–2022
  const ENTITY_NUM_HASH_MULT = 31;      // classic Bernstein hash multiplier
  const ENTITY_NUM_RANGE = 9000000;     // keeps entity number in 7-digit range
  const ENTITY_NUM_BASE  = 1000000;     // ensures number starts with 1–9

  const filedYear = FILED_YEAR_BASE + (corpName.charCodeAt(0) % FILED_YEAR_RANGE);
  const filedDate = new Date(filedYear, corpName.charCodeAt(1) % 12, (corpName.charCodeAt(2) % 28) + 1);
  const sinceYear = 2019 + (corpName.length % 4);

  return {
    name:       corpName,
    state:      stateNames[state] || state,
    stateCode:  state,
    entityNum:  entityNum || 'C' + Math.abs(corpName.split('').reduce((a, c) => ((a * ENTITY_NUM_HASH_MULT + c.charCodeAt(0)) >>> 0), 0) % ENTITY_NUM_RANGE + ENTITY_NUM_BASE),
    type:       entityTypes[corpName.length % 4],
    filed:      filedDate.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
    since:      `${['January','February','March','April','May','June','July','August','September','October','November','December'][sinceYear % 12]} ${2020 + sinceYear % 4}`,
    agent:      agents[corpName.charCodeAt(0) % 4],
    status,
  };
}

function validateSearchForm() {
  let valid = true;
  const name  = document.getElementById('corp-name');
  const state = document.getElementById('corp-state');
  const nameErr  = document.getElementById('corp-name-error');
  const stateErr = document.getElementById('corp-state-error');

  nameErr.textContent  = '';
  stateErr.textContent = '';

  if (!name.value.trim()) {
    nameErr.textContent = 'Corporation name is required.';
    name.focus();
    valid = false;
  }
  if (!state.value) {
    stateErr.textContent = 'Please select a state.';
    if (valid) state.focus();
    valid = false;
  }
  return valid;
}

function displayResults(result) {
  const badge = document.getElementById('status-badge');
  badge.className = `status-badge ${result.status}`;
  badge.textContent = result.status.charAt(0).toUpperCase() + result.status.slice(1);

  document.getElementById('results-corp-name').textContent = result.name;
  document.getElementById('result-entity').textContent = result.entityNum;
  document.getElementById('result-state').textContent   = result.state;
  document.getElementById('result-type').textContent    = result.type;
  document.getElementById('result-filed').textContent   = result.filed;
  document.getElementById('result-since').textContent   = result.since;
  document.getElementById('result-agent').textContent   = result.agent;

  const notice = document.getElementById('suspension-notice');
  notice.hidden = result.status !== 'suspended';

  const area = document.getElementById('results-area');
  area.hidden = false;
  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateSearchForm()) return;

  const btn      = document.getElementById('search-btn');
  const btnText  = btn.querySelector('.btn-text');
  const btnLoad  = btn.querySelector('.btn-loader');

  btn.disabled = true;
  btnText.hidden = true;
  btnLoad.hidden = false;

  setTimeout(() => {
    const corpName  = document.getElementById('corp-name').value.trim();
    const state     = document.getElementById('corp-state').value;
    const entityNum = document.getElementById('entity-number').value.trim();

    const result = getMockResult(corpName, state, entityNum);
    displayResults(result);

    btn.disabled = false;
    btnText.hidden = false;
    btnLoad.hidden = true;
  }, 1600);
});

/** "Book Appointment" link inside suspension notice */
document.getElementById('book-from-results').addEventListener('click', () => {
  const corpName = document.getElementById('corp-name').value.trim();
  if (corpName) {
    document.getElementById('appt-corp').value = corpName;
  }
  switchTab('appointments');
  document.getElementById('panel-appointments').scrollIntoView({ behavior: 'smooth' });
});

/* ---- Appointment Slot System ---- */

const TIME_SLOTS = [
  { id: 'am-9',   label: '9:00 AM',  period: 'morning' },
  { id: 'am-10',  label: '10:00 AM', period: 'morning' },
  { id: 'am-11',  label: '11:00 AM', period: 'morning' },
  { id: 'pm-2',   label: '2:00 PM',  period: 'afternoon' },
  { id: 'pm-3',   label: '3:00 PM',  period: 'afternoon' },
  { id: 'pm-4',   label: '4:00 PM',  period: 'afternoon' },
  { id: 'pm-5',   label: '5:00 PM',  period: 'evening' },
];

/** Generate deterministic mock availability for a given date string */
function getSlotAvailability(dateStr) {
  const HASH_MULT = 31;           // Bernstein hash multiplier (shared with entity number hash)
  const SLOT_OFFSET = 7;         // spread slots across the hash space
  const AVAIL_DIVISOR = 3;       // ~2 out of 3 slots are available
  const hash = dateStr.split('').reduce((a, c) => ((a * HASH_MULT + c.charCodeAt(0)) >>> 0), 0);
  return TIME_SLOTS.map((slot, i) => ({
    ...slot,
    available: ((hash + i * SLOT_OFFSET) % AVAIL_DIVISOR) !== 0,   // ~2/3 slots available
  }));
}

let selectedSlotId   = null;
let selectedSlotDate = '';
let selectedSlotLabel = '';

function renderSlots(dateStr) {
  const container = document.getElementById('slots-container');
  const slots = getSlotAvailability(dateStr);

  const periods = {
    morning:   { label: '🌅 Morning',   slots: [] },
    afternoon: { label: '☀️ Afternoon',  slots: [] },
    evening:   { label: '🌆 Evening',    slots: [] },
  };
  slots.forEach(s => periods[s.period].slots.push(s));

  container.textContent = '';

  Object.values(periods).forEach(({ label, slots: pSlots }) => {
    if (!pSlots.length) return;

    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'slots-section-label';
    sectionLabel.textContent = label;
    container.appendChild(sectionLabel);

    const grid = document.createElement('div');
    grid.className = 'slots-grid';

    pSlots.forEach(slot => {
      const isSelected = slot.id === selectedSlotId;
      const stateClass = isSelected ? 'selected' : (slot.available ? 'available' : 'unavailable');
      const availLabel = isSelected ? 'Selected' : (slot.available ? 'Available' : 'Booked');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `slot-btn ${stateClass}`;
      btn.dataset.slotId    = slot.id;
      btn.dataset.slotLabel = slot.label;
      if (!slot.available) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      }

      const timeSpan = document.createElement('span');
      timeSpan.className = 'slot-time';
      timeSpan.textContent = slot.label;

      const availSpan = document.createElement('span');
      availSpan.className = 'slot-avail-label';
      availSpan.textContent = availLabel;

      btn.appendChild(timeSpan);
      btn.appendChild(availSpan);

      if (slot.available || isSelected) {
        btn.addEventListener('click', () => selectSlot(btn.dataset.slotId, btn.dataset.slotLabel, dateStr));
      }

      grid.appendChild(btn);
    });

    container.appendChild(grid);
  });
}

function selectSlot(slotId, slotLabel, dateStr) {
  selectedSlotId    = slotId;
  selectedSlotDate  = dateStr;
  selectedSlotLabel = slotLabel;

  const dateObj    = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone off-by-one issues
  const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  const fullLabel  = `${slotLabel} on ${dateFormatted}`;

  document.getElementById('selected-slot-text').textContent = fullLabel;
  document.getElementById('selected-slot-display').hidden = false;
  document.getElementById('book-btn').disabled = false;
  document.getElementById('slot-error').textContent = '';

  renderSlots(dateStr);
}

function clearSlot() {
  selectedSlotId    = null;
  selectedSlotDate  = '';
  selectedSlotLabel = '';
  document.getElementById('selected-slot-display').hidden = true;
  document.getElementById('book-btn').disabled = true;

  const dateStr = document.getElementById('appt-date').value;
  if (dateStr) renderSlots(dateStr);
}

// Set min date to today
const apptDateInput = document.getElementById('appt-date');
const today = new Date();
apptDateInput.min = today.toISOString().split('T')[0];

// Render slots when date changes
apptDateInput.addEventListener('change', function () {
  if (this.value) {
    selectedSlotId    = null;
    selectedSlotLabel = '';
    selectedSlotDate  = '';
    document.getElementById('selected-slot-display').hidden = true;
    document.getElementById('book-btn').disabled = true;
    renderSlots(this.value);
  } else {
    document.getElementById('slots-container').innerHTML =
      '<p class="slots-placeholder">Please select a date to view available time slots.</p>';
  }
});

document.getElementById('clear-slot-btn').addEventListener('click', clearSlot);

/* ---- Appointment Form Validation & Submission ---- */

function validateApptField(id, errorId, message, customValidator) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errorId);
  if (!el.value.trim() || (customValidator && !customValidator(el.value.trim()))) {
    err.textContent = message;
    return false;
  }
  err.textContent = '';
  return true;
}

function validateApptForm() {
  let valid = true;
  const checks = [
    { id:'appt-name',  errId:'appt-name-error',  msg:'Full name is required.' },
    { id:'appt-email', errId:'appt-email-error',  msg:'A valid email address is required.',
      fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id:'appt-phone', errId:'appt-phone-error',  msg:'A valid phone number is required.',
      fn: v => /^[\d\s\-()+]{7,}$/.test(v) },
    { id:'appt-corp',  errId:'appt-corp-error',   msg:'Corporation name is required.' },
  ];

  checks.forEach(({ id, errId, msg, fn }) => {
    if (!validateApptField(id, errId, msg, fn)) valid = false;
  });

  if (!selectedSlotId) {
    document.getElementById('slot-error').textContent = 'Please select an available time slot before booking.';
    valid = false;
  } else {
    document.getElementById('slot-error').textContent = '';
  }

  return valid;
}

document.getElementById('appt-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateApptForm()) return;

  const name  = document.getElementById('appt-name').value.trim();
  const corp  = document.getElementById('appt-corp').value.trim();
  const email = document.getElementById('appt-email').value.trim();
  const slot  = document.getElementById('selected-slot-text').textContent;

  const confirmText = `Thank you, ${name}! Your appointment for ${corp} has been booked for ${slot}. A confirmation will be sent to ${email}.`;
  document.getElementById('confirmation-text').textContent = confirmText;

  document.querySelector('.appointments-layout').hidden = true;
  document.getElementById('appt-confirmation').hidden = false;
  document.getElementById('appt-confirmation').scrollIntoView({ behavior:'smooth', block:'nearest' });
});

document.getElementById('new-appt-btn').addEventListener('click', () => {
  document.getElementById('appt-form').reset();
  document.getElementById('slots-container').innerHTML =
    '<p class="slots-placeholder">Please select a date to view available time slots.</p>';
  clearSlot();
  document.querySelector('.appointments-layout').hidden = false;
  document.getElementById('appt-confirmation').hidden = true;
  apptDateInput.value = '';
});

/* ---- Keyboard Accessibility: Tab nav with arrow keys ---- */
document.querySelector('.tab-list').addEventListener('keydown', function (e) {
  const tabs   = Array.from(this.querySelectorAll('.tab-btn'));
  const active = document.activeElement;
  const idx    = tabs.indexOf(active);
  if (idx === -1) return;

  let next = -1;
  if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
  if (e.key === 'ArrowLeft')  next = (idx - 1 + tabs.length) % tabs.length;
  if (next !== -1) {
    e.preventDefault();
    tabs[next].focus();
    switchTab(tabs[next].dataset.tab);
  }
});

/* ---- Footer Quick Links ---- */
document.querySelectorAll('.footer-nav-link[data-tab]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    switchTab(this.dataset.tab);
  });
});
