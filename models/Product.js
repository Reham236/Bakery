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
    });
    
    module.exports = mongoose.model('Product', productSchema);