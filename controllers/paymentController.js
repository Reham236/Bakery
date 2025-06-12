const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../utils/paypalClient');
const Order = require('../models/Order');

exports.createPayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // البحث عن الطلب
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // إنشاء طلب الدفع في PayPal
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.total.toString(),
        },
      }],
    });

    const client = paypalClient();
    const response = await client.execute(request);

    // إرجاع رابط الدفع للمستخدم
    const approvalLink = response.result.links.find(link => link.rel === 'approve');

    res.json({
      approvalUrl: approvalLink.href,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Error creating PayPal payment:', error);
    res.status(500).json({ message: 'Server Error - Payment Failed' });
  }
};

// استقبال الرد بعد الدفع (Webhook أو Return URL)
exports.capturePayment = async (req, res) => {
  const { token } = req.query;
  const { orderId } = req.body;

  if (!token || !orderId) {
    return res.status(400).json({
      status: 'failed',
      message: 'Missing token or orderId'
    });
  }

  try {
    // 1. التأكد من وجود الطلب
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Capture الدفع من PayPal
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const client = paypalClient();
    const response = await client.execute(request);

    if (response.statusCode === 201) {
      // 3. تحديث حالة الطلب
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Completed',
        paymentId: response.result.id,
        transactionId: response.result.purchase_units[0].payments.captures[0].id,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Payment completed successfully',
        orderId,
        paymentId: response.result.id,
        transactionId: response.result.purchase_units[0].payments.captures[0].id
      });

    } else {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Failed',
      });

      return res.status(400).json({
        status: 'failed',
        message: 'Payment failed',
        orderId
      });
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error.message);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'failed',
        message: 'Invalid PayPal token or order not found',
        details: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error capturing payment',
      error: error.message
    });
  }
};