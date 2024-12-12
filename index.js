const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const Candidate = require("./models/Candidate"); // Ensure this exists
const cors = require('cors');

// Middleware
app.use(express.json({ limit: "200mb" }));
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/fileUploadDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer configuration for multiple files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});
const maxSize = 1 * 1000 * 1000; // Max file size 1 MB
const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
    },
}).array("mypic", 5); // Use .array() for multiple files, here max 5 files

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
    res.render("Signup");
});

app.post("/uploadProfilePicture", (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send("Error: " + err.message);
        } else if (err) {
            return res.status(400).send(err);
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).send("Error: No files uploaded.");
        }

        // Save file details to MongoDB
        try {
            const candidate = new Candidate({
                name: req.body.name, // Assuming name is passed in the form
                profilePictures: req.files.map(file => file.path), // Save multiple file paths
            });
            await candidate.save();
            res.send("Success, Images uploaded and saved to database!");
        } catch (dbError) {
            res.status(500).send("Database error: " + dbError.message);
        }
    });
});


// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
