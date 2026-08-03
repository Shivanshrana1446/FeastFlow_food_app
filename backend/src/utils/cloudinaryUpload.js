const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');

/** Streams an in-memory file buffer to Cloudinary. Resolves to { url, publicId }. */
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        return resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

/** Best-effort delete of a previous image when it's being replaced — never blocks the request. */
async function destroyCloudinaryAsset(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.warn(`Failed to delete stale Cloudinary asset ${publicId}: ${error.message}`);
  }
}

module.exports = { uploadBufferToCloudinary, destroyCloudinaryAsset };
