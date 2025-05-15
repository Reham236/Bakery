// routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const favoriteController = require('../controllers/favoriteController');

router.post('/add', authMiddleware(['user']), favoriteController.addToFavorites);
router.post('/remove', authMiddleware(['user']), favoriteController.removeFromFavorites);
router.get('/me', authMiddleware(['user']), favoriteController.getFavoriteProducts);

module.exports = router;