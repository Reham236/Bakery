
// controllers/contactMessagesController.js
const ContactMessage = require('../models/ContactMessages');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
const sendContactMessageNotificationToAdmin = async (messageSub) => {
  try {
      const adminUser = await User.findOne({ role: 'admin' });
         console.log('Admin User:', adminUser);
         if (!adminUser) {
           console.error('Admin user not found');
           return;
         }
     
         // إنشاء رسالة الإشعار
         const message = `contact message received with subject: ${messageSub}`;
     
         // إنشاء الإشعار
         await Notification.create({
           user: adminUser._id, // هنا بنستخدم ID بتاع الـ Admin
           type:'contact_message',
           message
         });
     
         console.log('Notification sent to admin successfully');
       } catch (error) {
         console.error('Error sending new contact Message notification:', error);
       }
};