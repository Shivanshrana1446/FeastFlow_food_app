const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../constants/roles');
const { createReviewSchema, listReviewsQuerySchema } = require('../validations/review.validation');
const { createReview, listReviews } = require('../controllers/review.controller');

const router = express.Router();

router.get('/', validate({ query: listReviewsQuerySchema }), listReviews);
router.post(
  '/',
  authenticate,
  authorize(ROLES.CUSTOMER),
  validate({ body: createReviewSchema }),
  createReview
);

module.exports = router;
