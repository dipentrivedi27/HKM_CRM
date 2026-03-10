/* =====================
      HELPER (For Theme Colors)
   ===================== */
function getCSSVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
}

/* =====================
      Greeting animation
   ===================== */
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good Morning, Admin" :
    hour < 17 ? "Good Afternoon, Admin" : "Good Evening, Admin";
const el = document.getElementById("greetingText");
if (el) {
    greeting.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${i * 0.07}s`;
        el.appendChild(span);
    });
}

/* =====================
      Sidebar toggle
   ===================== */
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const toggleBtn = document.getElementById('toggleBtn');
const closeSidebar = document.getElementById('closeSidebar');

function toggleSidebar() {
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleSidebar();
    });
}

if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        toggleSidebar();
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        toggleSidebar();
    });
}

/* =====================
      Theme toggle
   ===================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }

        // 🔥 Important: Re-render Chart for night mode
        if (typeof loadChart === 'function') loadChart();
    });
}

/* =====================
      Submenu toggle
   ===================== */
const studentMenu = document.getElementById('studentMenu');
if (studentMenu) {
    studentMenu.addEventListener('click', () => {
        const sub = document.getElementById('studentSubmenu');
        if (sub) sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
    });
}

/* =====================
      Notification panel
   ===================== */
const notifBtn = document.getElementById('notificationBtn');
const notifPanel = document.getElementById('notificationPanel');
const notifList = document.getElementById('notificationList');
const notifCountEl = document.getElementById('notifCount');

if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', () => {
        notifPanel.style.display = notifPanel.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', e => {
        if (!notifBtn.contains(e.target) && !notifPanel.contains(e.target))
            notifPanel.style.display = 'none';
    });
}

/* =====================
      Modals
   ===================== */
const addModal = document.getElementById('addStudentModal');
const detailsModal = document.getElementById('studentDetailsModal');

const addNotificationBtn = document.getElementById('addNotificationBtn');
if (addNotificationBtn) {
    addNotificationBtn.addEventListener('click', () => { if (addModal) addModal.style.display = 'flex'; });
}

const closeModal = document.getElementById('closeModal');
if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (addModal) addModal.style.display = 'none';
        const form = document.getElementById('addStudentForm');
        if (form) form.reset();
    });
}

const closeDetailsModal = document.getElementById('closeDetailsModal');
if (closeDetailsModal) {
    closeDetailsModal.addEventListener('click', () => { if (detailsModal) detailsModal.style.display = 'none'; });
}

const closeDetailsBtn = document.getElementById('closeDetailsBtn');
if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', () => { if (detailsModal) detailsModal.style.display = 'none'; });
}

if (addModal) {
    addModal.addEventListener('click', e => { if (e.target === addModal) addModal.style.display = 'none'; });
}
if (detailsModal) {
    detailsModal.addEventListener('click', e => { if (e.target === detailsModal) detailsModal.style.display = 'none'; });
}

/* =====================
      CSRF helper
   ===================== */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const c = cookie.trim();
            if (c.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(c.substring(name.length + 1));
            }
        });
    }
    return cookieValue;
}

/* =====================
      Global student data
   ===================== */
let currentStudentId = null;
let studentsData = [];

/* =====================
      Add notification item
   ===================== */
function addNotificationItem(student) {
    const notifList = document.getElementById('notificationList');
    if (!notifList) return;

    const item = document.createElement('div');
    item.className = 'notification-item';
    item.dataset.id = student.id;

    item.innerHTML = `
<div style="display:flex; align-items:center; gap:12px; width:100%; position:relative;">
    <input type="checkbox" class="select-notif" style="cursor:pointer;">
    <div class="user-avatar-small" style="background:#6366f1;">
        ${student.name.charAt(0).toUpperCase()}
    </div>
    <div style="flex:1;">
        <strong style="color: var(--accent);">${student.name}</strong> added<br>
        <span>${student.course}</span><br>    
        <small>${student.added_on}</small>
    </div>
    <a href="/student/?enquiry_id=${student.id}" class="btn-small btn-add" style="text-decoration:none; display:flex; align-items:center; justify-content:center; padding: 6px 10px; margin-left:10px;" onclick="event.stopPropagation();">Admit</a>
</div>
`;

    item.querySelector('.select-notif').addEventListener('click', e => e.stopPropagation());

    item.addEventListener('click', () => {
        currentStudentId = student.id;
        const detailsModal = document.getElementById('studentDetailsModal');
        document.getElementById('viewName').textContent = student.name;
        document.getElementById('viewContact').textContent = student.contact;
        document.getElementById('viewCourse').textContent = student.course;
        document.getElementById('viewDate').textContent = student.added_on;
        document.getElementById('viewRemark').value = student.remark || "";
        if (detailsModal) detailsModal.style.display = 'flex';
    });

    notifList.insertBefore(item, notifList.firstChild);

    if (Array.isArray(studentsData)) {
        const idx = studentsData.findIndex(s => s.id === student.id);
        if (idx > -1) studentsData[idx] = student;
        else studentsData.push(student);
    }
}

/* =====================
      Update notification count
   ===================== */
function updateNotifCount() {
    const notifCountEl = document.getElementById('notifCount');
    if (!notifCountEl) return;
    const count = document.querySelectorAll('.notification-item').length;
    notifCountEl.textContent = count;
    notifCountEl.style.display = count > 0 ? 'flex' : 'none';
}

/* =====================
      Load notifications
   ===================== */
function loadNotifications() {
    fetch("/get-notifications/")
        .then(res => res.json())
        .then(data => {
            const notifList = document.getElementById('notificationList');
            if (notifList) {
                notifList.innerHTML = "";
                studentsData = data.students || [];
                studentsData.forEach(student => addNotificationItem(student));
                updateNotifCount();
            }
        });
}

/* =====================
      Add student form
   ===================== */
const addStudentForm = document.getElementById('addStudentForm');
if (addStudentForm) {
    addStudentForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('studentName').value.trim();
        const contact = document.getElementById('studentContact').value.trim();
        const course = document.getElementById('studentCourse').value;

        if (!name || !contact || !course) return;

        fetch('/add-student/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ name, contact, course })
        })
            .then(res => res.json())
            .then(data => {
                addNotificationItem(data);
                updateNotifCount();
                const addModal = document.getElementById('addStudentModal');
                if (addModal) addModal.style.display = 'none';
                addStudentForm.reset();
                const totalStudentsEl = document.getElementById('totalStudents');
                if (totalStudentsEl) {
                    totalStudentsEl.innerText = parseInt(totalStudentsEl.innerText) + 1;
                }
            });
    });
}

/* =====================
      Delete selected notifications
   ===================== */
const deleteNotificationsBtn = document.getElementById('deleteNotificationsBtn');
if (deleteNotificationsBtn) {
    deleteNotificationsBtn.addEventListener('click', () => {
        const selected = document.querySelectorAll('.select-notif:checked');
        if (selected.length === 0) return alert("Please select at least one.");

        if (confirm(`Delete ${selected.length} notification(s)?`)) {
            const ids = [];
            selected.forEach(cb => {
                ids.push(cb.closest('.notification-item').dataset.id);
            });

            fetch('/delete-students/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ ids })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'deleted') {
                        selected.forEach(cb => cb.closest('.notification-item').remove());
                        updateNotifCount();
                        const totalStudentsEl = document.getElementById('totalStudents');
                        if (totalStudentsEl) {
                            totalStudentsEl.innerText = document.querySelectorAll('.notification-item').length;
                        }
                        studentsData = studentsData.filter(s => !ids.includes(String(s.id)));
                    }
                });
        }
    });
}

/* =====================
      Save remark
   ===================== */
const saveRemarkBtn = document.getElementById("saveRemarkBtn");
if (saveRemarkBtn) {
    saveRemarkBtn.addEventListener("click", function () {
        if (!currentStudentId) return alert("No student selected!");
        let remark = document.getElementById("viewRemark").value;
        fetch(`/save-remark/${currentStudentId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ remark: remark })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    const idx = studentsData.findIndex(s => s.id === currentStudentId);
                    if (idx > -1) studentsData[idx].remark = remark;
                    alert("Remark saved!");
                } else {
                    alert("Error saving remark");
                }
            });
    });
}

/* =====================
      Dashboard counts
   ===================== */
function loadDashboardCounts() {
    fetch("/dashboard/counts/")
        .then(res => res.json())
        .then(data => {
            const totalStudentsEl = document.getElementById("totalStudents");
            const totalFacultyEl = document.getElementById("totalFaculty");
            if (totalStudentsEl) totalStudentsEl.innerText = data.total_students;
            if (totalFacultyEl) totalFacultyEl.innerText = data.total_faculty;
        });
}
loadDashboardCounts();

/* =====================
      Chart (Dark Mode Supported)
   ===================== */
/* =====================
      Charts System (Optimized & Unified)
   ===================== */
let feesChart;
let loadingChart;
let courseChart;

function loadYears() {
    fetch("/chart/years/")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("yearSelect");
            if (!select) return;
            const currentYear = new Date().getFullYear();
            select.innerHTML = "";

            if (!data.years.includes(currentYear)) data.years.push(currentYear);
            data.years.sort((a, b) => b - a);

            data.years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                if (y === currentYear) opt.selected = true;
                select.appendChild(opt);
            });
            loadCharts(); // Initial data fetch
        });
}

function loadCharts() {
    const select = document.getElementById("yearSelect");
    if (!select) return;
    const year = select.value;

    fetch(`/chart/monthly/?year=${year}`)
        .then(res => res.json())
        .then(data => {
            renderBarChart(data);
            renderLoadingChart(data.yearly);

            // Render Courses
            renderDistributionLines("courseLinesContainer", data.courses, "course");

            // Render Lead Sources
            renderDistributionLines("sourceLinesContainer", data.sources, "source");
        })
        .catch(err => console.error("Error loading charts:", err));
}

function renderBarChart(data) {
    const canvas = document.getElementById("feesChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (feesChart) feesChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.2)");

    feesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Monthly Fees",
                data: data.totals,
                backgroundColor: gradient,
                borderColor: getCSSVar("--accent"),
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: "bottom",
                hoverBackgroundColor: "#4f46e5",
                hoverBorderColor: "#4338ca",
                hoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1500, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: getCSSVar("--sidebar-bg"),
                    titleColor: getCSSVar("--text-primary"),
                    bodyColor: getCSSVar("--text-secondary"),
                    borderColor: getCSSVar("--border"),
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `₹ ${ctx.parsed.y.toLocaleString()}`
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: getCSSVar("--text-secondary") } },
                y: {
                    beginAtZero: true,
                    grid: { color: getCSSVar("--border"), borderDash: [5, 5] },
                    ticks: {
                        color: getCSSVar("--text-secondary"),
                        callback: (v) => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`
                    }
                }
            }
        }
    });
}

function renderDistributionLines(containerId, distributionData, idPrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (!distributionData.labels || distributionData.labels.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:20px;">No data for this year.</p>`;
        return;
    }

    distributionData.labels.forEach((label, i) => {
        const percent = distributionData.percentages[i];
        const count = distributionData.counts[i];

        const item = document.createElement("div");
        item.className = "course-line-item"; // Reuse existing style
        item.innerHTML = `
            <div class="line-header">
                <span class="line-course-name">${label}</span>
                <span class="line-percent" id="percent-${idPrefix}-${i}">0%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" id="fill-${idPrefix}-${i}"></div>
            </div>
            <div class="line-tooltip">${count} Students Enrolled</div>
        `;
        container.appendChild(item);

        // Trigger animation after append
        setTimeout(() => {
            const fill = document.getElementById(`fill-${idPrefix}-${i}`);
            if (fill) fill.style.width = percent + "%";
            // Animated counting for percentage text
            animateValue(`percent-${idPrefix}-${i}`, 0, Math.floor(percent), 1500);
        }, 100 + (i * 50)); // Staggered animation
    });
}

function renderLoadingChart(yearly) {
    const canvas = document.getElementById("loadingChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (loadingChart) loadingChart.destroy();

    const totalEl = document.getElementById("totalExpected");
    const collectedEl = document.getElementById("collectedAmount");
    const pendingEl = document.getElementById("pendingAmount");
    if (totalEl) totalEl.textContent = yearly.total.toLocaleString();
    if (collectedEl) collectedEl.textContent = yearly.collected.toLocaleString();
    if (pendingEl) pendingEl.textContent = yearly.pending.toLocaleString();

    animateValue("progressPercent", 0, Math.floor(yearly.percentage), 1500);

    loadingChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Collected", "Pending"],
            datasets: [{
                data: [yearly.collected, yearly.pending],
                backgroundColor: [getCSSVar("--accent"), "rgba(239, 68, 68, 0.1)"],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: "82%",
            animation: { duration: 2000, easing: 'easeOutExpo' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: getCSSVar("--sidebar-bg"),
                    titleColor: getCSSVar("--text-primary"),
                    bodyColor: getCSSVar("--text-secondary"),
                    borderColor: getCSSVar("--border"),
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ₹${ctx.raw.toLocaleString()}`
                    }
                }
            }
        }
    });
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// Desktop Sidebar Toggle Logic
const desktopToggleBtn = document.getElementById('desktopToggleBtn');
const mainContent = document.querySelector('.main-content');
const toggleIcon = document.getElementById('toggleIcon');

// Load saved state
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    if (sidebar) sidebar.classList.add('collapsed');
    if (mainContent) mainContent.classList.add('collapsed');
    if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
}

if (desktopToggleBtn) {
    desktopToggleBtn.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('collapsed');

        if (isCollapsed) {
            if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            if (toggleIcon) toggleIcon.classList.replace('fa-indent', 'fa-outdent');
            localStorage.setItem('sidebarCollapsed', 'false');
        }
    });
}

window.loadChart = loadCharts; // Global reference for theme toggle
loadYears(); // Fire off the initial load

/* =====================
      Enquiry Search
   ===================== */
function searchEnquiry() {
    let filter = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll("#notificationList .notification-item").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
}

function resetEnquirySearch() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = "";
        searchEnquiry();
    }
}

/* =====================
      Initial load
   ===================== */
loadNotifications();

/* =====================
   PDF DOWNLOAD (Only visible notifications)
===================== */
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Students Enquiry Report", 14, 15);

        let tableData = [];

        const rows = document.querySelectorAll(
            "#notificationList .notification-item:not([style*='display: none'])"
        );

        rows.forEach((item, index) => {
            const name = item.querySelector("strong")?.innerText || "-";
            const course = item.querySelector("span")?.innerText || "-";
            const date = item.querySelector("small")?.innerText || "-";

            const id = item.dataset.id;
            const student = studentsData.find(s => String(s.id) === String(id));

            const contact = student?.contact || "-";
            const remark = student?.remark || "-";

            tableData.push([
                index + 1,
                name,
                contact,
                course,
                remark,
                date
            ]);
        });

        if (tableData.length === 0) {
            alert("No data to download!");
            return;
        }

        doc.autoTable({
            startY: 25,
            head: [["#", "Student Name", "Contact", "Course", "Remark", "Date"]],
            body: tableData,
            theme: "grid",
            styles: { fontSize: 9 }
        });

        doc.save("notification_report.pdf");
    });
}
