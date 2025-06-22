const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true }, // اسم المنتج
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // سعر المنتج عند وقت الشراء
      totalPrice: { type: Number, required: true }, // السعر الإجمالي لكل منتج
    },
  ],
  total: { type: Number, required: true }, // السعر الكلي للطلب
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending' },
   paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  paymentId: { type: String }, // ← جديد
  transactionId: { type: String }, // ← جديد

    deliveryLocation: { type: String, required: true }, // عنوان التوصيل كنص كامل
  contactPhone: { type: String, required: true },     // رقم الهاتف
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);