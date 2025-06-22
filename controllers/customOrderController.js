const CustomOrder = require('../models/CustomOrder');

const { sendCustomOrderPriceUpdateNotification } = require('./notificationController');
const { sendNewCustomOrderNotificationToAdmin } = require('./notificationController');
const { sendOrderStatusUpdateNotification } = require('./notificationController');
// إضافة طلب مخصص
exports.createCustomOrder = async (req, res) => {
  try {
    const { description, deliveryDate } = req.body;

    // التحقق من وجود البيانات الأساسية
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const orderData = {
      user: req.user.userId,
      description
    };

    // إذا كان هناك تصميم تم رفعه
    if (req.file) {
      orderData.designImage = req.protocol + '://' + req.get('host') +`/uploads/${req.file.filename}`
    }

    // إذا كان هناك تاريخ تسليم
    if (deliveryDate) {
      orderData.deliveryDate = new Date(deliveryDate);
    }

    const customOrder = new CustomOrder(orderData);
    await customOrder.save();

    await sendNewCustomOrderNotificationToAdmin(customOrder._id);

    res.status(201).json({ 
      message: 'Custom order placed successfully', 
      customOrder 
    });
  } catch (error) {
    console.error('Error creating custom order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// عرض جميع الطلبات المخصصة (Admin فقط)



// جلب جميع الطلبات المخصصة
exports.getAllCustomOrders = async (req, res) => {
    try {
        const orders = await CustomOrder.find().populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching custom orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// جلب طلب مخصص واحد
exports.getCustomOrderById = async (req, res) => {
    try {
        const order = await CustomOrder.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Custom order not found' });
        res.json(order);
    } catch (error) {
        console.error('Error fetching custom order:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// تحديث السعر من قبل الأدمن


exports.updateCustomOrderPrice = async (req, res) => {
  try {
      const { id } = req.params;
      const { price } = req.body;

      if (typeof price !== 'number' || price <= 0) {
          return res.status(400).json({ message: 'Valid price is required' });
      }

      const updatedOrder = await CustomOrder.findByIdAndUpdate(
          id,
          { price },
          { new: true }
      );

      if (!updatedOrder) return res.status(404).json({ message: 'Custom order not found' });

      // ✉️ إرسال الإشعار
      await sendCustomOrderPriceUpdateNotification(updatedOrder.user, updatedOrder._id, price);

      res.json({ message: 'Price updated successfully', order: updatedOrder });
  } catch (error) {
      console.error('Error updating custom order price:', error);
      res.status(500).json({ message: 'Server Error' });
  }
};

// تحديث حالة الطلب المخصص
exports.updateCustomOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const customOrder = await CustomOrder.findByIdAndUpdate(orderId, { status }, { new: true });
    await sendOrderStatusUpdateNotification(customOrder.user, customOrder._id, status);
    if (!customOrder) return res.status(404).json({ message: 'Custom order not found' });

    res.json({ message: 'Custom order status updated successfully', customOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
// exports.getCustomOrderById = async (req, res) => {
//   try {
//     const CustomOrderId = req.params.CustomOrderId;

//     // البحث عن الطلب باستخدام الـ ID
//     const customOrder = await CustomOrder.findById(CustomOrderId).populate('user', 'name email');
//     if (!customOrder) return res.status(404).json({ message: 'CustomOrder not found' });

//     res.json(customOrder);
//   } catch (error) {
//     console.error('Error fetching CustomOrder by ID:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };


// إرسال إشعار للـ Admin عن طلب مخصص جديد

