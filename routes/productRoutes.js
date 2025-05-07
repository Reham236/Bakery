const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  addOfferToProduct,
  editOfferForProduct,
  deleteOfferFromProduct,
  getAllOffers,
  getProductsOnSale,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// GET route to test the API
// router.get('/', (req, res) => {
//   res.send('Product API');
// });
router.get('/search', searchProducts);

// POST route to create a new product
router.post('/', authMiddleware(['admin']), createProduct);

// GET all products
router.get('/all', getProducts);

router.get('/offers', authMiddleware(['admin']), getAllOffers);
// Get Products with Offers (On Sale)
router.get('/', getProductsOnSale);

// GET a single product by ID
router.get('/:id', getProductById);

// PUT route to update a product
router.put('/:id',authMiddleware(['admin']), updateProduct);

// DELETE route to delete a product
router.delete('/:id',authMiddleware(['admin']), deleteProduct);
// Add Offer (Admin Only)
router.put('/:id/offer/add', authMiddleware(['admin']), addOfferToProduct);

// Edit Offer (Admin Only)
router.put('/:id/offer/edit', authMiddleware(['admin']), editOfferForProduct);

// Delete Offer (Admin Only)
router.delete('/:id/offer/delete', authMiddleware(['admin']), deleteOfferFromProduct);

module.exports = router;
