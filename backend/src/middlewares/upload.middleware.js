const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Files are held only in memory for the lifetime of the request, then streamed straight to
// Cloudinary (see utils/cloudinaryUpload.js) — nothing is ever written to local disk, so there's
// nothing to clean up afterward and nothing for Render's ephemeral filesystem to lose on
// redeploy/restart.
const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed'));
  }
  return cb(null, true);
};

const makeUploader = () =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  });

module.exports = { makeUploader };
