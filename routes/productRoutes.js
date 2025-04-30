const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// GET route to test the API
router.get('/', (req, res) => {
  res.send('Product API');
});
router.get('/search', searchProducts);

// POST route to create a new product
router.post('/', authMiddleware(['admin']), createProduct);

// GET all products
router.get('/all', getProducts);

// GET a single product by ID
router.get('/:id', getProductById);

// PUT route to update a product
router.put('/:id',authMiddleware(['admin']), updateProduct);

// DELETE route to delete a product
router.delete('/:id',authMiddleware(['admin']), deleteProduct);

module.exports = router;
