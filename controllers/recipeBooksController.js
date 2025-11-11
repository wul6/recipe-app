const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = 'recipes.db';

// Helper to get database connection
function getDb() {
  return new sqlite3.Database(DB_FILE);
}

// List all recipe books
function getAllRecipeBooks(req, res) {
  const db = getDb();

  db.all(`
    SELECT 
      rb.*,
      COUNT(r.id) as recipe_count
    FROM recipe_books rb
    LEFT JOIN recipe_book_recipes r ON rb.id = r.recipe_book_id
    GROUP BY rb.id
    ORDER BY rb.created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }
    res.json(rows);
    db.close();
  });
}

// Get a single recipe book with all recipes
function getRecipeBookById(req, res) {
  const db = getDb();
  const bookId = req.params.id;

  // Get recipe book
  db.get('SELECT * FROM recipe_books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (!book) {
      res.status(404).json({ error: 'Recipe book not found' });
      db.close();
      return;
    }

    // Get all recipes in this book
    db.all(
      'SELECT * FROM recipe_book_recipes WHERE recipe_book_id = ? ORDER BY created_at DESC',
      [bookId],
      (err, recipes) => {
        if (err) {
          res.status(500).json({ error: err.message });
          db.close();
          return;
        }

        res.json({
          ...book,
          recipes: recipes || []
        });
        db.close();
      }
    );
  });
}

// Create a new recipe book
function createRecipeBook(req, res) {
  const db = getDb();
  const { title } = req.body;
  const coverImage = req.file ? `/uploads/recipe_books/${req.file.filename}` : null;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    db.close();
    return;
  }

  db.run(
    'INSERT INTO recipe_books (title, cover_image, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [title, coverImage],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }

      res.status(201).json({
        id: this.lastID,
        title,
        cover_image: coverImage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      db.close();
    }
  );
}

// Update a recipe book
function updateRecipeBook(req, res) {
  const db = getDb();
  const bookId = req.params.id;
  const { title } = req.body;
  const coverImage = req.file ? `/uploads/recipe_books/${req.file.filename}` : null;

  // First get the existing book
  db.get('SELECT * FROM recipe_books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (!book) {
      res.status(404).json({ error: 'Recipe book not found' });
      db.close();
      return;
    }

    const newTitle = title || book.title;
    const newCoverImage = coverImage || book.cover_image;

    db.run(
      'UPDATE recipe_books SET title = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newTitle, newCoverImage, bookId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          db.close();
          return;
        }

        res.json({
          id: bookId,
          title: newTitle,
          cover_image: newCoverImage,
          created_at: book.created_at,
          updated_at: new Date().toISOString()
        });
        db.close();
      }
    );
  });
}

// Delete a recipe book (cascades to recipes, ingredients, instructions)
function deleteRecipeBook(req, res) {
  const db = getDb();
  const bookId = req.params.id;

  db.run('DELETE FROM recipe_books WHERE id = ?', [bookId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      db.close();
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Recipe book not found' });
      db.close();
      return;
    }

    res.json({ message: 'Recipe book deleted successfully' });
    db.close();
  });
}

module.exports = {
  getAllRecipeBooks,
  getRecipeBookById,
  createRecipeBook,
  updateRecipeBook,
  deleteRecipeBook
};

