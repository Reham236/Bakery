const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- هنا بنضيف middleware التوثيق
const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', upload.single('image'), authController.registerUser);
// تسجيل الدخول
router.post('/login', authController.loginUser);
router.put(
  '/profile',
  authMiddleware(['user', 'admin']), // <-- هنا بنضيف middleware التوثيق
  upload.single('image'),
  authController.updateProfile
);

module.exports = router;