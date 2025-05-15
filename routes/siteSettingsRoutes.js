const express = require('express');
const router = express.Router();
const siteSettingsController = require('../controllers/siteSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/settings - عرض الإعدادات
router.get('/', authMiddleware(['admin']), siteSettingsController.getSettings);

// PUT /api/settings/update - تحديث الإعدادات
router.put('/update', authMiddleware(['admin']), siteSettingsController.updateSettings);

module.exports = router; 