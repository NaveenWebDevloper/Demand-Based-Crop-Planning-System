const imagekit = require('../Utils/imagekit');
const { toFile } = require('@imagekit/nodejs');

// Upload single image
const uploadImage = async (req, res) => {
    try {
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

module.exports = { uploadImage };
