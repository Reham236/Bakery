const Order = require('../models/Order');

const Product = require('../models/Product');
const { sendNewOrderNotificationToAdmin } = require('./notificationController');
const { sendOrderStatusUpdateNotification } = require('./notificationController');

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
      total = parseFloat(total.toFixed(2)); // التأكد من دقة السعر الكلي
console.log(product.name)
      // تخزين تفاصيل المنتج مع الكمية
      productsWithDetails.push({
        product: product._id,
        name: product.name, // اسم المنتج
        quantity: productData.quantity,
        price: parseFloat(product.price.toFixed(2)), // سعر المنتج
        totalPrice: parseFloat(productTotal.toFixed(2)), // السعر الإجمالي للمنتج
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

