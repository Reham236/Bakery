const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    designImage: { type: String },
    status: { type: String, enum: ['Pending', 'Processing', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('CustomOrder', customOrderSchema);