// Get book ID and recipe ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('book_id');
const recipeId = urlParams.get('recipe_id');
const isEditMode = !!recipeId;

let ingredientCount = 0;
let instructionCount = 0;

// Icon mapping for instructions
const iconMap = {
    'knife.png': '🔪',
    'pot.png': '🍲',
    'oven.png': '🔥',
    'whisk.png': '🥄',
    'pan.png': '🍳',
    'grill.png': '🔥'
};

document.addEventListener('DOMContentLoaded', () => {
    if (!bookId) {
        window.location.href = 'recipeBooks.html';
        return;
    }

    if (isEditMode) {
        document.getElementById('page-title').textContent = 'Edit Recipe';
        document.getElementById('delete-btn').classList.remove('hidden');
        loadRecipe();
    } else {
        // Add initial empty ingredient and instruction
        addIngredientRow();
        addInstructionRow();
    }

    // Update back link
    document.getElementById('back-link').href = `recipeBookDetail.html?id=${bookId}`;

    // Event listeners
    document.getElementById('add-ingredient-btn').addEventListener('click', addIngredientRow);
    document.getElementById('add-instruction-btn').addEventListener('click', addInstructionRow);
    document.getElementById('recipe-form').addEventListener('submit', handleSubmit);
    document.getElementById('cancel-btn').addEventListener('click', () => {
        window.location.href = `recipeBookDetail.html?id=${bookId}`;
    });
    document.getElementById('delete-btn').addEventListener('click', handleDelete);
    document.getElementById('recipe-thumbnail').addEventListener('change', handleThumbnailPreview);
});

function addIngredientRow(ingredient = null) {
    const container = document.getElementById('ingredients-container');
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-center bg-gray-50 p-3 rounded-lg';
    row.dataset.index = ingredientCount++;

    row.innerHTML = `
        <input type="text" placeholder="Quantity" value="${ingredient?.quantity || ''}" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ingredient-quantity">
        <input type="text" placeholder="Unit (e.g., cup, tsp)" value="${ingredient?.unit || ''}" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ingredient-unit">
        <input type="text" placeholder="Ingredient name *" value="${ingredient?.ingredient_name || ''}" required class="flex-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ingredient-name">
        <button type="button" class="remove-ingredient-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200">
            ✕
        </button>
    `;

    row.querySelector('.remove-ingredient-btn').addEventListener('click', () => {
        row.remove();
    });

    container.appendChild(row);
}

function addInstructionRow(instruction = null) {
    const container = document.getElementById('instructions-container');
    const row = document.createElement('div');
    row.className = 'bg-gray-50 p-4 rounded-lg';
    row.dataset.index = instructionCount++;

    const stepNumber = instruction?.step_number || instructionCount;
    const icon = instruction?.icon ? iconMap[instruction.icon] || '' : '';

    row.innerHTML = `
        <div class="flex items-start gap-3 mb-2">
            <span class="text-lg font-bold text-purple-600">${stepNumber}.</span>
            ${icon ? `<span class="text-xl">${icon}</span>` : ''}
            <textarea placeholder="Instruction description *" required class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 instruction-description" rows="2">${instruction?.description || ''}</textarea>
            <button type="button" class="remove-instruction-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200">
                ✕
            </button>
        </div>
    `;

    row.querySelector('.remove-instruction-btn').addEventListener('click', () => {
        row.remove();
        updateStepNumbers();
    });

    // Auto-detect icon on description change
    row.querySelector('.instruction-description').addEventListener('input', (e) => {
        updateInstructionIcon(row, e.target.value);
    });

    container.appendChild(row);
}

function updateStepNumbers() {
    const rows = document.querySelectorAll('#instructions-container > div');
    rows.forEach((row, index) => {
        const stepNumber = row.querySelector('span.text-purple-600');
        if (stepNumber) {
            stepNumber.textContent = `${index + 1}.`;
        }
    });
}

function updateInstructionIcon(row, description) {
    const desc = description.toLowerCase();
    let icon = '';

    if (desc.match(/\b(chop|slice|dice|cut|mince)\b/)) {
        icon = '🔪';
    } else if (desc.match(/\b(boil|simmer|cook|heat)\b/)) {
        icon = '🍲';
    } else if (desc.match(/\b(bake|roast|oven)\b/)) {
        icon = '🔥';
    } else if (desc.match(/\b(mix|stir|whisk|blend)\b/)) {
        icon = '🥄';
    } else if (desc.match(/\b(fry|sauté|pan)\b/)) {
        icon = '🍳';
    } else if (desc.match(/\b(grill|barbecue|bbq)\b/)) {
        icon = '🔥';
    }

    const iconSpan = row.querySelector('span.text-xl');
    if (icon) {
        if (iconSpan) {
            iconSpan.textContent = icon;
        } else {
            const stepNumber = row.querySelector('span.text-purple-600');
            const newIcon = document.createElement('span');
            newIcon.className = 'text-xl';
            newIcon.textContent = icon;
            stepNumber.after(newIcon);
        }
    } else if (iconSpan) {
        iconSpan.remove();
    }
}

function handleThumbnailPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('thumbnail-img').src = e.target.result;
            document.getElementById('thumbnail-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

async function loadRecipe() {
    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        if (!response.ok) throw new Error('Failed to load recipe');

        const recipe = await response.json();

        // Populate form
        document.getElementById('recipe-title').value = recipe.title;
        document.getElementById('recipe-favorite').checked = recipe.is_favorite || false;
        document.getElementById('recipe-tags').value = recipe.tags || '';

        if (recipe.thumbnail_image) {
            document.getElementById('thumbnail-img').src = recipe.thumbnail_image;
            document.getElementById('thumbnail-preview').classList.remove('hidden');
        }

        // Clear containers
        document.getElementById('ingredients-container').innerHTML = '';
        document.getElementById('instructions-container').innerHTML = '';
        ingredientCount = 0;
        instructionCount = 0;

        // Add ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ing => addIngredientRow(ing));
        } else {
            addIngredientRow();
        }

        // Add instructions
        if (recipe.instructions && recipe.instructions.length > 0) {
            recipe.instructions.forEach(inst => addInstructionRow(inst));
        } else {
            addInstructionRow();
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        alert('Error loading recipe: ' + error.message);
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('recipe_book_id', bookId);
    formData.append('title', document.getElementById('recipe-title').value);
    formData.append('is_favorite', document.getElementById('recipe-favorite').checked);
    formData.append('tags', document.getElementById('recipe-tags').value);

    const thumbnailFile = document.getElementById('recipe-thumbnail').files[0];
    if (thumbnailFile) {
        formData.append('thumbnail_image', thumbnailFile);
    }

    // Collect ingredients
    const ingredients = [];
    document.querySelectorAll('#ingredients-container > div').forEach(row => {
        const quantity = row.querySelector('.ingredient-quantity').value.trim();
        const unit = row.querySelector('.ingredient-unit').value.trim();
        const name = row.querySelector('.ingredient-name').value.trim();
        
        if (name) {
            ingredients.push({
                quantity: quantity || null,
                unit: unit || null,
                ingredient_name: name
            });
        }
    });

    if (ingredients.length === 0) {
        alert('Please add at least one ingredient');
        return;
    }

    formData.append('ingredients', JSON.stringify(ingredients));

    // Collect instructions
    const instructions = [];
    document.querySelectorAll('#instructions-container > div').forEach((row, index) => {
        const description = row.querySelector('.instruction-description').value.trim();
        
        if (description) {
            instructions.push({
                step_number: index + 1,
                description: description
            });
        }
    });

    if (instructions.length === 0) {
        alert('Please add at least one instruction');
        return;
    }

    formData.append('instructions', JSON.stringify(instructions));

    try {
        const url = isEditMode ? `/api/recipes/${recipeId}` : '/api/recipes';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save recipe');
        }

        window.location.href = `recipeBookDetail.html?id=${bookId}`;
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Error saving recipe: ' + error.message);
    }
}

async function handleDelete() {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete recipe');
        }

        window.location.href = `recipeBookDetail.html?id=${bookId}`;
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Error deleting recipe: ' + error.message);
    }
}

