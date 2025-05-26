const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const customOrderRoutes = require('./routes/customOrderRoutes'); // Import custom order routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes
const contactMessagesRoutes = require('./routes/contactMessagesRoutes'); // Import contact routes
const favoriteRoutes = require('./routes/favoriteRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes

dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // السماح لجميع المصادر (غير آمن للإنتاج)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', reviewRoutes);
app.use('/api/orders',orderRoutes ); // Add order routes
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes); // Add notification routes
app.use('/api/contact', contactMessagesRoutes); // Add contact routes
app.use('/api/settings', require('./routes/siteSettingsRoutes')); // Add site settings routes
app.use('/api/favorites', favoriteRoutes);
app.use('/api/payments', paymentRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));