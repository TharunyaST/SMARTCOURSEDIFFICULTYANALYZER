const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();

// Import Mongoose models
const User = require('./models/User');
const Subject = require('./models/Subject');
const Review = require('./models/Review');
const Material = require('./models/Material');
const MaterialRating = require('./models/MaterialRating');
const Notification = require('./models/Notification');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files from vite build
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            console.log(`Login success: ${email}`);
            res.json({ success: true, user: { email: user.email, role: user.role, name: user.name } });
        } else {
            console.log(`Login failed for: ${email}`);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log('Received registration data:', { name, email, password, role });
    try {
        if (!email || !password || !role) {
            let missing = [];
            if (!email) missing.push('email');
            if (!password) missing.push('password');
            if (!role) missing.push('role');
            console.log('Registration rejected: Missing fields:', missing);
            return res.status(400).json({ 
                success: false, 
                message: `All fields are required. Missing: ${missing.join(', ')}`,
                received: { name, email, password: password ? '***' : null, role }
            });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered. Please sign in.' });
        }
        const user = await User.create({ name: name || '', email, password, role });
        console.log(`Registration success: ${email} as ${role}`);
        res.json({ success: true, user: { email: user.email, role: user.role, name: user.name } });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Subject Routes ---
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await Subject.find().lean();
        for (let sub of subjects) {
            const reviews = await Review.find({ subject_code: sub.code }, 'rating marks feedback studentName created_at').lean();
            const materials = await Material.find({ subject_code: sub.code }).lean();
            for (let mat of materials) {
                const mRatings = await MaterialRating.find({ material_id: mat._id }).lean();
                mat.ratings = mRatings.map(r => r.rating);
                mat.id = mat._id; // keep 'id' field for frontend compatibility
            }
            sub.reviews = reviews;
            sub.materials = materials;
            sub.id = sub._id; // keep 'id' field for frontend compatibility
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
        await Subject.create({ code, name });
        res.json({ success: true });
    } catch (err) {
        console.error('Add Subject Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/subjects/:code', async (req, res) => {
    try {
        const code = req.params.code;
        await Subject.findOneAndDelete({ code: code });
        await Review.deleteMany({ subject_code: code });
        await Material.deleteMany({ subject_code: code });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Subject Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Feedback Routes ---
app.post('/api/feedback', async (req, res) => {
    const { subject_code, rating, marks, feedback, studentName } = req.body;
    try {
        await Review.create({ subject_code, rating, marks, feedback, studentName });

        const subject = await Subject.findOne({ code: subject_code });
        if (subject) {
            await Notification.create({
                subject_name: subject.name,
                message: `New feedback received for ${subject.name} (Rating: ${rating}/5)`
            });
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
        await Material.create({ subject_code, title, uploaded_by });
        res.json({ success: true });
    } catch (err) {
        console.error('Add Material Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/materials/:id/view', async (req, res) => {
    try {
        await Material.findByIdAndUpdate(req.params.id, { viewed: true });
        res.json({ success: true });
    } catch (err) {
        console.error('View Material Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/materials/:id/rate', async (req, res) => {
    const { rating } = req.body;
    try {
        await MaterialRating.create({ material_id: req.params.id, rating });
        res.json({ success: true });
    } catch (err) {
        console.error('Rate Material Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Notification Routes ---
app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ created_at: -1 }).lean();
        // Add 'id' field for frontend compatibility
        notifications.forEach(n => { n.id = n._id; });
        res.json(notifications);
    } catch (err) {
        console.error('Get Notifications Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/notifications/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
        res.json({ success: true });
    } catch (err) {
        console.error('Mark Read Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/notifications/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Notification Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Catch-all for React Router ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Project viewable at: http://localhost:${PORT}`);
});
