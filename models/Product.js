const mongoose = require('mongoose');

    const productSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      category: { type: String, required: true },
      image: { type: String, required: true },
      availability: { type: Boolean, default: true },
      reviews: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          rating: { type: Number, required: true },
          comment: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      offer: {
        title: { type: String }, // عنوان العرض
        discountPercentage: { type: Number, default: 0 }, // نسبة الخصم
        startDate: { type: Date }, // تاريخ بداية العرض
        endDate: { type: Date }, // تاريخ نهاية العرض
        isOnSale: { type: Boolean, default: false }, // إذا كان المنتج عليه عرض ولا لأ
      },

    });
    
    module.exports = mongoose.model('Product', productSchema);