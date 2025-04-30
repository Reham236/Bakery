const express = require('express');
const customOrderController = require('../controllers/customOrderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// إضافة طلب مخصص (User فقط)
router.post('/', authMiddleware(['user']), customOrderController.createCustomOrder);

// عرض جميع الطلبات المخصصة (Admin فقط)
router.get('/', authMiddleware(['admin']), customOrderController.getAllCustomOrders);

// تحديث حالة الطلب المخصص (Admin فقط)
router.put('/:id/status', authMiddleware(['admin']), customOrderController.updateCustomOrderStatus);

router.get(
    '/:CustomOrderId', // Add :CustomOrderId as a URL parameter
    authMiddleware(['user', 'admin']), // التحقق من أن المستخدم هو User اللي عمل الطلب أو Admin
    customOrderController.getCustomOrderById
  );
module.exports = router;