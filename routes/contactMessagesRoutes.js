// routes/contactRoutes.js

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactMessagesController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /contact
router.post('/', authMiddleware(['user']) ,contactController.createMessage);

// GET /contact (اختياري - لإدارة الرسائل)
router.get('/', authMiddleware(['admin']) , contactController.getAllMessages);

module.exports = router;