const Review = require('../models/review.model');
const Order = require('../models/order.model');
const Restaurant = require('../models/restaurant.model');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const { ORDER_STATUS } = require('../constants/orderStatus');
const { NOTIFICATION_TYPE } = require('../constants/notification');
const notificationService = require('./notification.service');

async function createReview(user, { order: orderId, rating, comment }) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== user._id.toString()) {
    throw ApiError.forbidden('You may only review your own orders');
  }
  if (order.status !== ORDER_STATUS.DELIVERED) {
    throw ApiError.badRequest('You can only review an order after it has been delivered');
  }

  const existing = await Review.findOne({ order: orderId });
  if (existing) throw ApiError.conflict('You have already reviewed this order');

  const review = await Review.create({
    user: user._id,
    restaurant: order.restaurant,
    order: orderId,
    rating,
    comment,
  });

  const restaurant = await Restaurant.findById(order.restaurant);
  const newCount = restaurant.ratingCount + 1;
  const newAvg = (restaurant.ratingAvg * restaurant.ratingCount + rating) / newCount;
  restaurant.ratingCount = newCount;
  restaurant.ratingAvg = Math.round(newAvg * 10) / 10;
  await restaurant.save();

  await notificationService.notify(
    restaurant.owner,
    NOTIFICATION_TYPE.REVIEW_RECEIVED,
    'New review received',
    `${user.name} left a ${rating}-star review for ${restaurant.name}.`,
    { restaurantId: restaurant._id, reviewId: review._id }
  );

  return review;
}

async function listReviews(query) {
  const { restaurant, page, limit, sortBy } = query;
  return paginate(Review, {
    filter: { restaurant },
    page,
    limit,
    sortBy,
    populate: [{ path: 'user', select: 'name avatarUrl' }],
  });
}

module.exports = { createReview, listReviews };
