# Mood Recipe App

A simple web application that recommends recipes based on your current mood, and lets you manage recipe books with structured recipes.

## Features

- Select your mood from 6 different options
- Get a random recipe tailored to your mood
- Request a new recipe if you don't like the current one
- Simple and intuitive interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Tech Stack

- **Backend**: Express.js
- **Database**: SQLite
- **Frontend**: HTML, CSS (Tailwind), JavaScript

## Available Moods

- 😊 Happy
- 😢 Sad
- 😠 Angry
- ⚡ Energetic
- 😰 Stressed
- 😴 Lazy

## API Endpoints

- Mood-based
  - `GET /api/mood-recipes/:mood` - Get a random recipe for a specific mood
  - `GET /api/mood-recipes/:mood/another?exclude=:id` - Get another recipe for the same mood (excluding the current one)
  - `GET /api/moods` - Get all available moods

- Recipe books
  - `GET /api/recipe-books` - List all recipe books
  - `POST /api/recipe-books` - Create a recipe book (multipart; field: cover_image)
  - `GET /api/recipe-books/:id` - Get a recipe book with its recipes
  - `PUT /api/recipe-books/:id` - Update a recipe book (multipart; field: cover_image)
  - `DELETE /api/recipe-books/:id` - Delete a recipe book and cascade its recipes

- Recipes (within recipe books)
  - `GET /api/recipes/:id` - Get a recipe with ingredients and instructions
  - `POST /api/recipes` - Create a recipe (multipart; field: thumbnail_image; JSON fields: ingredients[], instructions[])
  - `PUT /api/recipes/:id` - Update a recipe (JSON supports updating title, ingredients[], instructions[])
  - `DELETE /api/recipes/:id` - Delete a recipe

## UI Pages

- `public/index.html` — Mood-based recommendation
- `public/pages/recipeBooks.html` — All recipe books (+ create modal)
- `public/pages/recipeBookDetail.html?id=<bookId>` — Recipes in a book, with Delete Book button
- `public/pages/recipe.html?id=<recipeId>&bookId=<bookId>` — Read-only recipe with inline-edit lightbox
- `public/pages/recipeEdit.html?book_id=<bookId>[&recipe_id=<id>]` — Full edit form (legacy editor)

## Editing flow (lightbox)

- Open a recipe at `recipe.html?id=<id>&bookId=<bookId>`
- Click ✏️ to open the lightbox and edit ingredients/instructions inline
- Save triggers a `PUT /api/recipes/:id` with JSON arrays; UI refreshes on success


