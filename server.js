const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
initializeDatabase();

// Get a random recipe by mood
app.get('/api/recipes/:mood', (req, res) => {
  const db = new sqlite3.Database('recipes.db');
  const mood = req.params.mood.toLowerCase();

  db.get(
    'SELECT * FROM recipes WHERE mood = ? ORDER BY RANDOM() LIMIT 1',
    [mood],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'No recipe found for this mood' });
        return;
      }
      res.json(row);
      db.close();
    }
  );
});

// Get another random recipe for the same mood (excluding current recipe ID)
app.get('/api/recipes/:mood/another', (req, res) => {
  const db = new sqlite3.Database('recipes.db');
  const mood = req.params.mood.toLowerCase();
  const excludeId = req.query.exclude;

  let query = 'SELECT * FROM recipes WHERE mood = ?';
  let params = [mood];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  query += ' ORDER BY RANDOM() LIMIT 1';

  db.get(query, params, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'No other recipe found for this mood' });
      return;
    }
    res.json(row);
    db.close();
  });
});

// Get all available moods
app.get('/api/moods', (req, res) => {
  const db = new sqlite3.Database('recipes.db');

  db.all('SELECT DISTINCT mood FROM recipes ORDER BY mood', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.mood));
    db.close();
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

