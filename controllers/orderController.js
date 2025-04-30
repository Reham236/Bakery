const Order = require('../models/Order');


// إضافة طلب جديد
exports.createOrder = async (req, res) => {
  try {
    const { products, total } = req.body;

    // التحقق من صحة البيانات
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Invalid products data' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Invalid total price' });
    }

    // إنشاء الطلب
    const order = new Order({
      user: req.user.userId, // ID المستخدم اللي بيعمل الطلب (موجود في الـ Token)
      products,
      total,
      status: 'Pending', // الحالة الافتراضية للطلب
    });

    await order.save();
    // بعد ما يتم حفظ الطلب
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
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated successfully', order });
    // بعد ما يتم تحديث حالة الطلب
    await sendOrderStatusUpdateNotification(order.user, order._id, status);
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
const Notification = require('../models/Notification');
const User = require('../models/User');

// إرسال إشعار للـ Admin عن طلب جديد
const sendNewOrderNotificationToAdmin = async (orderId) => {
  try {
    // جلب بيانات الـ Admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) return;

    // إنشاء رسالة الإشعار
    const message = `New order received with ID: ${orderId}`;

    // إنشاء الإشعار
    await Notification.create({ user: adminUser._id, message });
  } catch (error) {
    console.error('Error sending new order notification:', error);
  }
};


// إرسال إشعار للمستخدم عن تحديث حالة الطلب
const sendOrderStatusUpdateNotification = async (userId, orderId, status) => {
  try {
    // إنشاء رسالة الإشعار
    const message = `Your order with ID: ${orderId} has been updated to ${status}`;

    // إنشاء الإشعار
    await Notification.create({ user: userId, message });
  } catch (error) {
    console.error('Error sending order status update notification:', error);
  }
};