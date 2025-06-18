

  const paypalClient = require('../utils/paypalClient');
  const Order = require('../models/Order');






exports.createPayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // البحث عن الطلب
    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // إنشاء كائن الدفع
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal"
      },
      redirect_urls: {
        return_url: `http://localhost:5000/api/payments/capture-payment?orderId=${orderId}`,
        cancel_url: 'https://vanilla-orpin-eight.vercel.app/order-cancel'
      },
      transactions: [{
        item_list: {
          items: order.products.map(p => ({
            name: p.name,
            sku: p._id,
            price: p.price.toFixed(2),
            currency: "USD",
            quantity: p.quantity
          }))
        },
        amount: {
          // في createPayment function
       
          currency: "USD",
          total: order.total.toFixed(2)
        },
        description: `Payment for order #${orderId}`
      }]
    };



    paypalClient.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error("Error creating PayPal payment:", error);
        return res.status(500).json({ message: "Failed to create PayPal payment" ,conserr: error});
      }

      // البحث عن رابط التوجيه للمستخدم
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url')?.href;

      res.json({
        approvalUrl,
        paymentId: payment.id,
        orderId: order._id
      });
    });

  } catch (error) {
    console.error('Error creating PayPal payment:', error);
    res.status(500).json({ message: 'Server Error - Payment Failed' });
  }
};


exports.capturePayment = async (req, res) => {
  const {orderId,paymentId, PayerID } = req.query;

  

  if (!paymentId || !PayerID || !orderId) {
    return res.status(400).json({
      status: 'failed',
      message: 'Missing parameters: paymentId, PayerID, or orderId'
    });
  }

  const execute_payment_json = {
    payer_id: PayerID
  };

  paypalClient.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.error("Error executing PayPal payment:", error);
      // تحديث الحالة إلى Failed إذا كان في خطأ
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Failed'
      });
      return res.status(500).json({
        status: 'failed',
        message: 'Payment execution failed',
        error: error.message
      });
    }

    if (payment.state === 'approved') {
      const transaction = payment.transactions[0];
      const transactionId = transaction.related_resources[0]?.sale?.id;

      // ✅ هنا يتم تحديث الحالة إلى "Completed"
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Completed',
        paymentId: payment.id,
        transactionId: transactionId
      });

      // ✅ تحويل المستخدم إلى صفحة success (اختياري)
      return res.redirect(`https://vanilla-orpin-eight.vercel.app/order-success?orderId=${orderId}`);
    } else {
      // تحديث الحالة إلى Failed إذا لم يتم الموافقة
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Failed'
      });

      return res.status(400).json({
        status: 'failed',
        message: 'Payment not approved',
        orderId
      });
    }
  });
};