const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    subject_code: { type: String, required: true },
    title: { type: String, required: true },
    uploaded_by: { type: String },
    fileUrl: { type: String },
    viewed: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
