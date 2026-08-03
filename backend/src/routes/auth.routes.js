const express = require('express');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { registerSchema, loginSchema, refreshTokenSchema, bootstrapAdminSchema } = require('../validations/auth.validation');
const {
  register,
  login,
  refreshTokenHandler,
  logout,
  getMe,
  bootstrapAdmin,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/refresh-token', authLimiter, validate({ body: refreshTokenSchema }), refreshTokenHandler);
router.post('/bootstrap-admin', authLimiter, validate({ body: bootstrapAdminSchema }), bootstrapAdmin);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
