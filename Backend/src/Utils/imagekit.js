const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const ImageKit = require('@imagekit/nodejs');

// Gracefully handle missing ImageKit configuration so the server can still run.
if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.warn('⚠️ ImageKit environment variables are missing. Image uploads will be disabled.');
    module.exports = null;
} else {
    const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    module.exports = imagekit;
}
