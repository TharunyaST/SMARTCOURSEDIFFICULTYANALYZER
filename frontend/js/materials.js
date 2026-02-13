document.addEventListener('DOMContentLoaded', () => {
    loadMaterialsGallery();
});

async function loadMaterialsGallery() {
    const gallery = document.getElementById('materials-gallery');
    if (!gallery) return;

    try {
        const subjects = await API.getSubjects();
        let allMaterials = [];

        subjects.forEach(sub => {
            if (sub.materials) {
                sub.materials.forEach(mat => {
                    allMaterials.push({ ...mat, subjectName: sub.name, subjectCode: sub.code });
                });
            }
        });

        if (allMaterials.length === 0) {
            gallery.innerHTML = '<p class="text-muted">No lecture materials available yet.</p>';
            return;
        }

        gallery.innerHTML = '';
        allMaterials.forEach(mat => {
            const avgRating = mat.ratings && mat.ratings.length > 0
                ? (mat.ratings.reduce((a, b) => a + b, 0) / mat.ratings.length).toFixed(1)
                : 'Unrated';
            const userRole = localStorage.getItem('scda_role');
            const isTeacher = userRole === 'Teacher';
            const isViewed = mat.viewed;

            const card = document.createElement('div');
            card.className = 'material-card';
            if (isViewed) card.style.borderLeft = '5px solid #2ecc71';

            card.innerHTML = `
                <div class="material-header">
                    <i class="fas fa-file-pdf pdf-icon"></i>
                    <div class="material-info">
                        <h3>${mat.title} ${isViewed ? '<span style="font-size: 0.7rem; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 20px; margin-left: 8px; border: 1px solid rgba(16,185,129,0.2);">COMPLETED</span>' : ''}</h3>
                        <div class="material-meta">
                            <span><i class="far fa-user"></i> ${mat.uploadedBy}</span>
                            <span><i class="far fa-calendar-alt"></i> ${new Date(mat.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: auto;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary-color); margin-bottom: 12px;">
                        <i class="fas fa-layer-group"></i> ${mat.subjectCode} • ${mat.subjectName}
                    </div>
                    
                    <div class="rating-stars-wrapper" style="margin-bottom: 20px;">
                        <div class="rating-stars" data-material-id="${mat.id}">
                            ${Array(5).fill(0).map((_, i) => `<span data-value="${i + 1}" style="cursor: pointer;">${i < Math.round(avgRating === 'Unrated' ? 0 : avgRating) ? '★' : '☆'}</span>`).join('')}
                            <span class="avg-rating">(${avgRating})</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="btn" style="flex: 1.2; font-size: 0.85rem; background: var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.open('${mat.fileUrl || '#'}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Open Document
                        </button>
                        <button class="btn" style="flex: 1; font-size: 0.85rem; background: ${isViewed ? 'var(--accent-color)' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="markAsViewed(${mat.id})">
                            <i class="fas ${isViewed ? 'fa-check-double' : 'fa-check'}"></i> ${isViewed ? 'Viewed' : 'Mark Done'}
                        </button>
                    </div>

                    ${isTeacher ? `
                        <button class="btn" style="width: 100%; margin-top: 12px; font-size: 0.8rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);" onclick="deleteMaterial(${mat.id})">
                            <i class="fas fa-trash-alt"></i> Delete Material
                        </button>
                    ` : ''}
                </div>
            `;
            gallery.appendChild(card);
        });

        setupRatingElements(allMaterials);
    } catch (err) {
        console.error('Failed to load materials:', err);
    }
}

function setupRatingElements(allMaterials) {
    const starContainers = document.querySelectorAll('.rating-stars');

    starContainers.forEach(container => {
        const stars = container.querySelectorAll('span[data-value]');
        const materialId = parseInt(container.dataset.materialId);
        const material = allMaterials.find(m => m.id === materialId);

        const currentAvg = material && material.ratings && material.ratings.length > 0
            ? Math.round(material.ratings.reduce((a, b) => a + b, 0) / material.ratings.length)
            : 0;

        const resetStars = () => {
            stars.forEach(star => {
                star.textContent = parseInt(star.dataset.value) <= currentAvg ? '★' : '☆';
            });
        };

        stars.forEach(star => {
            star.addEventListener('mouseover', function () {
                const val = parseInt(this.dataset.value);
                stars.forEach(s => {
                    s.textContent = parseInt(s.dataset.value) <= val ? '★' : '☆';
                });
            });

            star.addEventListener('mouseout', resetStars);

            star.addEventListener('click', async function (e) {
                e.preventDefault();
                const val = parseInt(this.dataset.value);
                try {
                    await API.rateMaterial(materialId, val);
                    // Show a quick success feedback
                    this.parentElement.innerHTML = `<span style="color: #10b981; font-size: 0.8rem;"><i class="fas fa-check"></i> Rated ${val}/5</span>`;
                    setTimeout(() => loadMaterialsGallery(), 1000);
                } catch (err) {
                    console.error('Rating failed:', err);
                }
            });
        });
    });
}

window.markAsViewed = async (materialId) => {
    try {
        const btn = event.currentTarget;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        await API.markMaterialViewed(materialId);

        // Add a temporary animation or delay for better UX
        setTimeout(() => {
            loadMaterialsGallery();
        }, 300);
    } catch (err) {
        console.error('Failed to mark viewed:', err);
    }
};

window.deleteMaterial = async (materialId) => {
    if (confirm('Are you sure you want to delete this lecture material? This cannot be undone.')) {
        try {
            await API.deleteMaterial(materialId);
            loadMaterialsGallery();
        } catch (err) {
            console.error('Failed to delete material:', err);
        }
    }
};
