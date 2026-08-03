const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamSchema } = require('../validations/common.validation');
const { listQuerySchema } = require('../validations/notification.validation');
const { listNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', validate({ query: listQuerySchema }), listNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', validate({ params: idParamSchema }), markAsRead);

module.exports = router;
