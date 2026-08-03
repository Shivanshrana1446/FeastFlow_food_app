const Notification = require('../models/notification.model');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

/** Fire-and-forget: creates an in-app notification for a user. */
async function notify(userId, type, title, message, data = {}) {
  return Notification.create({ user: userId, type, title, message, data });
}

async function listMine(userId, query) {
  const { page, limit } = query;
  return paginate(Notification, { filter: { user: userId }, page, limit, sortBy: 'createdAt:desc' });
}

async function unreadCount(userId) {
  return Notification.countDocuments({ user: userId, isRead: false });
}

async function markRead(userId, id) {
  const notification = await Notification.findOne({ _id: id, user: userId });
  if (!notification) throw ApiError.notFound('Notification not found');
  notification.isRead = true;
  await notification.save();
  return notification;
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}

module.exports = { notify, listMine, unreadCount, markRead, markAllRead };
