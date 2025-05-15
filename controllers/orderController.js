const Order = require('../models/Order');

const Product = require('../models/Product');
const { sendNewOrderNotificationToAdmin } = require('../utils/notificationUtils');
const { sendOrderStatusUpdateNotification } = require('../utils/notificationUtils');

exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    // التحقق من صحة البيانات
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Invalid products data' });
    }

    // التحقق من وجود المنتجات وحساب السعر الكلي
    let total = 0;
    const productsWithDetails = [];

    for (const productData of products) {
      const product = await Product.findById(productData.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productData.productId}` });
      }

      // التحقق من توفر الكمية
      if (product.availability === false) {
        return res.status(400).json({ message: `Product out of stock: ${product.name}` });
      }

      // حساب السعر الإجمالي لكل منتج
      const productTotal = product.price * productData.quantity;
      total += productTotal;

      // تخزين تفاصيل المنتج مع الكمية
      productsWithDetails.push({
        product: product._id,
        quantity: productData.quantity,
        price: product.price,
        totalPrice: productTotal,
      });
    }

    // إنشاء الطلب
    const order = new Order({
      user: req.user.userId, // ID المستخدم اللي بيعمل الطلب (موجود في الـ Token)
      products: productsWithDetails,
      total, // السعر الكلي اللي اتجمع
      status: 'Pending', // الحالة الافتراضية للطلب
    });

    await order.save();

    // إرسال إشعار للـ Admin
    await sendNewOrderNotificationToAdmin(order._id);

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error creating order:', error); // طباعة الخطأ في الـ Console عشان نشوف التفاصيل
    res.status(500).json({ message: 'Server Error' });
  }
};

// تعديل حالة الطلب (خاص بالمشرف فقط)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.orderId;

    // التحقق من صحة الحالة
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // تحديث حالة الطلب
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    await sendOrderStatusUpdateNotification(order.user, order._id, status);

    if (!order) return res.status(404).json({ message: 'Order not found' });


    res.json({ message: 'Order status updated successfully', order });
    // بعد ما يتم تحديث حالة الطلب
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// عرض جميع الطلبات (خاص بالمشرف فقط)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email'); // تحميل بيانات المستخدم المرتبطة بالطلب
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// عرض طلب واحد
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // البحث عن الطلب باستخدام الـ ID
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
const paypal = require('../config/paypalConfig');

// 1. إنشاء الدفع
// Update your createPayPalPayment function
exports.createPayPalPayment = async (req, res) => {
    const { cartItems, total } = req.body;

    // Add small random amount to avoid round numbers
    const randomizedTotal = (total + Math.random() * 0.99).toFixed(2);

    const paymentDetails = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/api/orders/success",
            "cancel_url": "http://localhost:5000/api/orders/cancel"
        },
        "transactions": [{
            "amount": {
                "total": randomizedTotal,
                "currency": "EGP",
                "details": {
                    "subtotal": randomizedTotal,
                    "shipping": "0.00",
                    "tax": "0.00"
                }
            },
            "description": "Test Order - Bakery Items",
            "item_list": {
                "items": cartItems.map((item, index) => ({
                    "name": `TEST-${item.name}`,
                    "sku": `TEST-${item.productId}`,
                    "price": (item.price + 0.01).toFixed(2), // Avoid round numbers
                    "currency": "EGP",
                    "quantity": item.quantity
                }))
            }
        }]
    };

    // Add debug logging
    console.log('Sending PayPal payment request:', JSON.stringify(paymentDetails, null, 2));

    paypal.payment.create(paymentDetails, function (error, payment) {
        if (error) {
            console.error('Detailed PayPal Error:', {
                message: error.message,
                response: error.response,
                stack: error.stack
            });
            return res.status(500).json({ 
                message: 'Error creating payment',
                details: error.response 
            });
        }
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
        res.json({ approvalUrl });
    });
};
// 2. نجاح الدفع
// Update handlePaymentSuccess function
exports.handlePaymentSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const executePaymentDetails = {
        "payer_id": payerId
    };

    console.log('Executing PayPal payment:', paymentId);

    paypal.payment.execute(paymentId, executePaymentDetails, async function (error, payment) {
        if (error) {
            console.error('Detailed PayPal Execution Error:', {
                message: error.message,
                debug_id: error.response.debug_id,
                details: error.response,
                stack: error.stack
            });
            
            // Redirect to failure page with error details
            return res.redirect(`http://localhost:5000/payment-failed?error=${encodeURIComponent(error.message)}`);
        }

        try {
            const userId = req.user.userId;
            const products = payment.transactions[0].item_list.items.map(item => ({
                productId: item.sku.replace('TEST-', ''), // Remove test prefix
                quantity: item.quantity,
                price: parseFloat(item.price)
            }));

            const newOrder = new Order({
                user: userId,
                products,
                total: payment.transactions[0].amount.total,
                status: 'Paid',
                paymentId: payment.id,
                paymentDetails: payment // Store full payment details for reference
            });

            await newOrder.save();
            await sendNewOrderNotificationToAdmin(newOrder._id);

            res.redirect('http://localhost:5000/order-success/' + newOrder._id);
        } catch (dbError) {
            console.error('Database Error:', dbError);
            res.redirect('http://localhost:5000/payment-failed?error=database_error');
        }
    });
};
// 3. إلغاء الدفع
exports.handlePaymentCancel = (req, res) => {
    res.redirect('http://localhost:5000/cart'); // ← صفحة الفشل
};
// Add new failure handler
exports.handlePaymentFailure = async (req, res) => {
    const { error } = req.query;
    console.log('Payment failed with error:', error);
    
    // Here you could:
    // 1. Log the failure to your database
    // 2. Send notification to admin
    // 3. Update any pending orders
    
    res.status(400).json({ 
        success: false,
        error: error || 'Payment processing failed'
    });
};


