const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    path: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
});

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },

    files: [fileSchema],
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
