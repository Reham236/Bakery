const SiteSettings = require('../models/SiteSettings');

// عرض الإعدادات الحالية
exports.getSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.findOne();
        if (!settings) {
            return res.status(404).json({ success: false, error: 'Settings not found' });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// تحديث الإعدادات
exports.updateSettings = async (req, res) => {
    try {
        const { siteName, logo, address, description, email, phoneNumber } = req.body;

        // التحقق من وجود البيانات
        if (!siteName || !address || !description || !email || !phoneNumber) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        // تحديث الإعدادات
        let settings = await SiteSettings.findOneAndUpdate(
            {},
            {
                siteName,
                logo,
                address,
                description,
                email,
                phoneNumber
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};