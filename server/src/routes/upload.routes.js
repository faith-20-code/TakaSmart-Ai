const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const { uploadImage } = require('../services/upload.service');

// multer with memory storage — stores the file in RAM temporarily
// instead of writing to disk, so we can stream it straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload/image
// Accepts a single file with field name "image"
// Returns the Cloudinary URL
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const url = await uploadImage(req.file.buffer);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;