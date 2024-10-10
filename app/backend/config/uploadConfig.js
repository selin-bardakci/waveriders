import multer from 'multer';
import path from 'path';
import express from 'express';
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Path where files will be saved
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // Create unique filename
  }
});

const upload = multer({ storage });

// Middleware to parse JSON bodies
const jsonParser = express.json();

export { jsonParser, upload };

