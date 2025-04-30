const CustomOrder = require('../models/CustomOrder');
const Notification = require('../models/Notification');
const User = require('../models/User');


// إضافة طلب مخصص
exports.createCustomOrder = async (req, res) => {
  try {
    const { description, designImage } = req.body;
    const customOrder = new CustomOrder({ user: req.user.userId, description, designImage });
    await customOrder.save();
    // بعد ما يتم حفظ الطلب المخصص
await sendNewCustomOrderNotificationToAdmin(customOrder._id);
    res.status(201).json({ message: 'Custom order placed successfully', customOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// عرض جميع الطلبات المخصصة (Admin فقط)
exports.getAllCustomOrders = async (req, res) => {
  try {
    const customOrders = await CustomOrder.find().populate('user', 'name email');
    res.json(customOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// تحديث حالة الطلب المخصص
exports.updateCustomOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const customOrder = await CustomOrder.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!customOrder) return res.status(404).json({ message: 'Custom order not found' });

    res.json({ message: 'Custom order status updated successfully', customOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getCustomOrderById = async (req, res) => {
  try {
    const CustomOrderId = req.params.CustomOrderId;

    // البحث عن الطلب باستخدام الـ ID
    const customOrder = await CustomOrder.findById(CustomOrderId).populate('user', 'name email');
    if (!customOrder) return res.status(404).json({ message: 'CustomOrder not found' });

    res.json(customOrder);
  } catch (error) {
    console.error('Error fetching CustomOrder by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// إرسال إشعار للـ Admin عن طلب مخصص جديد
const sendNewCustomOrderNotificationToAdmin = async (customOrderId) => {
  try {
    // جلب بيانات الـ Admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) return;

    // إنشاء رسالة الإشعار
    const message = `New custom order received with ID: ${customOrderId}`;

    // إنشاء الإشعار
    await Notification.create({ user: adminUser._id, message });
  } catch (error) {
    console.error('Error sending new custom order notification:', error);
  }
};