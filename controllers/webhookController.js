// controllers/webhookController.js
const Order = require('../models/Order');

exports.processWebhook = async (req, res) => {
  const event = req.body.event_type;

  if (event === 'PAYMENT.SALE.COMPLETED') {
    const paymentId = req.body.resource.payment_id;
    const orderId = req.body.resource.order_id;

    try {
      await Order.findOneAndUpdate(
        { paymentId },
        {
          paymentStatus: 'Completed',
          transactionId: req.body.resource.transaction_id,
        }
      );

      res.status(200).send('OK'); // PayPal يتوقع رداً 200 OK
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Error');
    }
  } else {
    res.status(200).send('OK'); // لباقي الأحداث
  }
};
