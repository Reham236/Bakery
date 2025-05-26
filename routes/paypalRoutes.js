// routes/paypalRoutes.js
const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

router.post('/webhook', webhookController.processWebhook);

module.exports = router;