const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// إضافة تقييم جديد
router.post('/products/:productId/reviews', authMiddleware(['user']), reviewController.addReview);

// عرض جميع التقييمات لمنتج معين
router.get('/products/:productId/reviews', reviewController.getReviews);
router.delete('/products/:productId/reviews/:reviewId', 
  authMiddleware([ 'admin']), 
  reviewController.deleteReview
);

module.exports = router;