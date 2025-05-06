
// controllers/contactMessagesController.js
const ContactMessage = require('../models/ContactMessages');

// إضافة رسالة جديدة
exports.createMessage = async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({
            success: false,
            error: 'All fields are required.'
        });
    }

    try {
        const newMessage = new ContactMessage({ name, email, phone, subject, message });
        await newMessage.save();

        res.status(201).json({
            success: true,
            message: 'Your message has been received successfully.',
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// controllers/contactController.js

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find();

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};