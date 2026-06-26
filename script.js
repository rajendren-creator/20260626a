const studentTable = document.getElementById('studentTable');
const detectedPhraseEl = document.getElementById('detectedPhrase');
const presentCountEl = document.getElementById('presentCount');
const absentCountEl = document.getElementById('absentCount');
const unmarkedCountEl = document.getElementById('unmarkedCount');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const autoAbsentBtn = document.getElementById('autoAbsentBtn');
const resetBtn = document.getElementById('resetBtn');

const students = [
  { roll: 1, name: 'Aanya Patel', status: 'Unmarked' },
  { roll: 2, name: 'Rohan Sharma', status: 'Unmarked' },
  { roll: 3, name: 'Mira Iyer', status: 'Unmarked' },
  { roll: 4, name: 'Kabir Singh', status: 'Unmarked' },
  { roll: 5, name: 'Sara Khan', status: 'Unmarked' },
  { roll: 6, name: 'Devika Rao', status: 'Unmarked' },
  { roll: 7, name: 'Arjun Das', status: 'Unmarked' },
  { roll: 8, name: 'Meera Nair', status: 'Unmarked' },
  { roll: 9, name: 'Nikhil Mehta', status: 'Unmarked' },
  { roll: 10, name: 'Yashvi Gupta', status: 'Unmarked' }
];

let recognition = null;
let listening = false;

function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    detectedPhraseEl.textContent = 'Speech recognition is not supported in this browser.';
    startBtn.disabled = true;
    stopBtn.disabled = true;
    return null;
  }

  const recognitionInstance = new SpeechRecognition();
  recognitionInstance.interimResults = false;
  recognitionInstance.continuous = true;
  recognitionInstance.lang = 'en-US';

  recognitionInstance.addEventListener('result', (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ')
      .trim();

    processVoiceInput(transcript);
  });

  recognitionInstance.addEventListener('end', () => {
    if (listening) {
      recognitionInstance.start();
    }
  });

  recognitionInstance.addEventListener('error', (event) => {
    detectedPhraseEl.textContent = 'Voice recognition error: ' + event.error;
  });

  return recognitionInstance;
}

function renderStudents() {
  studentTable.innerHTML = '';

  students.forEach((student) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td class="${getStatusClass(student.status)}">${student.status}</td>
    `;

    row.addEventListener('click', () => {
      toggleStudentStatus(student.roll);
    });

    studentTable.appendChild(row);
  });

  updateSummary();
}

function getStatusClass(status) {
  switch (status) {
    case 'Present':
      return 'status-present';
    case 'Absent':
      return 'status-absent';
    default:
      return 'status-unmarked';
  }
}

function updateSummary() {
  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;
  const unmarkedCount = students.filter((s) => s.status === 'Unmarked').length;

  presentCountEl.textContent = presentCount;
  absentCountEl.textContent = absentCount;
  unmarkedCountEl.textContent = unmarkedCount;
}

function toggleStudentStatus(roll) {
  const student = students.find((item) => item.roll === roll);
  if (!student) return;

  if (student.status === 'Present') {
    student.status = 'Absent';
  } else if (student.status === 'Absent') {
    student.status = 'Unmarked';
  } else {
    student.status = 'Present';
  }

  renderStudents();
}

function processVoiceInput(phrase) {
  detectedPhraseEl.textContent = phrase || 'No voice input recognized.';
  if (!phrase) return;

  const normalized = phrase.toLowerCase();
  const explicitAbsent = /\b(absent|not present|not here|missing|away)\b/.test(normalized);
  const explicitPresent = /\b(present|here|checked in|in class)\b/.test(normalized);

  const student = findStudentFromPhrase(normalized);
  if (!student) {
    detectedPhraseEl.textContent = `Could not match a student for: "${phrase}"`;
    return;
  }

  if (explicitAbsent) {
    student.status = 'Absent';
  } else if (explicitPresent) {
    student.status = 'Present';
  } else {
    student.status = 'Present';
  }

  renderStudents();
}

function findStudentFromPhrase(text) {
  const rollMatch = text.match(/\b(?:roll(?: number)?|rn|r)?\s*(\d{1,3})\b/);
  if (rollMatch) {
    const roll = parseInt(rollMatch[1], 10);
    const byRoll = students.find((student) => student.roll === roll);
    if (byRoll) {
      return byRoll;
    }
  }

  const words = text.replace(/[.,]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const onlyName = words.filter((word) => !/^(roll|number|rn|present|absent|here|not|is|checked|in|class|missing|away)$/.test(word));
  const query = onlyName.join(' ');
  if (!query) return null;

  const matchByName = students.find((student) => {
    const studentName = student.name.toLowerCase();
    return onlyName.every((token) => studentName.includes(token));
  });

  return matchByName || null;
}

function fillAbsentStudents() {
  let updated = 0;
  students.forEach((student) => {
    if (student.status === 'Unmarked') {
      student.status = 'Absent';
      updated += 1;
    }
  });
  renderStudents();
  detectedPhraseEl.textContent = updated
    ? `Auto-filled ${updated} absent student(s).`
    : 'All students are already marked.';
}

function resetAttendance() {
  students.forEach((student) => {
    student.status = 'Unmarked';
  });
  detectedPhraseEl.textContent = 'Attendance has been reset.';
  renderStudents();
}

function updateControls() {
  startBtn.disabled = listening;
  stopBtn.disabled = !listening;
}

startBtn.addEventListener('click', () => {
  if (!recognition) {
    recognition = createRecognition();
    if (!recognition) return;
  }

  listening = true;
  recognition.start();
  updateControls();
  detectedPhraseEl.textContent = 'Listening for student roll number and name...';
});

stopBtn.addEventListener('click', () => {
  listening = false;
  if (recognition) {
    recognition.stop();
  }
  updateControls();
});

autoAbsentBtn.addEventListener('click', fillAbsentStudents);
resetBtn.addEventListener('click', resetAttendance);

renderStudents();
