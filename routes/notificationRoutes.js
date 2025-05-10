const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// جلب إشعارات المستخدم الحالي
router.get('/', authMiddleware(['user', 'admin']), notificationController.getUserNotifications);

// Get Admin Notifications
router.get('/admin', authMiddleware(['admin']), notificationController.getAdminNotifications);

// وضع علامة "مقروء" على إشعار
router.patch('/:id/read', authMiddleware(['user', 'admin']), notificationController.markNotificationAsRead);

module.exports = router;