const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', authController.registerUser);

// تسجيل الدخول
router.post('/login', authController.loginUser);

module.exports = router;