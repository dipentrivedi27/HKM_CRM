/* ================================
   GREETING ANIMATION
================================ */
const hour = new Date().getHours();
const greeting =
    hour < 12 ? `Good Morning, ${ROLE_NAME}` :
        hour < 17 ? `Good Afternoon, ${ROLE_NAME}` :
            `Good Evening, ${ROLE_NAME}`;

const greetingEl = document.getElementById("greetingText");
if (greetingEl) {
    greetingEl.innerHTML = ''; // Clear if any
    greeting.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${i * 0.07}s`;
        greetingEl.appendChild(span);
    });
}

/* ================================
   SIDEBAR TOGGLE LOGIC
================================ */
const sidebar = document.getElementById('sidebar');
const desktopToggleBtn = document.getElementById('desktopToggleBtn');
const mainContent = document.querySelector('.main-content');
const toggleIcon = document.getElementById('toggleIcon');

// Load saved state
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

// Side bar Toggle (Mobile)
const toggleBtn = document.getElementById('toggleBtn');
const overlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');

function toggleMobileSidebar() {
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
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

/* ================================
   DARK / LIGHT MODE
================================ */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon?.classList.replace('fa-sun', 'fa-moon');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
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
}

/* ================================
   MODAL CONTROLS
================================ */
const facultyGrid = document.getElementById('facultyGrid');
const modal = document.getElementById('facultyModal');
const openBtn = document.getElementById('openModal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('facultyForm');

if (IS_ADMIN && openBtn) {
    openBtn.onclick = () => modal.style.display = "flex";
}

if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
if (cancelBtn) cancelBtn.onclick = () => modal.style.display = "none";

window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};

/* ================================
   CREATE FACULTY CARD
================================ */
function createFacultyCard(faculty) {
    const card = document.createElement('div');
    card.className = 'faculty-card';
    const deleteBtn = IS_ADMIN
        ? `<button class="btn-delete" onclick="deleteFaculty(${faculty.id})" title="Delete Faculty"><i class="fas fa-trash-alt"></i></button>`
        : '';
    card.innerHTML = `
        ${deleteBtn}
        <div class="faculty-info">
            <h3>${faculty.name}</h3>
            <div class="designation">${faculty.designation}</div>
            <div class="department">${faculty.department}</div>

            <div class="faculty-details">
                <p><i class="fas fa-envelope"></i> ${faculty.email}</p>
                <p><i class="fas fa-phone"></i> ${faculty.phone}</p>
                <p><i class="fas fa-clock"></i> ${faculty.experience || 0} Years Experience</p>
            </div>

            <div class="bio">
                ${faculty.bio || 'No bio provided.'}
            </div>
        </div>
    `;
    return card;
}

/* ================================
   LOAD FACULTY FROM MYSQL
================================ */
function loadFaculty() {
    if (!facultyGrid) return;
    fetch("/faculty/list/")
        .then(response => response.json())
        .then(data => {
            facultyGrid.innerHTML = '';
            data.forEach(faculty => {
                facultyGrid.appendChild(createFacultyCard(faculty));
            });
        })
        .catch(error => {
            console.error("Error loading faculty:", error);
        });
}

// Page load
loadFaculty();

/* ================================
   DELETE FACULTY (NEW)
================================ */
function deleteFaculty(facultyId) {
    if (confirm("Are you sure you want to delete this faculty member?")) {
        fetch(`/faculty/delete/${facultyId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": CSRF_TOKEN
            }
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    alert(result.message);
                    loadFaculty();
                } else {
                    alert("Error: " + result.message);
                }
            })
            .catch(error => {
                console.error("Error deleting faculty:", error);
                alert("Something went wrong!");
            });
    }
}

/* ================================
   SAVE FACULTY TO MYSQL
================================ */
if (form) {
    form.onsubmit = function (e) {
        e.preventDefault();

        const data = {
            name: document.getElementById('name').value.trim(),
            designation: document.getElementById('designation').value,
            department: document.getElementById('department').value,
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            experience: document.getElementById('experience').value,
            bio: document.getElementById('bio').value.trim()
        };

        fetch("/faculty/add/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": CSRF_TOKEN
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    alert("Faculty saved successfully!");
                    modal.style.display = "none";
                    form.reset();
                    loadFaculty();
                } else {
                    alert("Error: " + result.message);
                }
            })
            .catch(error => {
                console.error("Error saving faculty:", error);
                alert("Something went wrong!");
            });
    };
}

/* ================================
   STUDENT SUBMENU TOGGLE (FIXED)
================================ */
const studentMenu = document.getElementById('studentMenu');
const studentSubmenu = document.getElementById('studentSubmenu');

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
