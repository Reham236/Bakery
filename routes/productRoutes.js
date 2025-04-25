const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// GET route to test the API
router.get('/', (req, res) => {
  res.send('Product API');
});

// POST route to create a new product
router.post('/', createProduct);

// GET all products
router.get('/all', getProducts);

// GET a single product by ID
router.get('/:id', getProductById);

// PUT route to update a product
router.put('/:id', updateProduct);

// DELETE route to delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
