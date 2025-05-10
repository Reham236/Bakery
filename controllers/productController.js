  const Product = require('../models/Product');
  const Notification = require('../models/Notification');
  const User = require('../models/User');

  // Create a new product
  exports.createProduct = async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      // بعد ما يتم حفظ المنتج الجديد
      await sendNewProductNotificationToUsers(product.name);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // Get all products
  exports.getProducts = async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get a single product by ID
  exports.getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Update a product
  exports.updateProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // Delete a product
  exports.deleteProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  exports.searchProducts = async (req, res) => {
    try {
      const { keyword, category, minPrice, maxPrice } = req.query;

      // بناء الـ Query بناءً على المدخلات
      const query = {};
      if (keyword) query.name = { $regex: keyword, $options: 'i' }; // البحث باستخدام الكلمات المفتاحية
      if (category) query.category = category; // الفلترة باستخدام الفئة
      if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) }; // أقل سعر
      if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) }; // أعلى سعر

      // البحث في الـ Database
      const products = await Product.find(query);

      // إرجاع النتائج
      res.json(products);
    } catch (error) {
      console.error('Search Products Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

  
  // Add Offer
  exports.addOfferToProduct = async (req, res) => {
    try {
      const { title, discountPercentage, startDate, endDate } = req.body;

      // ✅ استخدم req.params.id وليس req.body.productId
      const productId = req.params.id;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      product.offer.title = title;
      product.offer.discountPercentage = discountPercentage;
      product.offer.startDate = new Date(startDate);
      product.offer.endDate = new Date(endDate);
      product.offer.isOnSale = true;

      await product.save();
      await sendOfferAddedNotificationToAdmin(product._id);

      res.json({ message: 'Offer added successfully', product });
    } catch (error) {
      console.error('Add Offer Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

  // Edit Offer
  // Edit Offer
  exports.editOfferForProduct = async (req, res) => {
    try {
      const { title, discountPercentage, startDate, endDate, isOnSale } = req.body;
      const productId = req.params.id; // ✅ استخدام ID من params

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // تحديث بيانات العرض فقط إذا تم إرسالها
      if (title) product.offer.title = title;
      if (discountPercentage !== undefined) product.offer.discountPercentage = discountPercentage;
      if (startDate) product.offer.startDate = new Date(startDate);
      if (endDate) product.offer.endDate = new Date(endDate);
      if (isOnSale !== undefined) product.offer.isOnSale = isOnSale;

      await product.save();

      res.json({ message: 'Offer updated successfully', product });
    } catch (error) {
      console.error('Edit Offer Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };


  // Delete Offer
  // Delete Offer
  exports.deleteOfferFromProduct = async (req, res) => {
    try {
      const productId = req.params.id; // ✅ استخدام ID من params

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // إعادة تعيين بيانات العرض إلى القيم الافتراضية
      product.offer.title = '';
      product.offer.discountPercentage = 0;
      product.offer.startDate = null;
      product.offer.endDate = null;
      product.offer.isOnSale = false;

      await product.save();

      res.json({ message: 'Offer deleted successfully', product });
    } catch (error) {
      console.error('Delete Offer Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  // Get All Offers
  exports.getAllOffers = async (req, res) => {
    try {
      const products = await Product.find({ 'offer.isOnSale': true }).select(
        'name offer.title offer.discountPercentage offer.startDate offer.endDate'
      );

      const offers = products.map((product) => ({
        productName: product.name,
        title: product.offer.title,
        discountPercentage: product.offer.discountPercentage,
        startDate: product.offer.startDate ? product.offer.startDate.toISOString().split('T')[0] : null,
        endDate: product.offer.endDate ? product.offer.endDate.toISOString().split('T')[0] : null
      }));

      res.json(offers);
    } catch (error) {
      console.error('Get All Offers Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  // Get Products with Offers (On Sale)
  exports.getProductsOnSale = async (req, res) => {
    try {
      const products = await Product.find({ 'offer.isOnSale': true }).select(
        'name description price category image offer'
      );
      
      // حساب السعر بعد الخصم
      const productsWithDiscounts = products.map((product) => {
        if (product.offer.isOnSale) {
          const discountedPrice =
            product.price - (product.price * product.offer.discountPercentage) / 100;
          return { ...product._doc, discountedPrice };
        }
        return product;
      });

      res.json(productsWithDiscounts);
    } catch (error) {
      console.error('Get Products on Sale Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  const sendNewProductNotificationToUsers = async (productName) => {
    try {
        const users = await User.find();
        const message = `تم إضافة منتج جديد: ${productName}`;

        for (const user of users) {
            await Notification.create({ user: user._id, message, type: 'new_product' });
        }
    } catch (error) {
        console.error('Error sending new product notification:', error);
    }
};
const sendOfferAddedNotificationToAdmin = async (productId) => {
  try {
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) return;

      const product = await Product.findById(productId);
      const message = `تم إضافة عرض على المنتج: ${product.name}`;

      await Notification.create({ user: admin._id, message, type: 'offer_added' });
  } catch (error) {
      console.error('Error sending offer added notification:', error);
  }
};