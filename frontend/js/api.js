// Standalone Mockup API layer using localStorage
const STORAGE_KEYS = {
    SUBJECTS: 'scda_subjects',
    NOTIFICATIONS: 'scda_notifications'
};

// Initial default data
const DEFAULT_SUBJECTS = [
    {
        code: 'CS101',
        name: 'Intro to Programming',
        reviews: [
            { rating: 2, marks: 85, feedback: 'Basics were clear.' },
            { rating: 3, marks: 75, feedback: 'A bit fast-paced.' }
        ],
        materials: [
            { id: 1, title: 'Lecture 1: Introduction to Variables', uploadedBy: 'Prof. Smith', viewed: false, fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: new Date().toISOString() },
            { id: 2, title: 'Lecture 2: Control Flow & Loops', uploadedBy: 'Prof. Smith', viewed: false, fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: new Date().toISOString() }
        ]
    },
    {
        code: 'CS102',
        name: 'Data Structures',
        reviews: [
            { rating: 4, marks: 60, feedback: 'Very challenging concepts.' }
        ],
        materials: [
            { id: 3, title: 'Arrays and Linked Lists Overview', uploadedBy: 'Dr. Johnson', viewed: false, fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: new Date().toISOString() }
        ]
    },
    {
        code: 'CS201',
        name: 'Database Systems',
        reviews: [
            { rating: 3, marks: 78, feedback: 'Interesting labs.' }
        ],
        materials: [
            { id: 4, title: 'SQL Basics and Normalization', uploadedBy: 'Ms. Davis', viewed: false, fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: new Date().toISOString() }
        ]
    }
];

const API = {
    // Utility to get data from local storage
    _getData: (key, defaultValue = []) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error("Error reading localStorage:", e);
            return defaultValue;
        }
    },

    // Utility to save data to local storage
    _saveData: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving to localStorage:", e);
        }
    },

    // Auth (Mock)
    login: async (username, password) => {
        // Just simulate a small delay
        await new Promise(r => setTimeout(r, 300));
        const role = username.toLowerCase().includes('teacher') ? 'Teacher' : 'Student';
        return { success: true, user: { username, role } };
    },

    // Subjects
    getSubjects: async () => {
        let subjects = API._getData(STORAGE_KEYS.SUBJECTS);

        // Robust initialization: If storage is empty OR if materials are missing/empty (old data version)
        const needsInitialization = subjects.length === 0 ||
            (subjects.length > 0 && (!subjects[0].materials || subjects[0].materials.length === 0));

        if (needsInitialization) {
            console.log("Initializing/Refreshing default subjects and materials...");
            // Use deep copy to avoid reference issues
            subjects = JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
            API._saveData(STORAGE_KEYS.SUBJECTS, subjects);
        }
        return subjects;
    },

    addSubject: async (code, name) => {
        const subjects = await API.getSubjects();
        if (subjects.find(s => s.code === code)) return { success: false, message: 'Subject already exists' };

        const newSub = { code, name, reviews: [], materials: [] };
        subjects.push(newSub);
        API._saveData(STORAGE_KEYS.SUBJECTS, subjects);
        return { success: true };
    },

    // Feedback
    submitFeedback: async (feedbackData) => {
        const subjects = await API.getSubjects();
        const sub = subjects.find(s => s.code === feedbackData.subject_code);
        if (sub) {
            sub.reviews.push({
                rating: parseInt(feedbackData.rating),
                marks: parseInt(feedbackData.marks),
                feedback: feedbackData.feedback
            });
            API._saveData(STORAGE_KEYS.SUBJECTS, subjects);

            // Add notification
            const notifications = API._getData(STORAGE_KEYS.NOTIFICATIONS);
            notifications.unshift({
                id: Date.now(),
                subject_name: sub.name,
                message: `New feedback received for ${sub.name} (Rating: ${feedbackData.rating}/5)`,
                is_read: false,
                created_at: new Date().toISOString()
            });
            API._saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
        return { success: true };
    },

    // Materials
    addMaterial: async (materialData) => {
        const subjects = await API.getSubjects();
        const sub = subjects.find(s => s.code === (materialData.subject_code || materialData.subjectCode));
        if (sub) {
            sub.materials.push({
                id: Date.now(),
                title: materialData.title,
                uploadedBy: materialData.uploadedBy || materialData.uploaded_by,
                viewed: false,
                created_at: new Date().toISOString()
            });
            API._saveData(STORAGE_KEYS.SUBJECTS, subjects);
        }
        return { success: true };
    },

    markMaterialViewed: async (id) => {
        const subjects = await API.getSubjects();
        subjects.forEach(sub => {
            const mat = sub.materials.find(m => m.id == id);
            if (mat) mat.viewed = true;
        });
        API._saveData(STORAGE_KEYS.SUBJECTS, subjects);
        return { success: true };
    },

    rateMaterial: async (id, rating) => {
        const subjects = await API.getSubjects();
        subjects.forEach(sub => {
            const mat = sub.materials.find(m => m.id == id);
            if (mat) {
                if (!mat.ratings) mat.ratings = [];
                mat.ratings.push(parseInt(rating));
            }
        });
        API._saveData(STORAGE_KEYS.SUBJECTS, subjects);
        return { success: true };
    },


    deleteMaterial: async (id) => {
        const subjects = await API.getSubjects();
        subjects.forEach(sub => {
            if (sub.materials) {
                sub.materials = sub.materials.filter(m => m.id != id);
            }
        });
        API._saveData(STORAGE_KEYS.SUBJECTS, subjects);
        return { success: true };
    },

    // Notifications
    getNotifications: async () => {
        return API._getData(STORAGE_KEYS.NOTIFICATIONS);
    },

    markNotificationRead: async (id) => {
        const notifications = API._getData(STORAGE_KEYS.NOTIFICATIONS);
        const note = notifications.find(n => n.id == id);
        if (note) note.is_read = true;
        API._saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
        return { success: true };
    }
};
