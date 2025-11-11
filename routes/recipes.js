const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipesController');

// GET /recipes/:id - Get a recipe with ingredients and instructions
router.get('/:id', getRecipeById);

// POST /recipes - Create recipe (linked to recipe book, with thumbnail, ingredients, instructions)
router.post('/', upload.single('thumbnail_image'), createRecipe);

// PUT /recipes/:id - Update recipe, including structured ingredients & step instructions
router.put('/:id', upload.single('thumbnail_image'), updateRecipe);

// DELETE /recipes/:id - Delete recipe and cascade ingredients & instructions
router.delete('/:id', deleteRecipe);

module.exports = router;

