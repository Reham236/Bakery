const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true
    },
    logo: {
        type: String, // URL أو اسم الملف
        default: ''
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (value) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value),
            message: 'Please enter a valid email address'
        }
    },
    phoneNumber: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);