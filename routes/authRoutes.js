const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', upload.single('image'), authController.registerUser);
// تسجيل الدخول
router.post('/login', authController.loginUser);

module.exports = router;