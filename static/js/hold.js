// Greeting
const hour = new Date().getHours();
const greeting = hour < 12 ? `Good Morning, ${ROLE_NAME}` :
    hour < 17 ? `Good Afternoon, ${ROLE_NAME}` : `Good Evening, ${ROLE_NAME}`;
const greetingEl = document.getElementById("greetingText");
if (greetingEl) {
    greetingEl.innerHTML = ''; // Clear if any
    greeting.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = i * 0.06 + 's';
        greetingEl.appendChild(span);
    });
}

// Sidebar Toggle Logic
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const toggleBtn = document.getElementById('toggleBtn');
const closeSidebar = document.getElementById('closeSidebar');
const mainContent = document.querySelector('.main-content'); // Added for desktop toggle
const toggleIcon = document.getElementById('toggleIcon'); // Added for desktop toggle
const desktopToggleBtn = document.getElementById('desktopToggleBtn');

function toggleMobileSidebar() {
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
}

toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileSidebar();
});

closeSidebar?.addEventListener('click', () => {
    toggleMobileSidebar();
});

overlay?.addEventListener('click', () => {
    toggleMobileSidebar();
});

// Load saved state (Desktop Sidebar)
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar?.classList.add('collapsed');
    mainContent?.classList.add('collapsed');
    if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
}

if (desktopToggleBtn) {
    desktopToggleBtn.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        mainContent?.classList.toggle('collapsed');

        if (isCollapsed) {
            if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            if (toggleIcon) toggleIcon.classList.replace('fa-indent', 'fa-outdent');
            localStorage.setItem('sidebarCollapsed', 'false');
        }
    });
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon?.classList.replace('fa-sun', 'fa-moon');
}
if (themeToggle) {
    themeToggle.onclick = () => {
        if (document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.removeAttribute('data-theme');
            themeIcon?.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon?.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    };
}

// Submenu toggle
const studentSubmenu = document.getElementById('studentSubmenu');
const studentMenu = document.getElementById('studentMenu');

// PAGE LOAD → ALWAYS CLOSED
if (studentSubmenu) {
    studentSubmenu.style.display = "none";
}

studentMenu?.addEventListener('click', () => {
    if (studentSubmenu) {
        if (studentSubmenu.style.display === "none") {
            studentSubmenu.style.display = "block";
        } else {
            studentSubmenu.style.display = "none";
        }
    }
});

// Table search (real-time filter by name)
document.getElementById('tableSearch')?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#holdTable tbody tr');
    let anyVisible = false;

    rows.forEach(row => {
        const name = row.cells[1]?.textContent.toLowerCase() || '';
        row.style.display = (term === '' || name.includes(term)) ? '' : 'none';
        if (row.style.display !== 'none') anyVisible = true;
    });

    let msg = document.querySelector('.no-results-msg.dynamic');
    if (!anyVisible && term && rows.length > 0) {
        if (!msg) {
            msg = document.createElement('p');
            msg.className = 'no-results-msg dynamic';
            msg.textContent = 'No matching students found.';
            document.getElementById('holdTable')?.insertAdjacentElement('afterend', msg);
        }
    } else if (msg) {
        msg.remove();
    }
});

// Flash auto-dismiss
setTimeout(() => {
    document.querySelectorAll('.flash-message').forEach(m => {
        m.style.opacity = '0';
        setTimeout(() => m.remove(), 600);
    });
}, 4500);
