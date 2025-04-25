const Product = require('../models/Product');

// إضافة تقييم جديد
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
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