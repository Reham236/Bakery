const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // من سيتلقى الإشعار
    message: { type: String, required: true }, // محتوى الإشعار
    isRead: { type: Boolean, default: false }, // هل قرأها المستلم؟
    type: {
        type: String,
        enum: [
            'new_product',
            'order_created',
            'order_updated',
            'contact_message',
            'reply_message',
            'offer_added',
            'product_updated',
            'product_deleted',
            'custom_order_received',   // ← يمكنك إضافة هذا النوع الجديد
            'custom_order_price_updated',
            'system'
        ],
        default: 'system'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);