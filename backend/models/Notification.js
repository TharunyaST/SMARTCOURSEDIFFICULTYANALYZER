const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { type: String, default: 'feedback' },
    subject_name: { type: String },
    message: { type: String },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
