function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// ===================== HELPER FUNCTION TO PARSE AMOUNT =====================
function parseAmount(str) {
    if (!str) return 0;
    return Number(str.replace(/[^0-9.]/g, '')) || 0;
}

// ===================== DELETE PAYMENT =====================
function deletePayment(paymentId) {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    fetch(`/ajax/delete_payment/${paymentId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById(`payment-row-${paymentId}`).remove();
                alert(data.message);
                filterByYear(); // Update cards after deletion
            } else {
                alert(data.message);
            }
        })
        .catch(err => alert("Error deleting payment"));
}

// ===================== GREETING ANIMATION =====================
const hour = new Date().getHours();
const greeting = hour < 12 ? `Good Morning, ${ROLE_NAME}`
    : hour < 17 ? `Good Afternoon, ${ROLE_NAME}`
        : `Good Evening, ${ROLE_NAME}`;

const el = document.getElementById("greetingText");
if (el) {
    greeting.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${i * 0.07}s`;
        el.appendChild(span);
    });
}

// ===================== SIDEBAR TOGGLE LOGIC (FACULTY STYLE) =====================
const sidebar = document.getElementById('sidebar');
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

// Side bar Toggle (Mobile)
const toggleBtn = document.getElementById('toggleBtn');
toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
});

// ===================== DARK / LIGHT MODE =====================
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

// ===================== SUBMENU TOGGLE =====================
const studentMenu = document.getElementById('studentMenu');
const studentSubmenu = document.getElementById('studentSubmenu');
studentMenu?.addEventListener('click', () => {
    if (studentSubmenu) {
        studentSubmenu.style.display = studentSubmenu.style.display === 'block' ? 'none' : 'block';
    }
});

// ===================== SEARCH FILTER =====================
document.getElementById('searchInput')?.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
});

// ===================== BACKUP ORIGINAL ROWS =====================
let originalRows = [];

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    originalRows = Array.from(tbody.querySelectorAll("tr.student-row"));
});


// ===================== HIGH PENDING SORT =====================
function sortByPendingFees() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    // ONLY student rows (payment rows skip)
    const rows = Array.from(tbody.querySelectorAll("tr.student-row"));

    rows.sort((a, b) => {
        const pendingA = parseAmount(a.children[8]?.innerText); // ✅ Pending
        const pendingB = parseAmount(b.children[8]?.innerText); // ✅ Pending
        return pendingB - pendingA;
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));
}


// ===================== RESET TABLE =====================
function resetTable() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    originalRows.forEach(row => {
        row.style.display = "";
        tbody.appendChild(row);
    });

    filterByYear(); // cards + year filter re-apply
}


// ===================== PAYMENT DROPDOWN =====================
function togglePayments(el, studentId) {
    const currentRow = el.closest('tr');
    if (!currentRow) return;

    // Toggle close
    if (
        currentRow.nextElementSibling &&
        currentRow.nextElementSibling.classList.contains('payment-row')
    ) {
        currentRow.nextElementSibling.remove();
        return;
    }

    fetch(`/student-payments/${studentId}/`)
        .then(res => res.json())
        .then(data => {

            let html = `
<tr class="payment-row">
    <td colspan="9" style="
        padding:16px;
        background:#0f172a; /* lighter dark */
        color:#f1f5f9;
        border-top:1px solid #334155;
    ">
        <table style="
            width:100%;
            border-collapse:collapse;
            text-align:center;
            background:#020617;
            border-radius:8px;
            overflow:hidden;
        ">
            <tr style="background:#1e293b;">
                <th style="padding:10px; color:#f8fafc;">Date</th>
                <th style="padding:10px; color:#f8fafc;">Paid Amount</th>
                <th style="padding:10px; color:#f8fafc;">Action</th>
            </tr>
`;

            if (!data || data.length === 0) {
                html += `
        <tr>
            <td colspan="3" style="
                padding:12px;
                color:#cbd5f5;
                background:#020617;
            ">
                No payment history
            </td>
        </tr>
    `;
            } else {
                data.forEach(p => {
                    html += `
            <tr style="border-top:1px solid #334155;">
               <td style="padding:10px; color:#020617; font-weight:600;">

                    ${p.date}
                </td>
                <td style="padding:10px; color:#020617; font-weight:600;">
                    ₹ ${Number(p.amount).toLocaleString('en-IN')}
                </td>
                <td style="padding:10px;">
                    <button
                        onclick="deletePayment(${p.id})"
                        style="
                            padding:6px 14px;
                            border-radius:6px;
                            background:#ef4444;
                            color:white;
                            border:none;
                            cursor:pointer;
                        ">
                        Delete
                    </button>
                </td>
            </tr>
        `;
                });
            }

            html += `
        </table>
    </td>
</tr>
`;

            currentRow.insertAdjacentHTML('afterend', html);
        })
        .catch(err => {
            console.error(err);
            alert("Failed to load payments");
        });
}



// ===================== YEAR FILTER + CARDS UPDATE =====================
function generateYearOptions() {
    const dropdown = document.getElementById("yearFilter");
    if (!dropdown) return;

    const rows = document.querySelectorAll(".student-row");
    const yearSet = new Set();

    rows.forEach(row => {
        const dateCell = row.querySelector(".adm-date");
        if (!dateCell || !dateCell.dataset.date) return;

        const year = dateCell.dataset.date.split("-")[0];
        yearSet.add(year);
    });

    const sortedYears = [...yearSet].sort((a, b) => b - a); // newest first
    const currentYear = new Date().getFullYear().toString();

    dropdown.innerHTML = "";
    sortedYears.forEach(y => {
        dropdown.innerHTML += `<option value="${y}" ${y === currentYear ? "selected" : ""}>${y}</option>`;
    });
}

function filterByYear() {
    const dropdown = document.getElementById("yearFilter");
    if (!dropdown) return;

    const selectedYear = dropdown.value;
    const rows = document.querySelectorAll(".student-row");

    let totalStudents = 0;
    let totalCollected = 0; // Paid sum
    let totalPending = 0;   // Pending sum

    rows.forEach(row => {
        const dateCell = row.querySelector(".adm-date");
        if (!dateCell || !dateCell.dataset.date) {
            row.style.display = "none";
            return;
        }

        const rowYear = dateCell.dataset.date.split("-")[0];

        if (rowYear === selectedYear) {
            row.style.display = "";
            totalStudents++;

            const paid = parseAmount(row.children[7]?.innerText); // Paid column
            const pending = parseAmount(row.children[8]?.innerText); // Pending column

            totalCollected += paid;
            totalPending += pending;
        } else {
            row.style.display = "none";
        }
    });

    // Update summary cards
    document.getElementById("totalStudents").innerText = totalStudents;
    document.getElementById("totalPaid").innerText = "₹ " + totalCollected.toLocaleString('en-IN');
    document.getElementById("totalPending").innerText = "₹ " + totalPending.toLocaleString('en-IN');
}


// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
    generateYearOptions();
    filterByYear();
    document.getElementById("yearFilter")?.addEventListener("change", filterByYear);
});
