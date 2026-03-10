// Greeting Animation
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good Morning, Admin" : hour < 17 ? "Good Afternoon, Admin" : "Good Evening, Admin";
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
    sidebar.classList.add('collapsed');
    mainContent.classList.add('collapsed');
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

// Initial state from template is usually block for this page, but we align with sync
// Actually this page HAS it open by default in HTML. 
// We'll let the user toggle it.

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
      Other source
   ===================== */
const otherCheckbox = document.getElementById('other-checkbox');
const otherGroup = document.getElementById('other-group');
otherCheckbox?.addEventListener('change', () => {
    otherGroup?.classList.toggle('visible', otherCheckbox.checked);
});
