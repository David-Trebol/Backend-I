const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    species: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);

