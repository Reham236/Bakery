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
exports.sendContactMessageNotificationToAdmin = async (messageSub) => {
  try {
      const adminUser = await User.findOne({ role: 'admin' });
         console.log('Admin User:', adminUser);
         if (!adminUser) {
           console.error('Admin user not found');
           return;
         }
     
         // إنشاء رسالة الإشعار
         const message = `contact message received with subject: ${messageSub}`;
     
         // إنشاء الإشعار
         await Notification.create({
           user: adminUser._id, // هنا بنستخدم ID بتاع الـ Admin
           type:'contact_message',
           message
         });
     
         console.log('Notification sent to admin successfully');
       } catch (error) {
         console.error('Error sending new contact Message notification:', error);
       }
};
exports.sendReplyNotificationToUser = async (userEmail, subject) => {
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.error('User not found');
            return;
        }

        const message = `You received a reply for your message with subject: ${subject}`;

        await Notification.create({
            user: user._id,
            type: 'reply_message',
            message
        });

        console.log('Reply notification sent to user');
    } catch (error) {
        console.error('Error sending reply notification:', error);
    }
};
exports.sendNewCustomOrderNotificationToAdmin = async (customOrderId) => {
  try {
    // جلب بيانات الـ Admin
    const adminUser = await User.findOne({ role: 'admin' });
    console.log('Admin User:', adminUser);
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }

    // إنشاء رسالة الإشعار
    const message = `New custom order received with ID: ${customOrderId}`;

    // إنشاء الإشعار
    await Notification.create({
      user: adminUser._id,
      type:'custom_order_received', // هنا بنستخدم ID بتاع الـ Admin
      message,
    });

    console.log('Notification sent to admin successfully');
  } catch (error) {
    console.error('Error sending new custom order notification:', error);
  }
};
exports.sendOrderStatusUpdateNotification = async (userId, orderId, status) => {
  try {
      const message = `Your custom order with ID: ${orderId} has been updated to status: ${status}.`;

      await Notification.create({
          user: userId,
          message,
          type: 'order_updated'
      });
  } catch (error) {
      console.error('Error sending order status update notification:', error);
  }
};
exports.sendNewOrderNotificationToAdmin = async (orderId) => {
  try {
      const adminUser = await User.findOne({ role: 'admin' });
         console.log('Admin User:', adminUser);
         if (!adminUser) {
           console.error('Admin user not found');
           return;
         }
     
         // إنشاء رسالة الإشعار
         const message = `New  order received with ID: ${orderId}`;
     
         // إنشاء الإشعار
         await Notification.create({
           user: adminUser._id, // هنا بنستخدم ID بتاع الـ Admin
           type:'order_created',
           message
         });
     
         console.log('Notification sent to admin successfully');
       } catch (error) {
         console.error('Error sending new  order notification:', error);
       }
};
exports.sendOrderStatusUpdateNotification = async (userId, orderId, status) => {
  try {
      const message = `تم تحديث حالة الطلب #${orderId} إلى: ${status}`;

      await Notification.create({
          user: userId,
          message,
          type: 'order_updated'
      });
  } catch (error) {
      console.error('Error sending order status update notification:', error);
  }
};
exports.sendNewProductNotificationToUsers = async (productName) => {
    try {
        const users = await User.find();
        const message = `تم إضافة منتج جديد: ${productName}`;

        for (const user of users) {
            await Notification.create({ user: user._id, message, type: 'new_product' });
        }
    } catch (error) {
        console.error('Error sending new product notification:', error);
    }
};
exports.sendOfferAddedNotificationToAdmin = async (productId) => {
  try {
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) return;

      const product = await Product.findById(productId);
      const message = `تم إضافة عرض على المنتج: ${product.name}`;

      await Notification.create({ user: admin._id, message, type: 'offer_added' });
  } catch (error) {
      console.error('Error sending offer added notification:', error);
  }
};