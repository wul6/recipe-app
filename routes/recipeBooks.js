const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  getAllRecipeBooks,
  getRecipeBookById,
  createRecipeBook,
  updateRecipeBook,
  deleteRecipeBook
} = require('../controllers/recipeBooksController');

// GET /recipe-books - List all recipe books
router.get('/', getAllRecipeBooks);

// GET /recipe-books/:id - Get a recipe book with all its recipes
router.get('/:id', getRecipeBookById);

// POST /recipe-books - Create a recipe book with optional cover image
router.post('/', upload.single('cover_image'), createRecipeBook);

// PUT /recipe-books/:id - Update title or cover image
router.put('/:id', upload.single('cover_image'), updateRecipeBook);

// DELETE /recipe-books/:id - Delete recipe book and cascade recipes
router.delete('/:id', deleteRecipeBook);

module.exports = router;

