const express = require('express');
const { uploadImage } = require('../Controllers/image.controller');
const upload = require('../Middleware/multer');

const router = express.Router();

// Upload image endpoint
router.post('/upload', upload.single('image'), uploadImage);

module.exports = router;
