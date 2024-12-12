const express = require('express');
const multer = require('multer');
const Candidate = require('../models/Candidate');

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Upload Files API
router.post('/upload', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files.map(file => ({
            path: file.path,
            name: file.originalname,
            type: file.mimetype,
        }));

        const { name, email } = req.body;

        const newCandidate = new Candidate({
            name,
            email,
            files,
        });

        await newCandidate.save();
        res.status(201).json({ message: 'Files uploaded successfully', candidate: newCandidate });
    } catch (err) {
        res.status(500).json({ error: 'Error uploading files', details: err.message });
    }
});

// Get All Candidates API
router.get('/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.status(200).json(candidates);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching candidates', details: err.message });
    }
});

// Search Candidates API
router.get('/candidates/search', async (req, res) => {
    const { query } = req.query;
    try {
        const candidates = await Candidate.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') },
            ],
        });
        res.status(200).json(candidates);
    } catch (err) {
        res.status(500).json({ error: 'Error searching candidates', details: err.message });
    }
});

// Get Candidate Details API
router.get('/candidates/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        res.status(200).json(candidate);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching candidate', details: err.message });
    }
});

module.exports = router;
