# Mood Recipe App

A simple web application that recommends recipes based on your current mood.

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

- `GET /api/recipes/:mood` - Get a random recipe for a specific mood
- `GET /api/recipes/:mood/another?exclude=:id` - Get another recipe for the same mood (excluding the current one)
- `GET /api/moods` - Get all available moods


