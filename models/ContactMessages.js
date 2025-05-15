const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    reply: { type: String }, // الرد من الأدمن
    repliedAt: { type: Date }, // وقت الرد
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('ContactMessages', contactMessageSchema);
