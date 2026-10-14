const STORAGE_KEY = "attendease_data_v1";
const $ = (id) => document.getElementById(id);
const today = new Date();
const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
let selectedDate = localDateString(today);
let toastTimer;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.students) && saved.attendance) return saved;
  } catch (error) {
    console.warn("Could not read saved attendance data.", error);
  }
  return { students: [], attendance: {} };
}
let data = loadData();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    showToast("Could not save. Your browser storage may be full.");
    return false;
  }
}
function getRecord(date = selectedDate) {
  if (!data.attendance[date]) data.attendance[date] = {};
  return data.attendance[date];
}
function getStatus(studentId, date = selectedDate) {
  return getRecord(date)[studentId] || "Not marked";
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function renderStats() {
  const students = data.students;
  const statuses = students.map(student => getStatus(student.id));
  const present = statuses.filter(status => status === "Present").length;
  const absent = statuses.filter(status => status === "Absent").length;
  const marked = statuses.filter(status => status === "Present" || status === "Absent" || status === "Late").length;
  const rate = marked ? Math.round((present / marked) * 100) : 0;
  $("totalStudents").textContent = students.length;
  $("presentCount").textContent = present;
  $("absentCount").textContent = absent;
  $("presentFoot").textContent = `${students.length ? Math.round(present / students.length * 100) : 0}% of students`;
  $("attendanceRate").textContent = `${rate}%`;
}
function renderAttendance() {
  const query = $("searchInput").value.trim().toLowerCase();
  const filter = $("statusFilter").value;
  const students = data.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(query) || student.roll.toLowerCase().includes(query);
    const status = getStatus(student.id);
    return matchesSearch && (filter === "all" || status === filter);
  });
  $("attendanceBody").innerHTML = students.map(student => {
    const status = getStatus(student.id);
    return `<tr>
      <td><div class="student-cell"><span class="avatar">${escapeHtml(initials(student.name))}</span><span>${escapeHtml(student.name)}</span></div></td>
      <td><span class="roll-tag">${escapeHtml(student.roll)}</span></td>
      <td><select class="status-select status-${status.replace(/\s/g, '-')}" data-status-id="${student.id}" aria-label="Attendance status for ${escapeHtml(student.name)}">
        ${["Not marked", "Present", "Absent", "Late"].map(option => `<option value="${option}" ${status === option ? "selected" : ""}>${option}</option>`).join("")}
      </select></td>
      <td><div class="quick-actions"><button class="mini-btn" data-quick="${student.id}" data-value="Present">Present</button><button class="mini-btn" data-quick="${student.id}" data-value="Absent">Absent</button></div></td>
    </tr>`;
  }).join("");
  $("emptyState").hidden = students.length !== 0;
  $("showingLabel").textContent = `Showing ${students.length} of ${data.students.length} students`;
  renderStats();
}
function renderRoster() {
  $("rosterList").innerHTML = data.students.map(student => `
    <div class="roster-item">
      <span class="avatar">${escapeHtml(initials(student.name))}</span>
      <div class="roster-info"><strong>${escapeHtml(student.name)}</strong><span>Roll no. ${escapeHtml(student.roll)}</span></div>
      <button class="delete-btn" data-delete="${student.id}" aria-label="Remove ${escapeHtml(student.name)}" title="Remove student">×</button>
    </div>`).join("");
}
function renderAll() {
  renderAttendance();
  renderRoster();
}
function setStatus(studentId, status) {
  getRecord()[studentId] = status;
  renderAttendance();
}
function addStudent(event) {
  event.preventDefault();
  const name = $("studentName").value.trim();
  const roll = $("rollNumber").value.trim();
  if (!name || !roll) return;
  if (data.students.some(student => student.roll.toLowerCase() === roll.toLowerCase())) {
    showToast("That roll number already exists.");
    return;
  }
  data.students.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name, roll });
  saveData();
  $("studentForm").reset();
  renderAll();
  showToast(`${name} added to the roster.`);
}
function exportCsv() {
  const rows = [["Date", "Student Name", "Roll Number", "Status"]];
  data.students.forEach(student => rows.push([
    selectedDate, student.name, student.roll, getStatus(student.id)
  ]));
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-${selectedDate}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("CSV attendance report exported.");
}

$("attendanceDate").value = selectedDate;
$("todayLabel").textContent = today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
$("studentForm").addEventListener("submit", addStudent);
$("searchInput").addEventListener("input", renderAttendance);
$("statusFilter").addEventListener("change", renderAttendance);
$("attendanceDate").addEventListener("change", event => {
  selectedDate = event.target.value || localDateString(new Date());
  event.target.value = selectedDate;
  renderAttendance();
});
$("attendanceBody").addEventListener("change", event => {
  const id = event.target.dataset.statusId;
  if (!id) return;
  getRecord()[id] = event.target.value;
  saveData();
  renderAttendance();
});
$("attendanceBody").addEventListener("click", event => {
  const button = event.target.closest("[data-quick]");
  if (!button) return;
  setStatus(button.dataset.quick, button.dataset.value);
  saveData();
  showToast(`Marked ${button.dataset.value.toLowerCase()}.`);
});
$("markAllPresent").addEventListener("click", () => {
  data.students.forEach(student => { getRecord()[student.id] = "Present"; });
  saveData();
  renderAttendance();
  showToast("All students marked present.");
});
$("saveAttendance").addEventListener("click", () => {
  if (saveData()) showToast(`Attendance saved for ${selectedDate}.`);
});
$("exportCsv").addEventListener("click", exportCsv);
$("rosterList").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const student = data.students.find(item => item.id === button.dataset.delete);
  if (!student || !confirm(`Remove ${student.name} from the roster? Their attendance records will also be removed.`)) return;
  data.students = data.students.filter(item => item.id !== student.id);
  Object.values(data.attendance).forEach(record => delete record[student.id]);
  saveData();
  renderAll();
  showToast("Student removed.");
});
renderAll();
