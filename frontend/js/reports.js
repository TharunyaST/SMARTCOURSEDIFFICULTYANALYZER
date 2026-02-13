document.addEventListener('DOMContentLoaded', () => {
    loadReports();
});

async function loadReports() {
    try {
        const subjects = await API.getSubjects();
        const tableBody = document.querySelector('#reports-table tbody');

        if (!tableBody) return;
        tableBody.innerHTML = '';

        let subjectNames = [];
        let diffIndexes = [];

        subjects.forEach(sub => {
            const reviews = sub.reviews || [];
            let avgRating = 0;
            let avgMarks = 0;

            if (reviews.length > 0) {
                avgRating = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
                avgMarks = reviews.reduce((a, b) => a + b.marks, 0) / reviews.length;
            }

            const diffIndex = (avgRating * 0.6) + (((100 - avgMarks) / 20) * 0.4);
            const formattedDiff = diffIndex.toFixed(1);

            let difficultyLabel = 'Optimal';
            let badgeStyle = 'background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);';

            if (diffIndex >= 2.5 && diffIndex < 4) {
                difficultyLabel = 'Balanced';
                badgeStyle = 'background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);';
            } else if (diffIndex >= 4) {
                difficultyLabel = 'High Stress';
                badgeStyle = 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);';
            }

            subjectNames.push(sub.name);
            diffIndexes.push(formattedDiff);

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-color)';
            row.innerHTML = `
                <td style="padding: 20px;">
                    <div style="font-weight: 700;">${sub.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${sub.code}</div>
                </td>
                <td style="padding: 20px; font-weight: 500;">${reviews.length} Students</td>
                <td style="padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 600;">${avgRating.toFixed(1)}</span>
                        <div style="flex: 1; height: 6px; background: #eee; border-radius: 10px; min-width: 60px;">
                            <div style="width: ${(avgRating / 5) * 100}%; height: 100%; background: var(--primary-color); border-radius: 10px;"></div>
                        </div>
                    </div>
                </td>
                <td style="padding: 20px;">
                    <span style="padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; ${badgeStyle}">
                        ${difficultyLabel} (${formattedDiff})
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });

        const ctx = document.getElementById('reportsBarChart');
        if (ctx && subjectNames.length > 0) {
            // Destroy existing chart if it exists
            const existingChart = Chart.getChart(ctx);
            if (existingChart) existingChart.destroy();

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: subjectNames,
                    datasets: [{
                        label: 'Difficulty Index',
                        data: diffIndexes,
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderRadius: 12,
                        hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
                        barThickness: 35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { color: '#64748b', font: { weight: '600' } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#64748b', font: { weight: '600' } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        setupExportButton();
    } catch (err) {
        console.error('Failed to load reports:', err);
    }
}

function setupExportButton() {
    const header = document.querySelector('.top-header');
    if (!header || document.getElementById('export-btn')) return;

    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-btn';
    exportBtn.className = 'btn';
    exportBtn.style.background = 'var(--secondary-color)';
    exportBtn.style.padding = '8px 15px';
    exportBtn.style.fontSize = '0.85rem';
    exportBtn.style.marginLeft = '15px';
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Report';

    exportBtn.onclick = () => {
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        setTimeout(() => {
            alert('Report generation complete! Your academic analysis PDF is ready for download (this is a prototype demonstration).');
            exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Report';
        }, 1500);
    };

    const rightGroup = header.querySelector('div:last-child');
    if (rightGroup) {
        rightGroup.insertBefore(exportBtn, rightGroup.querySelector('#theme-toggle'));
    }
}
