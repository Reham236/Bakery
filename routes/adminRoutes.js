const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// عرض الإحصائيات (Admin فقط)
router.get('/dashboard', authMiddleware(['admin']), adminController.getDashboardStats);
// عرض جميع المستخدمين (Admin فقط)
router.get('/users', authMiddleware(['admin']), adminController.getAllUsers);

// تعديل بيانات المستخدم (Admin فقط)
router.put('/users/:id', authMiddleware(['admin']), adminController.updateUser);

// حذف مستخدم (Admin فقط)
router.delete('/users/:id', authMiddleware(['admin']), adminController.deleteUser);
module.exports = router;