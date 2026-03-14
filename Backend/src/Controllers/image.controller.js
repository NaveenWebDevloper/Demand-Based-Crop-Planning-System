const imagekit = require('../Utils/imagekit');
const { toFile } = require('@imagekit/nodejs');
const UserModel = require('../Models/user.model');

// Upload single image for market demand
const uploadImage = async (req, res) => {
    try {
        if (!imagekit) {
            return res.status(500).json({ message: 'Image service not configured. Please set IMAGEKIT_* env variables.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        if (!req.file.buffer || !req.file.buffer.length) {
            return res.status(400).json({ message: 'Uploaded file is empty' });
        }

        const fileForUpload = await toFile(req.file.buffer, req.file.originalname);

        const response = await imagekit.files.upload({
            file: fileForUpload,
            fileName: req.file.originalname,
            folder: '/market-demand',
            useUniqueFileName: true
        });

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: response.url,
            imageId: response.fileId
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

// Upload profile image for user
const uploadProfileImage = async (req, res) => {
    try {
        if (!imagekit) {
            return res.status(500).json({ message: 'Image service not configured. Please set IMAGEKIT_* env variables.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        if (!req.file.buffer || !req.file.buffer.length) {
            return res.status(400).json({ message: 'Uploaded file is empty' });
        }

        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const fileForUpload = await toFile(req.file.buffer, req.file.originalname);

        const response = await imagekit.files.upload({
            file: fileForUpload,
            fileName: `profile-${userId}-${Date.now()}`,
            folder: '/profile-images',
            useUniqueFileName: true
        });

        // Update user's profile image
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                'profileImage.url': response.url,
                'profileImage.imageId': response.fileId
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Profile image uploaded successfully',
            imageUrl: response.url,
            imageId: response.fileId,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage
            }
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Error uploading profile image', error: error.message });
    }
};

// Upload profile image before registration
const uploadPreRegisterImage = async (req, res) => {
    try {
        if (!imagekit) {
            return res.status(500).json({ message: 'Image service not configured. Please set IMAGEKIT_* env variables.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        if (!req.file.buffer || !req.file.buffer.length) {
            return res.status(400).json({ message: 'Uploaded file is empty' });
        }

        const fileForUpload = await toFile(req.file.buffer, req.file.originalname);

        const response = await imagekit.files.upload({
            file: fileForUpload,
            fileName: `pre-reg-${Date.now()}`,
            folder: '/profile-images',
            useUniqueFileName: true
        });

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: response.url,
            imageId: response.fileId
        });
    } catch (error) {
        console.error('Pre-register image upload error:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

module.exports = { uploadImage, uploadProfileImage, uploadPreRegisterImage };
