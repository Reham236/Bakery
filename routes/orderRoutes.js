const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware for Validation
// const validateOrder = [
//   body('products').isArray({ min: 1 }).withMessage('Products must be an array with at least one item'),
  // body('total').isNumeric({ min: 0 }).withMessage('Total price must be a positive number'),
// ];

// إضافة طلب جديد (User only)
router.post(
  '/',
  authMiddleware(['user']), // التحقق من أن المستخدم مسجل
  // validateOrder,
  // (req, res, next) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  //   }
  //   next();
  // },
  orderController.createOrder
);
router.post('/create-payment', authMiddleware(['user']), orderController.createPayPalPayment);
router.get('/success', orderController.handlePaymentSuccess);
router.get('/cancel', orderController.handlePaymentCancel);
router.get('/failed', orderController.handlePaymentFailure);

// تعديل حالة الطلب (Admin only)
router.put(
  '/:orderId', // المسار واضح ويتعلق بالحالة
  authMiddleware(['admin']), // التحقق من أن المستخدم هو Admin
  orderController.updateOrderStatus
);

// عرض جميع الطلبات (Admin only)
router.get(
  '/',
  authMiddleware(['admin']), // التحقق من أن المستخدم هو Admin
  orderController.getAllOrders
);

// عرض طلب واحد (User or Admin)
router.get(
    '/:orderId', // Add :orderId as a URL parameter
    authMiddleware(['user', 'admin']), // التحقق من أن المستخدم هو User اللي عمل الطلب أو Admin
    orderController.getOrderById
  );

module.exports = router;