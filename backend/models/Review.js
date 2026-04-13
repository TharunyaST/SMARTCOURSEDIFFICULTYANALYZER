const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    subject_code: { type: String, required: true },
    studentName: { type: String, default: 'Anonymous' },
    rating: { type: Number, min: 1, max: 5, required: true },
    marks: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
