const express = require('express');
const customOrderController = require('../controllers/customOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// إضافة طلب مخصص (User فقط)
router.post('/', upload.single('designImage'), authMiddleware(['user']), customOrderController.createCustomOrder);

// عرض جميع الطلبات المخصصة (Admin فقط)
router.get('/', authMiddleware(['admin']), customOrderController.getAllCustomOrders);
router.get('/:id', authMiddleware(['admin']), customOrderController.getCustomOrderById);
router.put('/:id/update-price', authMiddleware(['admin']), customOrderController.updateCustomOrderPrice);

// تحديث حالة الطلب المخصص (Admin فقط)
router.put('/:id/status', authMiddleware(['admin']), customOrderController.updateCustomOrderStatus);

// router.get(
//     '/:CustomOrderId', // Add :CustomOrderId as a URL parameter
    // authMiddleware(['user', 'admin']), // التحقق من أن المستخدم هو User اللي عمل الطلب أو Admin
//     customOrderController.getCustomOrderById
//   );
module.exports = router;