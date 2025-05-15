
// controllers/contactMessagesController.js
const ContactMessage = require('../models/ContactMessages');
const User = require('../models/User');
// const Notification = require('../models/Notification');
const { sendReplyNotificationToUser } = require('./notificationController');
const { sendContactMessageNotificationToAdmin } = require('./notificationController');

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
        // إرسال إشعار للأدمن
        await sendContactMessageNotificationToAdmin(newMessage.subject);

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



// رفع الرد من الأدمن
exports.replyToMessage = async (req, res) => {
    const { messageId } = req.params;
    const { reply } = req.body;

    if (!reply) {
        return res.status(400).json({
            success: false,
            error: 'Reply message is required.'
        });
    }

    try {
        const message = await ContactMessage.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        // تحديث الرسالة بالرد
        message.reply = reply;
        message.repliedAt = new Date();
        await message.save();

        // إرسال إشعار للمستخدم
        await sendReplyNotificationToUser(message.email, message.subject);

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: message
        });

    } catch (error) {
        console.error('Error replying to message:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

;



exports.getMyMessages = async (req, res) => {
    try {
        const userId = req.user.userId;

        // البحث عن المستخدم لاستخراج البريد الإلكتروني
        const user = await User.findById(userId).select('email');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // جلب الرسائل الخاصة بهذا البريد
        const messages = await ContactMessage.find({ email: user.email });
      
       console.log('replyMessage:', messages);
       res.json({
            success: true,
            count: messages.length,
            data: messages.map(message => ({
                _id: message._id,
               
                subject: message.subject,
             
                reply: message.reply,
                repliedAt: message.repliedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};