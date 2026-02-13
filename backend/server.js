const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5000;

// Test DB Connection
db.getConnection()
    .then(conn => {
        console.log('✅ Connected to MySQL database');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Connection Failed:', err.message);
        console.log('Please ensure your MySQL server is running and credentials in .env are correct.');
    });

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (users.length > 0) {
            console.log(`Login success: ${username}`);
            res.json({ success: true, user: { username: users[0].username, role: users[0].role } });
        } else {
            console.log(`Login failed for: ${username}`);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Subject Routes ---
app.get('/api/subjects', async (req, res) => {
    try {
        const [subjects] = await db.execute('SELECT * FROM subjects');
        for (let sub of subjects) {
            const [reviews] = await db.execute('SELECT rating, marks, feedback FROM reviews WHERE subject_code = ?', [sub.code]);
            const [materials] = await db.execute('SELECT * FROM materials WHERE subject_code = ?', [sub.code]);
            for (let mat of materials) {
                const [mRatings] = await db.execute('SELECT rating FROM material_ratings WHERE material_id = ?', [mat.id]);
                mat.ratings = mRatings.map(r => r.rating);
            }
            sub.reviews = reviews;
            sub.materials = materials;
        }
        res.json(subjects);
    } catch (err) {
        console.error('Get Subjects Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/subjects', async (req, res) => {
    const { code, name } = req.body;
    try {
        await db.execute('INSERT INTO subjects (code, name) VALUES (?, ?)', [code, name]);
        res.json({ success: true });
    } catch (err) {
        console.error('Add Subject Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Feedback Routes ---
app.post('/api/feedback', async (req, res) => {
    const { subject_code, rating, marks, feedback } = req.body;
    try {
        await db.execute('INSERT INTO reviews (subject_code, rating, marks, feedback) VALUES (?, ?, ?, ?)',
            [subject_code, rating, marks, feedback]);

        const [subject] = await db.execute('SELECT name FROM subjects WHERE code = ?', [subject_code]);
        if (subject.length > 0) {
            const subName = subject[0].name;
            await db.execute('INSERT INTO notifications (subject_name, message) VALUES (?, ?)',
                [subName, `New feedback received for ${subName} (Rating: ${rating}/5)`]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Feedback Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Material Routes ---
app.post('/api/materials', async (req, res) => {
    const { subject_code, title, uploaded_by } = req.body;
    try {
        await db.execute('INSERT INTO materials (subject_code, title, uploaded_by) VALUES (?, ?, ?)',
            [subject_code, title, uploaded_by]);
        res.json({ success: true });
    } catch (err) {
        console.error('Add Material Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/materials/:id/view', async (req, res) => {
    try {
        await db.execute('UPDATE materials SET viewed = TRUE WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('View Material Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/materials/:id/rate', async (req, res) => {
    const { rating } = req.body;
    try {
        await db.execute('INSERT INTO material_ratings (material_id, rating) VALUES (?, ?)', [req.params.id, rating]);
        res.json({ success: true });
    } catch (err) {
        console.error('Rate Material Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Notification Routes ---
app.get('/api/notifications', async (req, res) => {
    try {
        const [notifications] = await db.execute('SELECT * FROM notifications ORDER BY created_at DESC');
        res.json(notifications);
    } catch (err) {
        console.error('Get Notifications Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/notifications/:id/read', async (req, res) => {
    try {
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Mark Read Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
