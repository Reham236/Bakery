// controllers/notificationController.js

const Notification = require('../models/Notification');
const User = require('../models/User');
const CustomOrder = require('../models/CustomOrder');

// جلب إشعارات المستخدم الحالي
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get User Notifications Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// جلب إشعارات الأدمن فقط
exports.getAdminNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    // جلب بيانات الـ Admin بناءً على الدور
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    // جلب الإشعارات الخاصة بالـ Admin
    const notifications = await Notification.find({
      user: adminUser._id, // هنا بنستخدم ID بتاع الـ Admin
      type: { $in: ['order_created', 'contact_message','system','custom_order_received'] }
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get Admin Notifications Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// وضع علامة مقروءة على إشعار
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark Notification As Read Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.sendCustomOrderPriceUpdateNotification = async (userId, orderId, price) => {

  try {
    const order = await CustomOrder.findById(orderId)
      const message = `the price of your custom order with description:" ${order.description} " has been updated to ${price} EGP.`;

      await Notification.create({
          user: userId,
          message,
          type: 'custom_order_price_updated'
      });
  } catch (error) {
      console.error('Error sending price update notification:', error);
  }
};