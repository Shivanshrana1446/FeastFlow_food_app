const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List the current user's notifications, newest first (includes unreadCount in meta)
 *     tags: [Notifications]
 */
const listNotifications = asyncHandler(async (req, res) => {
  const [{ results, meta }, unreadCount] = await Promise.all([
    notificationService.listMine(req.user._id, req.query),
    notificationService.unreadCount(req.user._id),
  ]);
  new ApiResponse(200, results, 'Notifications fetched', { ...meta, unreadCount }).send(res);
});

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.user._id, req.params.id);
  new ApiResponse(200, notification, 'Notification marked as read').send(res);
});

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Mark every notification for the current user as read
 *     tags: [Notifications]
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
