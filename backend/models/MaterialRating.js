const mongoose = require('mongoose');

const materialRatingSchema = new mongoose.Schema({
    material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    rating: { type: Number, min: 1, max: 5, required: true }
});

module.exports = mongoose.model('MaterialRating', materialRatingSchema);
