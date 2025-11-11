const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DB_FILE = 'recipes.db';

function initializeDatabase() {
  // Check if database already exists
  if (fs.existsSync(DB_FILE)) {
    console.log('Database already exists');
    return;
  }

  const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return;
    }
    console.log('Connected to SQLite database');
  });

  // Create recipes table
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mood TEXT NOT NULL,
      description TEXT,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      cooking_time TEXT,
      difficulty TEXT
    )`);

    // Seed initial recipes
    const recipes = [
      {
        name: 'Chocolate Chip Cookies',
        mood: 'happy',
        description: 'Classic warm and chewy cookies that bring joy',
        ingredients: '2 cups flour, 1 cup butter, 1 cup sugar, 2 eggs, 1 tsp vanilla, 2 cups chocolate chips',
        instructions: '1. Mix butter and sugar. 2. Add eggs and vanilla. 3. Mix in flour. 4. Add chocolate chips. 5. Bake at 375°F for 10-12 minutes.',
        cooking_time: '25 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Mac and Cheese',
        mood: 'happy',
        description: 'Comforting creamy pasta dish',
        ingredients: '1 lb pasta, 2 cups cheddar cheese, 2 cups milk, 3 tbsp butter, 3 tbsp flour, salt, pepper',
        instructions: '1. Cook pasta. 2. Make roux with butter and flour. 3. Add milk and cheese. 4. Mix with pasta. 5. Bake at 350°F for 20 minutes.',
        cooking_time: '35 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Ice Cream Sundae',
        mood: 'happy',
        description: 'Sweet treat to lift your spirits',
        ingredients: 'Vanilla ice cream, chocolate syrup, whipped cream, cherries, nuts',
        instructions: '1. Scoop ice cream into bowl. 2. Drizzle with chocolate syrup. 3. Top with whipped cream. 4. Add cherry and nuts.',
        cooking_time: '5 minutes',
        difficulty: 'Very Easy'
      },
      {
        name: 'Warm Chicken Soup',
        mood: 'sad',
        description: 'Healing and comforting soup for difficult times',
        ingredients: '2 chicken breasts, 6 cups chicken broth, 1 cup carrots, 1 cup celery, 1 cup onions, noodles, salt, pepper',
        instructions: '1. Cook chicken in broth. 2. Add vegetables. 3. Simmer for 30 minutes. 4. Add noodles. 5. Cook until noodles are tender.',
        cooking_time: '45 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Hot Chocolate',
        mood: 'sad',
        description: 'Warm and soothing drink',
        ingredients: '2 cups milk, 2 tbsp cocoa powder, 2 tbsp sugar, marshmallows',
        instructions: '1. Heat milk. 2. Whisk in cocoa and sugar. 3. Pour into mug. 4. Top with marshmallows.',
        cooking_time: '10 minutes',
        difficulty: 'Very Easy'
      },
      {
        name: 'Mashed Potatoes',
        mood: 'sad',
        description: 'Soft and comforting side dish',
        ingredients: '4 large potatoes, 1/2 cup milk, 4 tbsp butter, salt, pepper',
        instructions: '1. Boil potatoes until tender. 2. Mash potatoes. 3. Add warm milk and butter. 4. Season with salt and pepper.',
        cooking_time: '30 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Spicy Curry',
        mood: 'angry',
        description: 'Let out your frustration with bold flavors',
        ingredients: '2 lbs chicken, 2 onions, 3 cloves garlic, 2 tbsp curry powder, 1 can coconut milk, chili peppers, rice',
        instructions: '1. Brown chicken. 2. Add onions and garlic. 3. Add curry powder and chili. 4. Add coconut milk. 5. Simmer 30 minutes. 6. Serve with rice.',
        cooking_time: '50 minutes',
        difficulty: 'Medium'
      },
      {
        name: 'Spicy Salsa',
        mood: 'angry',
        description: 'Bold and fiery dip',
        ingredients: '4 tomatoes, 2 jalapeños, 1 onion, 1/4 cup cilantro, lime juice, salt',
        instructions: '1. Dice tomatoes and onions. 2. Chop jalapeños and cilantro. 3. Mix together. 4. Add lime juice and salt. 5. Let sit for 30 minutes.',
        cooking_time: '15 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Buffalo Wings',
        mood: 'angry',
        description: 'Spicy wings to match your intensity',
        ingredients: '2 lbs chicken wings, 1/2 cup hot sauce, 4 tbsp butter, blue cheese dressing',
        instructions: '1. Bake wings at 400°F for 45 minutes. 2. Mix hot sauce and butter. 3. Toss wings in sauce. 4. Serve with blue cheese dressing.',
        cooking_time: '50 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Green Smoothie',
        mood: 'energetic',
        description: 'Fuel your energy with healthy greens',
        ingredients: '2 cups spinach, 1 banana, 1 cup mango, 1 cup orange juice, 1 tbsp honey',
        instructions: '1. Blend spinach and orange juice. 2. Add banana and mango. 3. Add honey. 4. Blend until smooth.',
        cooking_time: '5 minutes',
        difficulty: 'Very Easy'
      },
      {
        name: 'Protein Pancakes',
        mood: 'energetic',
        description: 'High-protein breakfast to power your day',
        ingredients: '2 eggs, 1 banana, 1/2 cup oats, 1 scoop protein powder, berries',
        instructions: '1. Blend all ingredients. 2. Cook pancakes on griddle. 3. Flip when bubbles form. 4. Top with berries.',
        cooking_time: '15 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Energy Balls',
        mood: 'energetic',
        description: 'Quick energy boost snack',
        ingredients: '1 cup dates, 1 cup almonds, 2 tbsp cocoa powder, 1 tbsp coconut',
        instructions: '1. Blend dates and almonds. 2. Add cocoa powder. 3. Form into balls. 4. Roll in coconut. 5. Refrigerate for 1 hour.',
        cooking_time: '20 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Chamomile Tea',
        mood: 'stressed',
        description: 'Calming herbal tea to help you relax',
        ingredients: 'Chamomile tea bags, hot water, honey',
        instructions: '1. Boil water. 2. Steep tea bag for 5 minutes. 3. Add honey to taste.',
        cooking_time: '10 minutes',
        difficulty: 'Very Easy'
      },
      {
        name: 'Lavender Cookies',
        mood: 'stressed',
        description: 'Gentle and calming cookies',
        ingredients: '2 cups flour, 1 cup butter, 1/2 cup sugar, 1 egg, 1 tbsp dried lavender, vanilla extract',
        instructions: '1. Cream butter and sugar. 2. Add egg and vanilla. 3. Mix in flour and lavender. 4. Bake at 350°F for 12 minutes.',
        cooking_time: '25 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Meditation Smoothie Bowl',
        mood: 'stressed',
        description: 'Calming and nutritious bowl',
        ingredients: '1 banana, 1/2 cup blueberries, 1/2 cup yogurt, granola, chia seeds',
        instructions: '1. Blend banana, blueberries, and yogurt. 2. Pour into bowl. 3. Top with granola and chia seeds.',
        cooking_time: '10 minutes',
        difficulty: 'Very Easy'
      },
      {
        name: 'Pizza',
        mood: 'lazy',
        description: 'Easy and satisfying meal',
        ingredients: 'Pizza dough, tomato sauce, mozzarella cheese, toppings of choice',
        instructions: '1. Roll out dough. 2. Spread sauce. 3. Add cheese and toppings. 4. Bake at 425°F for 15-20 minutes.',
        cooking_time: '30 minutes',
        difficulty: 'Easy'
      },
      {
        name: 'Grilled Cheese Sandwich',
        mood: 'lazy',
        description: 'Simple and delicious',
        ingredients: 'Bread, cheese, butter',
        instructions: '1. Butter bread. 2. Add cheese between slices. 3. Grill until golden brown on both sides.',
        cooking_time: '10 minutes',
        difficulty: 'Very Easy'
      },
      {
        name: 'Ramen Noodles',
        mood: 'lazy',
        description: 'Quick and easy comfort food',
        ingredients: 'Instant ramen, egg, green onions, soy sauce',
        instructions: '1. Cook ramen according to package. 2. Add soft-boiled egg. 3. Top with green onions and soy sauce.',
        cooking_time: '10 minutes',
        difficulty: 'Very Easy'
      }
    ];

    const stmt = db.prepare(`INSERT INTO recipes (name, mood, description, ingredients, instructions, cooking_time, difficulty) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);

    recipes.forEach(recipe => {
      stmt.run(
        recipe.name,
        recipe.mood,
        recipe.description,
        recipe.ingredients,
        recipe.instructions,
        recipe.cooking_time,
        recipe.difficulty
      );
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error seeding database:', err.message);
      } else {
        console.log('Database seeded with initial recipes');
      }
      db.close();
    });
  });
}

module.exports = { initializeDatabase };


