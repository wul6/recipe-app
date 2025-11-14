const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_FILE = 'recipes.db';

// Helper to get database connection
function getDb() {
  return new sqlite3.Database(DB_FILE);
}

// Helper to compute icon based on description keywords
function computeIcon(description) {
  const desc = description.toLowerCase();
  
  if (desc.match(/\b(chop|slice|dice|cut|mince)\b/)) {
    return 'knife.png';
  } else if (desc.match(/\b(boil|simmer|cook|heat)\b/)) {
    return 'pot.png';
  } else if (desc.match(/\b(bake|roast|oven)\b/)) {
    return 'oven.png';
  } else if (desc.match(/\b(mix|stir|whisk|blend)\b/)) {
    return 'whisk.png';
  } else if (desc.match(/\b(fry|sauté|pan)\b/)) {
    return 'pan.png';
  } else if (desc.match(/\b(grill|barbecue|bbq)\b/)) {
    return 'grill.png';
  }
  return null;
}

// Get a single recipe with ingredients and instructions
function getRecipeById(req, res) {
  const db = getDb();
  const recipeId = req.params.id;

  // Get recipe
  db.get('SELECT * FROM recipe_book_recipes WHERE id = ?', [recipeId], (err, recipe) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      db.close();
      return;
    }

    // Get ingredients
    db.all(
      'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY id',
      [recipeId],
      (err, ingredients) => {
        if (err) {
          res.status(500).json({ error: err.message });
          db.close();
          return;
        }

        // Get instructions
        db.all(
          'SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number',
          [recipeId],
          (err, instructions) => {
            if (err) {
              res.status(500).json({ error: err.message });
              db.close();
              return;
            }

            res.json({
              ...recipe,
              ingredients: ingredients || [],
              instructions: instructions || []
            });
            db.close();
          }
        );
      }
    );
  });
}

// Create a new recipe
function createRecipe(req, res) {
  const db = getDb();
  const { recipe_book_id, title, description, ingredients, instructions, is_favorite, tags } = req.body;
  const thumbnailImage = req.file ? `/uploads/recipes/${req.file.filename}` : null;

  if (!recipe_book_id || !title) {
    res.status(400).json({ error: 'recipe_book_id and title are required' });
    db.close();
    return;
  }

  // Validate ingredients and instructions are arrays
  let ingredientsArray = [];
  let instructionsArray = [];

  try {
    ingredientsArray = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    instructionsArray = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON format for ingredients or instructions' });
    db.close();
    return;
  }

  db.serialize(() => {
    // Insert recipe
    db.run(
      'INSERT INTO recipe_book_recipes (recipe_book_id, title, description, thumbnail_image, is_favorite, tags, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [recipe_book_id, title, description, thumbnailImage, is_favorite || false, tags || null],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          db.close();
          return;
        }

        const recipeId = this.lastID;

        // Insert ingredients
        if (ingredientsArray && ingredientsArray.length > 0) {
          const ingredientStmt = db.prepare(
            'INSERT INTO ingredients (recipe_id, quantity, unit, ingredient_name) VALUES (?, ?, ?, ?)'
          );

          ingredientsArray.forEach(ing => {
            ingredientStmt.run([
              recipeId,
              ing.quantity || null,
              ing.unit || null,
              ing.ingredient_name
            ]);
          });

          ingredientStmt.finalize();
        }

        // Insert instructions
        if (instructionsArray && instructionsArray.length > 0) {
          const instructionStmt = db.prepare(
            'INSERT INTO instructions (recipe_id, step_number, description, image, icon) VALUES (?, ?, ?, ?, ?)'
          );

          instructionsArray.forEach((inst, index) => {
            const stepNumber = inst.step_number || index + 1;
            const icon = computeIcon(inst.description || '');
            instructionStmt.run([
              recipeId,
              stepNumber,
              inst.description,
              inst.image || null,
              icon
            ]);
          });

          instructionStmt.finalize();
        }

        // Return the created recipe with ingredients and instructions
        db.get('SELECT * FROM recipe_book_recipes WHERE id = ?', [recipeId], (err, recipe) => {
          if (err) {
            res.status(500).json({ error: err.message });
            db.close();
            return;
          }

          db.all('SELECT * FROM ingredients WHERE recipe_id = ?', [recipeId], (err, ingredients) => {
            if (err) {
              res.status(500).json({ error: err.message });
              db.close();
              return;
            }

            db.all('SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number', [recipeId], (err, instructions) => {
              if (err) {
                res.status(500).json({ error: err.message });
                db.close();
                return;
              }

              res.status(201).json({
                ...recipe,
                ingredients: ingredients || [],
                instructions: instructions || []
              });
              db.close();
            });
          });
        });
      }
    );
  });
}

// Update a recipe
function updateRecipe(req, res) {
  const db = getDb();
  const recipeId = req.params.id;
  const { title, ingredients, description, instructions, is_favorite, tags } = req.body;
  const thumbnailImage = req.file ? `/uploads/recipes/${req.file.filename}` : null;

  // First get the existing recipe
  db.get('SELECT * FROM recipe_book_recipes WHERE id = ?', [recipeId], (err, recipe) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      db.close();
      return;
    }

    const newTitle = title || recipe.title;
    const newDescription = description;
    const newThumbnail = thumbnailImage || recipe.thumbnail_image;
    const newIsFavorite = is_favorite !== undefined ? is_favorite : recipe.is_favorite;
    const newTags = tags !== undefined ? tags : recipe.tags;

    db.serialize(() => {
      // Update recipe
      db.run(
        'UPDATE recipe_book_recipes SET title = ?, description = ?, thumbnail_image = ?, is_favorite = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newTitle, newDescription, newThumbnail, newIsFavorite, newTags, recipeId],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            db.close();
            return;
          }

          // Update ingredients if provided
          if (ingredients) {
            let ingredientsArray = [];
            try {
              ingredientsArray = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
            } catch (e) {
              res.status(400).json({ error: 'Invalid JSON format for ingredients' });
              db.close();
              return;
            }

            // Delete existing ingredients
            db.run('DELETE FROM ingredients WHERE recipe_id = ?', [recipeId], (err) => {
              if (err) {
                res.status(500).json({ error: err.message });
                db.close();
                return;
              }

              // Insert new ingredients
              if (ingredientsArray.length > 0) {
                const ingredientStmt = db.prepare(
                  'INSERT INTO ingredients (recipe_id, quantity, unit, ingredient_name) VALUES (?, ?, ?, ?)'
                );

                ingredientsArray.forEach(ing => {
                  ingredientStmt.run([
                    recipeId,
                    ing.quantity || null,
                    ing.unit || null,
                    ing.ingredient_name
                  ]);
                });

                ingredientStmt.finalize();
              }
            });
          }

          // Update instructions if provided
          if (instructions) {
            let instructionsArray = [];
            try {
              instructionsArray = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
            } catch (e) {
              res.status(400).json({ error: 'Invalid JSON format for instructions' });
              db.close();
              return;
            }

            // Delete existing instructions
            db.run('DELETE FROM instructions WHERE recipe_id = ?', [recipeId], (err) => {
              if (err) {
                res.status(500).json({ error: err.message });
                db.close();
                return;
              }

              // Insert new instructions
              if (instructionsArray.length > 0) {
                const instructionStmt = db.prepare(
                  'INSERT INTO instructions (recipe_id, step_number, description, image, icon) VALUES (?, ?, ?, ?, ?)'
                );

                instructionsArray.forEach((inst, index) => {
                  const stepNumber = inst.step_number || index + 1;
                  const icon = computeIcon(inst.description || '');
                  instructionStmt.run([
                    recipeId,
                    stepNumber,
                    inst.description,
                    inst.image || null,
                    icon
                  ]);
                });

                instructionStmt.finalize();
              }
            });
          }

          // Return updated recipe
          setTimeout(() => {
            db.get('SELECT * FROM recipe_book_recipes WHERE id = ?', [recipeId], (err, updatedRecipe) => {
              if (err) {
                res.status(500).json({ error: err.message });
                db.close();
                return;
              }

              db.all('SELECT * FROM ingredients WHERE recipe_id = ?', [recipeId], (err, ingredients) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  db.close();
                  return;
                }

                db.all('SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number', [recipeId], (err, instructions) => {
                  if (err) {
                    res.status(500).json({ error: err.message });
                    db.close();
                    return;
                  }

                  res.json({
                    ...updatedRecipe,
                    ingredients: ingredients || [],
                    instructions: instructions || []
                  });
                  db.close();
                });
              });
            });
          }, 100);
        }
      );
    });
  });
}

// Delete a recipe (cascades to ingredients and instructions)
function deleteRecipe(req, res) {
  const db = getDb();
  const recipeId = req.params.id;

  db.run('DELETE FROM recipe_book_recipes WHERE id = ?', [recipeId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      db.close();
      return;
    }

    res.json({ message: 'Recipe deleted successfully' });
    db.close();
  });
}

module.exports = {
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
};

