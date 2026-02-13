document.addEventListener('DOMContentLoaded', () => {
    updateDashboardUI();
    loadDashboardStats();
});

function updateDashboardUI() {
    const userRole = localStorage.getItem('scda_role') || 'Student';
    const userName = localStorage.getItem('scda_username') || 'User';

    // Update Welcome Banner
    const welcomeUserEl = document.getElementById('welcome-user');
    const welcomeMsgEl = document.getElementById('welcome-message');

    if (welcomeUserEl) {
        if (userRole === 'Teacher') {
            welcomeUserEl.innerHTML = `Welcome back, Professor ${userName}! <i class="fas fa-chalkboard-teacher"></i>`;
            welcomeMsgEl.textContent = "Your academic analysis and course materials are up to date.";
        } else {
            welcomeUserEl.innerHTML = `Hello, ${userName}! <i class="fas fa-user-graduate"></i>`;
            welcomeMsgEl.textContent = "Track your progress and access your course materials below.";
        }
    }

    // Role specific visibility
    const feedbackSection = document.getElementById('feedback-section');
    if (feedbackSection) {
        if (userRole === 'Teacher') {
            feedbackSection.style.display = 'block';
            loadRecentFeedback();
        } else {
            feedbackSection.style.display = 'none';
        }
    }
}

async function loadDashboardStats() {
    try {
        const subjects = await API.getSubjects();

        let totalFeedbacks = 0;
        let sumMarks = 0;
        let countMarks = 0;

        let difficultyDistribution = { easy: 0, intermediate: 0, difficult: 0 };
        let subjectNames = [];
        let difficultyIndexes = [];

        subjects.forEach(sub => {
            const reviews = sub.reviews || [];
            totalFeedbacks += reviews.length;

            if (reviews.length > 0) {
                const subAvgRating = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
                const subAvgMarks = reviews.reduce((a, b) => a + b.marks, 0) / reviews.length;

                sumMarks += subAvgMarks;
                countMarks++;

                const diffIndex = (subAvgRating * 0.6) + (((100 - subAvgMarks) / 20) * 0.4);

                subjectNames.push(sub.name);
                difficultyIndexes.push(diffIndex.toFixed(2));

                if (diffIndex < 2.5) difficultyDistribution.easy++;
                else if (diffIndex < 4) difficultyDistribution.intermediate++;
                else difficultyDistribution.difficult++;
            }
        });

        // Update Top Cards
        const totalSubsEl = document.getElementById('total-subjects');
        const totalRatingsEl = document.getElementById('total-ratings');
        const avgMarksEl = document.getElementById('avg-marks');

        if (totalSubsEl) totalSubsEl.textContent = subjects.length;
        if (totalRatingsEl) totalRatingsEl.textContent = totalFeedbacks;

        const classAvg = countMarks > 0 ? (sumMarks / countMarks).toFixed(1) : 0;
        if (avgMarksEl) avgMarksEl.textContent = classAvg + '%';

        // Render Charts with delay to ensure CSS is loaded for colors
        setTimeout(() => {
            renderPieChart(difficultyDistribution);
            renderBarChart(subjectNames, difficultyIndexes);
        }, 100);

        loadNotifications();
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

async function loadRecentFeedback() {
    const gallery = document.getElementById('recent-feedback-list');
    if (!gallery) return;

    try {
        const subjects = await API.getSubjects();
        let allFeedbacks = [];

        subjects.forEach(sub => {
            if (sub.reviews) {
                sub.reviews.forEach(rev => {
                    allFeedbacks.push({
                        ...rev,
                        subjectName: sub.name,
                        subjectCode: sub.code,
                        date: new Date() // Simulating recent
                    });
                });
            }
        });

        // Sort by "recency" (we'll just take the last 5)
        allFeedbacks = allFeedbacks.slice(-5).reverse();

        if (allFeedbacks.length === 0) {
            gallery.innerHTML = '<p class="text-muted">No feedback activity recorded yet.</p>';
            return;
        }

        gallery.innerHTML = '';
        allFeedbacks.forEach(rev => {
            const item = document.createElement('div');
            item.className = 'activity-item';

            let color = 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 1)';
            let icon = 'fa-smile';
            if (rev.rating >= 4) { color = '#ef4444'; icon = 'fa-frown'; }
            else if (rev.rating >= 3) { color = '#f59e0b'; icon = 'fa-meh'; }
            else { color = '#10b981'; icon = 'fa-smile'; }

            item.innerHTML = `
                <div class="activity-icon" style="background: ${color}22; color: ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <h4 style="font-weight: 700; color: var(--text-color);">${rev.subjectName} <span style="font-weight: 500; font-size: 0.8rem; color: var(--text-muted);">(${rev.subjectCode})</span></h4>
                    <p style="font-style: italic; color: var(--text-color); opacity: 0.8;">"${rev.feedback || 'No comments provided'}"</p>
                    <div style="margin-top: 8px; font-size: 0.85rem;">
                        <span style="color: ${color}; font-weight: 700; background: ${color}11; padding: 2px 8px; border-radius: 12px;">Rating: ${rev.rating}/5</span> 
                        <span style="color: var(--text-muted); margin-left: 10px;">Score: <strong>${rev.marks}%</strong></span>
                    </div>
                </div>
                <div class="activity-time" style="font-weight: 600;">Just Now</div>
            `;
            gallery.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to load recent feedback:', err);
    }
}

function renderPieChart(dist) {
    const ctx = document.getElementById('difficultyPieChart');
    if (!ctx) return;

    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Easy', 'Intermediate', 'Difficult'],
            datasets: [{
                data: [dist.easy, dist.intermediate, dist.difficult],
                backgroundColor: [
                    'hsla(160, 84%, 39%, 0.8)',  /* Green */
                    'hsla(38, 92%, 50%, 0.8)',   /* Warning */
                    'hsla(0, 84%, 60%, 0.8)'     /* Danger */
                ],
                borderColor: 'transparent',
                hoverOffset: 15,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, padding: 25, font: { family: 'Outfit', size: 12, weight: '600' } }
                }
            }
        }
    });
}

function renderBarChart(labels, data) {
    const ctx = document.getElementById('subjectBarChart');
    if (!ctx) return;

    const textMuted = getComputedStyle(document.body).getPropertyValue('--text-muted').trim();
    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color').trim();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Difficulty Index',
                data: data,
                backgroundColor: primaryColor,
                borderRadius: 15,
                hoverBackgroundColor: primaryColor,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    grid: { color: 'rgba(0,0,0,0.03)' },
                    ticks: { color: textMuted, font: { family: 'Outfit', weight: '600' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textMuted, font: { family: 'Outfit', weight: '600' } }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

async function loadNotifications() {
    const userRole = localStorage.getItem('scda_role');
    const bell = document.getElementById('notification-bell');
    const countBadge = document.getElementById('notif-count');
    const dropdownList = document.getElementById('dropdown-notifications-list');

    if (userRole !== 'Teacher' || !bell) return;

    try {
        const notifications = await API.getNotifications();
        const unreadCount = notifications.filter(n => !n.is_read).length;

        // Update Badge
        if (unreadCount > 0) {
            countBadge.textContent = unreadCount;
            countBadge.style.display = 'block';
        } else {
            countBadge.style.display = 'none';
        }

        // Update Dropdown List
        if (notifications.length === 0) {
            dropdownList.innerHTML = '<p class="text-muted" style="padding: 10px; font-size: 0.9rem;">No new notifications.</p>';
            return;
        }

        dropdownList.innerHTML = '';
        notifications.forEach(note => {
            const item = document.createElement('div');
            item.className = `alert-item ${note.is_read ? '' : 'unread'}`;
            item.style.padding = '12px';
            item.style.borderBottom = '1px solid var(--border-color)';
            item.style.fontSize = '0.85rem';
            item.innerHTML = `
                <div style="margin-bottom: 5px;">
                    <strong style="color: var(--primary-color);">${note.subject_name}</strong>: ${note.message}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.8;">${new Date(note.created_at).toLocaleTimeString()}</span>
                    ${!note.is_read ? `<button class="btn" style="padding: 4px 10px; font-size: 0.7rem; border-radius: 8px;" onclick="markRead(${note.id})">Mark Read</button>` : ''}
                </div>
            `;
            dropdownList.appendChild(item);
        });

        // Toggle logic
        bell.onclick = (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('notifications-dropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        };

        // Close dropdown on click outside
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('notifications-dropdown');
            if (dropdown) dropdown.style.display = 'none';
        });

        const dropdown = document.getElementById('notifications-dropdown');
        if (dropdown) {
            dropdown.onclick = (e) => e.stopPropagation();
        }

    } catch (err) {
        console.error('Failed to load notifications:', err);
    }
}

window.markRead = async (id) => {
    try {
        await API.markNotificationRead(id);
        loadNotifications();
    } catch (err) {
        console.error('Failed to mark read:', err);
    }
};
