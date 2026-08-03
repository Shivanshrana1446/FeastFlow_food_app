const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOAD_ROOT, subfolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 40);
      cb(null, `${Date.now()}-${safeBase || 'file'}${ext}`);
    },
  });

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed'));
  }
  return cb(null, true);
};

const makeUploader = (subfolder) =>
  multer({
    storage: storage(subfolder),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  });

/** Public URL path for a file saved by the uploader above. */
const toPublicUrl = (subfolder, filename) => `/uploads/${subfolder}/${filename}`;

module.exports = { makeUploader, toPublicUrl };
