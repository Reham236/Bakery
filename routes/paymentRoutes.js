const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// بدء عملية الدفع (User فقط)
router.get(
  '/create-payment/:orderId',
  authMiddleware(['user']),
  paymentController.createPayment
);

// استقبال النتيجة بعد الدفع
router.get(
  '/capture-payment',
  paymentController.capturePayment
);

module.exports = router;