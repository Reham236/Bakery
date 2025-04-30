const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// إرسال إشعار جديد (Admin فقط)
router.post('/', authMiddleware(['admin']), notificationController.sendNotification);

// عرض الإشعارات الخاصة بالمستخدم (User فقط)
router.get('/', authMiddleware(['user']), notificationController.getUserNotifications);

// تحديث حالة الإشعار إلى مقروء (User فقط)
router.put('/:id/mark-as-read', authMiddleware(['user']), notificationController.markNotificationAsRead);

module.exports = router;