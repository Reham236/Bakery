const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// عرض جميع المستخدمين
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// تعديل بيانات المستخدم
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(userId, { name, email, role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// حذف مستخدم
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};