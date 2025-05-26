const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



// تسجيل مستخدم جديد
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // التحقق إذا كان المستخدم موجود بالفعل
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // تخزين رابط الصورة
    const image = req.file ? req.file.path : null; // هنا بنخزن المسار بتاع الصورة

    // إنشاء مستخدم جديد
    const user = new User({ name, email, password, role, image });
    await user.save();

    // إصدار Token للمستخدم المسجل حديثًا
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24d' });

    // إرسال رد ناجح مع الـ Token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// تسجيل الدخول
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token for the logged-in user
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24d' });

    // Send success response with the token
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    
    // إذا تم رفع صورة جديدة
    if (req.file) {
      updates.image = req.file.path;
    }

    // إذا تم إدخال باسورد جديد
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    // تحديث بيانات المستخدم
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // إخفاء الباسورد من الرد النهائي
    updatedUser.password = undefined;

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};