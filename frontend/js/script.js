// Core script for shared functionality with Theme Support

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    handleTheme();
    handleSidebar();
    handleRoleDisplay();
    handleLogin();
});

// Theme Management Logic
function handleTheme() {
    const toggleBtns = document.querySelectorAll('#theme-toggle');
    const storedTheme = localStorage.getItem('scda_theme') || 'light';

    document.documentElement.setAttribute('data-theme', storedTheme);
    updateToggleIcons(storedTheme);

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('scda_theme', newTheme);
            updateToggleIcons(newTheme);
        });
    });
}

function updateToggleIcons(theme) {
    const toggleBtns = document.querySelectorAll('#theme-toggle');
    toggleBtns.forEach(btn => {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// Sidebar Toggle Logic
function handleSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        // Initial setup for mobile
        if (window.innerWidth <= 768 && toggleBtn) {
            toggleBtn.style.display = 'block';
        }

        window.addEventListener('resize', () => {
            if (toggleBtn) {
                toggleBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
            }
        });

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// User Role Management
function handleRoleDisplay() {
    const roleDisplays = document.querySelectorAll('#user-role-display');
    const userRole = localStorage.getItem('scda_role') || 'Student';
    
    roleDisplays.forEach(display => {
        display.textContent = userRole;
    });

    const teacherLinks = document.querySelectorAll('.teacher-only');
    const studentLinks = document.querySelectorAll('.student-only');

    if (userRole === 'Teacher') {
        teacherLinks.forEach(el => el.style.display = 'block');
        studentLinks.forEach(el => el.style.display = 'none');
    } else {
        teacherLinks.forEach(el => el.style.display = 'none');
        studentLinks.forEach(el => el.style.display = 'block');
    }
}

// Login Page Logic
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    const studentBtn = document.getElementById('student-role');
    const teacherBtn = document.getElementById('teacher-role');
    let selectedRole = 'Student';

    if (studentBtn && teacherBtn) {
        studentBtn.addEventListener('click', () => {
            studentBtn.classList.add('active');
            teacherBtn.classList.remove('active');
            selectedRole = 'Student';
        });
        teacherBtn.addEventListener('click', () => {
            teacherBtn.classList.add('active');
            studentBtn.classList.remove('active');
            selectedRole = 'Teacher';
        });
    }

    // Reset Demo Logic
    const resetBtn = document.getElementById('reset-demo');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to reset the project? This will clear all added subjects and feedback and restore default data.')) {
                localStorage.clear();
                alert('Project reset successfully! Refreshing...');
                window.location.reload();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            if (!usernameInput || !passwordInput) return;

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Standalone Login Logic
            localStorage.setItem('scda_role', selectedRole);
            localStorage.setItem('scda_user', username);

            // Optional: You can still call API.login if you want to keep the simulated delay
            try {
                const btn = loginForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                btn.disabled = true;

                await API.login(username, password);
                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error('Login failed:', err);
                alert('Login failed. Please try again.');
                const btn = loginForm.querySelector('button[type="submit"]');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
}
