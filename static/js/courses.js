// Greeting Animation
const hour = new Date().getHours();
const greeting = hour < 12 ? `Good Morning, ${ROLE_NAME}` : hour < 17 ? `Good Afternoon, ${ROLE_NAME}` : `Good Evening, ${ROLE_NAME}`;
const el = document.getElementById("greetingText");
if (el) {
  greeting.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.07}s`;
    el.appendChild(span);
  });
}

// Mobile & Desktop Sidebar Toggle
const sidebar = document.getElementById('sidebar');
const desktopToggleBtn = document.getElementById('desktopToggleBtn');
const mainContent = document.querySelector('.main-content');
const toggleIcon = document.getElementById('toggleIcon');
const overlay = document.getElementById('sidebarOverlay');
const toggleBtn = document.getElementById('toggleBtn');
const closeSidebar = document.getElementById('closeSidebar');

// Load saved state
if (localStorage.getItem('sidebarCollapsed') === 'true') {
  sidebar?.classList.add('collapsed');
  mainContent?.classList.add('collapsed');
  if (toggleIcon) toggleIcon.classList.replace('fa-outdent', 'fa-indent');
}

if (desktopToggleBtn) {
  desktopToggleBtn.addEventListener('click', () => {
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
}

function toggleMobileSidebar() {
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('active');
  document.body.classList.toggle('no-scroll'); // Add/remove no-scroll to body
}

toggleBtn?.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent event from bubbling to overlay
  toggleMobileSidebar();
});

closeSidebar?.addEventListener('click', () => {
  toggleMobileSidebar();
});

overlay?.addEventListener('click', () => {
  toggleMobileSidebar();
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon?.classList.replace('fa-sun', 'fa-moon');
}
themeToggle?.addEventListener('click', () => {
  if (document.documentElement.hasAttribute('data-theme')) {
    document.documentElement.removeAttribute('data-theme');
    themeIcon?.classList.replace('fa-moon', 'fa-sun');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon?.classList.replace('fa-sun', 'fa-moon');
    localStorage.setItem('theme', 'dark');
  }
});

// Submenu Toggle (for Students menu)
document.getElementById('studentMenu')?.addEventListener('click', () => {
  const submenu = document.getElementById('studentSubmenu');
  if (submenu) {
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
  }
});
