// controllers/favoriteController.js
const User = require('../models/User');
const Product = require('../models/Product');

// إضافة منتج إلى المفضلة
exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId; // من التوكن

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Product added to favorites', data: user.favorites });
  } catch (error) {
    console.error('Add to Favorites Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// إزالة منتج من المفضلة
exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({ success: true, message: 'Product removed from favorites', data: user.favorites });
  } catch (error) {
    console.error('Remove from Favorites Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// جلب المنتجات المفضلة للمستخدم
exports.getFavoriteProducts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    console.error('Get Favorite Products Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};