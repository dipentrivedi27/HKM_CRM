// Fees Modal Functions (Simplified)
function openFees(button) {
    const modal = document.getElementById('feesModal');
    const d = button.dataset;
    const studentId = d['student-id'] || d.studentId;

    document.getElementById('f_name').textContent = d.name;
    document.getElementById('f_student_id').value = studentId;

    // Set dynamic receipt link
    const receiptLink = document.getElementById('modalReceiptLink');
    if (receiptLink) {
        receiptLink.href = `/generate-receipt/${studentId}/`;
    }

    modal.style.display = 'flex';
}

function closeFees() {
    document.getElementById('feesModal').style.display = 'none';
}

document.getElementById('feesModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeFees();
});

// NEW: Manage Modal Functions
let currentStudentId = null;

function openManage(button) {
    const modal = document.getElementById('manageModal');
    const d = button.dataset;

    document.getElementById('m_name').textContent = d.name;
    document.getElementById('m_student_id').value = d.studentId;
    currentStudentId = d.studentId;

    document.getElementById('manageOptions').style.display = 'flex';
    document.getElementById('holdForm').style.display = 'none';

    modal.style.display = 'flex';
}

function closeManage() {
    document.getElementById('manageModal').style.display = 'none';
}

function confirmDelete() {
    if (confirm('Are you sure you want to delete this record?')) {
        document.getElementById('deleteForm_' + currentStudentId).submit();
    }
}

function showHoldForm() {
    document.getElementById('manageOptions').style.display = 'none';
    document.getElementById('holdForm').style.display = 'block';
}

document.getElementById('manageModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeManage();
});

// Photo Modal
function openPhoto(src, name) {
    document.getElementById('zoomPhoto').src = src;
    document.getElementById('photoModal').style.display = 'flex';
}

function closePhoto() {
    document.getElementById('photoModal').style.display = 'none';
}

document.getElementById('photoModal')?.addEventListener('click', function (e) {
    if (e.target === this) closePhoto();
});

/* =====================
      Sidebar toggle
   ===================== */
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const toggleBtn = document.getElementById('toggleBtn');
const closeSidebar = document.getElementById('closeSidebar');
const desktopToggleBtn = document.getElementById('desktopToggleBtn');
const mainContent = document.querySelector('.main-content');
const toggleIcon = document.getElementById('toggleIcon');

function toggleMobileSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

toggleBtn?.addEventListener('click', e => {
    e.stopPropagation();
    toggleMobileSidebar();
});

closeSidebar?.addEventListener('click', () => {
    toggleMobileSidebar();
});

overlay?.addEventListener('click', () => {
    toggleMobileSidebar();
});

// DESKTOP TOGGLE
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar?.classList.add('collapsed');
    mainContent?.classList.add('collapsed');
    if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
}

desktopToggleBtn?.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
    if (isCollapsed) {
        if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
        localStorage.setItem('sidebarCollapsed', 'true');
    } else {
        if (toggleIcon) toggleIcon.classList.replace('fa-indent', 'fa-outdent');
        localStorage.setItem('sidebarCollapsed', 'false');
    }
});

/* =====================
      Theme Toggle
   ===================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon?.classList.replace('fa-sun', 'fa-moon');
}

themeToggle?.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        themeIcon?.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon?.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
});

/* =====================
      Submenu toggle
   ===================== */
const studentSubmenu = document.getElementById('studentSubmenu');
const studentMenu = document.getElementById('studentMenu');

studentMenu?.addEventListener('click', () => {
    if (studentSubmenu) {
        if (window.getComputedStyle(studentSubmenu).display === "none") {
            studentSubmenu.style.display = "block";
        } else {
            studentSubmenu.style.display = "none";
        }
    }
});

/* =====================
      Greeting
   ===================== */
const hour = new Date().getHours();
const roleName = typeof ROLE_NAME !== 'undefined' ? ROLE_NAME : 'User';
const greeting = hour < 12 ? `Good Morning, ${roleName}` : hour < 17 ? `Good Afternoon, ${roleName}` : `Good Evening, ${roleName}`;
const el = document.getElementById("greetingText");
greeting.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.07}s`;
    el?.appendChild(span);
});

// Edit Modal
function openEdit(button) {
    document.getElementById('editModal').style.display = 'flex';
    const d = button.dataset;
    document.getElementById('e_id').value = d.id;
    document.getElementById('e_student_uid').value = d.student_id || '';
    document.getElementById('e_date').value = d.date || '';
    document.getElementById('e_name').value = d.name;
    document.getElementById('e_address').value = d.address;
    document.getElementById('e_email').value = d.email;
    document.getElementById('e_mobile').value = d.mobile;
    document.getElementById('e_alt_mobile').value = d.alt_mobile || '';
    document.getElementById('e_dob').value = d.dob || '';
    document.getElementById('e_qualification').value = d.qualification;
    document.getElementById('e_college').value = d.college;
    document.getElementById('e_field').value = d.field;
    document.getElementById('e_guardian').value = d.guardian;
    document.getElementById('e_career').value = d.career;
    document.getElementById('e_fees').value = d.fees || '';
    document.getElementById('e_source').value = d.source;
}

function closeEdit() {
    document.getElementById('editModal').style.display = 'none';
}

window.onclick = function (event) {
    let editModal = document.getElementById('editModal');
    if (event.target == editModal) closeEdit();
}

// Flash messages auto-hide
setTimeout(() => {
    document.querySelectorAll('.flash-message').forEach(msg => {
        msg.style.animation = 'fadeOut 0.6s ease forwards';
    });
}, 5000);

// Live Search
const searchInput = document.getElementById('searchInput');
const studentCards = document.querySelectorAll('.card');
const studentGrid = document.getElementById('studentGrid');
const searchInfo = document.getElementById('searchInfo');

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    const existingEmpty = studentGrid?.querySelector('.empty-state:not(.original-empty)');
    if (existingEmpty) existingEmpty.remove();

    studentCards.forEach((card, index) => {
        const name = card.querySelector('.student-name')?.textContent.toLowerCase() || '';
        const mobile = card.querySelector('.student-mobile')?.textContent.toLowerCase() || '';
        const email = card.querySelector('.student-email')?.textContent.toLowerCase() || '';
        const college = card.querySelector('.student-college')?.textContent.toLowerCase() || '';
        const qualification = card.querySelector('.student-qualification')?.textContent.toLowerCase() || '';
        const field = card.querySelector('.field-pill')?.textContent.toLowerCase() || '';
        const source = card.querySelector('.info-row:nth-child(6) > div:last-child')?.textContent.toLowerCase() || '';

        const textContent = `${name} ${mobile} ${email} ${college} ${qualification} ${field} ${source}`;

        if (query === '' || textContent.includes(query)) {
            card.style.display = 'flex';
            setTimeout(() => card.classList.add('visible'), index * 50);
            visibleCount++;
        } else {
            card.style.display = 'none';
            card.classList.remove('visible');
        }
    });

    if (searchInfo) {
        if (query === '') {
            searchInfo.textContent = `Total Students: ${studentCards.length}`;
        } else {
            searchInfo.textContent = `Found ${visibleCount} student${visibleCount !== 1 ? 's' : ''} matching "${query}"`;
        }
    }

    if (visibleCount === 0 && query !== '' && studentGrid) {
        const newEmpty = document.createElement('div');
        newEmpty.className = 'empty-state';
        newEmpty.innerHTML = `
            <i class="fa-solid fa-search fa-3x" style="margin-bottom:20px; color:var(--text-secondary);"></i>
            <p>No students found for "<strong>${query}</strong>"</p>
            <p style="font-size:0.9rem; margin-top:8px;">Try different keywords.</p>
        `;
        studentGrid.appendChild(newEmpty);
    }
}

window.addEventListener('load', () => {
    if (searchInfo) searchInfo.textContent = `Total Students: ${studentCards.length}`;
    studentCards.forEach((card, index) => {
        setTimeout(() => card.classList.add('visible'), index * 50);
    });
});

let searchTimeout;
searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
});
