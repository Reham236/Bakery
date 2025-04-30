const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    // بعد ما يتم حفظ المنتج الجديد
await sendNewProductNotificationToUsers(product.name);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    // بناء الـ Query بناءً على المدخلات
    const query = {};
    if (keyword) query.name = { $regex: keyword, $options: 'i' }; // البحث باستخدام الكلمات المفتاحية
    if (category) query.category = category; // الفلترة باستخدام الفئة
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) }; // أقل سعر
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) }; // أعلى سعر

    // البحث في الـ Database
    const products = await Product.find(query);

    // إرجاع النتائج
    res.json(products);
  } catch (error) {
    console.error('Search Products Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// إرسال إشعار للمستخدمين عن منتج جديد
const sendNewProductNotificationToUsers = async (productName) => {
  try {
    // جلب جميع المستخدمين
    const users = await User.find();

    // إنشاء رسالة الإشعار
    const message = `New product added: ${productName}`;

    // إنشاء إشعار لكل مستخدم
    for (const user of users) {
      await Notification.create({ user: user._id, message });
    }
  } catch (error) {
    console.error('Error sending new product notification:', error);
  }
};