const Notification = require('../models/Notification');
const User = require('../models/User');

// إرسال إشعار جديد
exports.sendNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    

    // التحقق من وجود المستخدم
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // إنشاء الإشعار
    const notification = new Notification({ user: userId, message });
    await notification.save();

    res.status(201).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    console.error('Send Notification Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// عرض الإشعارات الخاصة بالمستخدم
exports.getUserNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user.userId })
        .sort({ createdAt: -1 }); // أحدث إشعار أولًا
  
      res.json(notifications);
    } catch (error) {
      console.error('Get User Notifications Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  // تحديث حالة الإشعار إلى مقروء
exports.markNotificationAsRead = async (req, res) => {
    try {
      const notificationId = req.params.id;
  
      // تحديث الإشعار
      const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Mark Notification As Read Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };