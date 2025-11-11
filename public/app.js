let currentMood = null;
let currentRecipeId = null;

// Mood selection buttons
document.querySelectorAll('.mood-btn').forEach(button => {
    button.addEventListener('click', () => {
        const mood = button.getAttribute('data-mood');
        selectMood(mood);
    });
});

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
    showMoodSelection();
});

// New recipe button
document.getElementById('new-recipe-btn').addEventListener('click', () => {
    if (currentMood) {
        getRecipe(currentMood, currentRecipeId);
    }
});

function selectMood(mood) {
    currentMood = mood;
    showRecipeDisplay();
    getRecipe(mood);
}

function showMoodSelection() {
    document.getElementById('mood-selection').classList.remove('hidden');
    document.getElementById('recipe-display').classList.add('hidden');
    currentMood = null;
    currentRecipeId = null;
}

function showRecipeDisplay() {
    document.getElementById('mood-selection').classList.add('hidden');
    document.getElementById('recipe-display').classList.remove('hidden');
    document.getElementById('recipe-content').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
}

function showRecipe(recipe) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('recipe-content').classList.remove('hidden');

    // Set recipe details
    document.getElementById('recipe-name').textContent = recipe.name;
    document.getElementById('recipe-description').textContent = recipe.description;
    document.getElementById('cooking-time').innerHTML = `⏱️ <span class="ml-1">${recipe.cooking_time}</span>`;
    document.getElementById('difficulty').innerHTML = `📊 <span class="ml-1">${recipe.difficulty}</span>`;

    // Set ingredients
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    const ingredients = recipe.ingredients.split(',').map(ing => ing.trim());
    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        li.className = 'text-gray-700';
        ingredientsList.appendChild(li);
    });

    // Set instructions
    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = '';
    const instructions = recipe.instructions.split(/\d+\./).filter(inst => inst.trim());
    instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction.trim();
        li.className = 'text-gray-700';
        instructionsList.appendChild(li);
    });

    currentRecipeId = recipe.id;
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('recipe-content').classList.add('hidden');
    document.getElementById('error-message').classList.remove('hidden');
}

async function getRecipe(mood, excludeId = null) {
    try {
        showRecipeDisplay();
        
        let url = `/api/mood-recipes/${mood}`;
        if (excludeId) {
            url += `/another?exclude=${excludeId}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            showError();
            return;
        }

        const recipe = await response.json();
        showRecipe(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        showError();
    }
}


