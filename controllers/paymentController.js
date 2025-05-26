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
  const orderId = req.body.orderId; // أو جاي من الرابط

  try {
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const client = paypalClient();
    const response = await client.execute(request);

    if (response.statusCode === 201) {
      // تحديث حالة الطلب
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Completed',
        paymentId: response.result.id,
        transactionId: response.result.purchase_units[0].payments.captures[0].id,
      });

      return res.redirect('http://yourfrontend.com/payment-success'); // ← فرونت
    } else {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Failed',
      });

      return res.redirect('http://yourfrontend.com/payment-failure'); // ← فرونت
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ message: 'Error capturing payment' });
  }
};