const Product = require('../models/Product');

// إضافة تقييم جديد
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const product = await Product.findById(req.params.productId);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // التحقق مما إذا كان المستخدم قد أضاف تقييمًا مسبقًا
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user.userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // إضافة التقييم الجديد
    const review = {
      user: req.user.userId,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// عرض جميع التقييمات لمنتج معين
exports.getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    // البحث عن المنتج
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // البحث عن التقييم
    const review = product.reviews.find(
      (r) => r._id.toString() === reviewId
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // // التحقق من أن المستخدم هو صاحب التقييم أو Admin
    // if (review.user.toString() !== req.user.userId && req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized to delete this review' });
    // }

    // حذف التقييم
    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );

    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};