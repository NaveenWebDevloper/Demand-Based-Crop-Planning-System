const express = require('express');
const { uploadImage, uploadProfileImage, uploadPreRegisterImage } = require('../Controllers/image.controller');
const upload = require('../Middleware/multer');
const { verifyToken } = require('../Middleware/auth.middleware');

const router = express.Router();

// Upload image for market demand
router.post('/upload', upload.single('image'), uploadImage);

// Upload profile image for user
router.post('/upload-profile', upload.single('image'), uploadProfileImage);

// Upload profile image before registration
router.post('/upload-pre-register', upload.single('image'), uploadPreRegisterImage);

module.exports = router;
