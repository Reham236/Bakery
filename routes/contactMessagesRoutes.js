// routes/contactMessageRoutes.js

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactMessagesController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /contact
router.post('/', authMiddleware(['user']) ,contactController.createMessage);

// GET /contact (اختياري - لإدارة الرسائل)
router.get('/', authMiddleware(['admin']) , contactController.getAllMessages);
// routes/contactMessageRoutes.js
router.get('/user/me', authMiddleware(['user']), contactController.getMyMessages);
// POST /contact/reply/:messageId
router.post('/reply/:messageId', authMiddleware(['admin']), contactController.replyToMessage);
module.exports = router;