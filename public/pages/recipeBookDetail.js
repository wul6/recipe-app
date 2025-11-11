// Get book ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

if (!bookId) {
    window.location.href = 'recipeBooks.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadRecipeBook();
    
    document.getElementById('add-recipe-btn').addEventListener('click', () => {
        window.location.href = `recipeEdit.html?book_id=${bookId}`;
    });
    
    document.getElementById('add-first-btn').addEventListener('click', () => {
        window.location.href = `recipeEdit.html?book_id=${bookId}`;
    });
});

async function loadRecipeBook() {
    const loading = document.getElementById('loading');
    const header = document.getElementById('book-header');
    const grid = document.getElementById('recipes-grid');
    const emptyState = document.getElementById('empty-state');
    
    loading.classList.remove('hidden');
    
    try {
        const response = await fetch(`/api/recipe-books/${bookId}`);
        if (!response.ok) throw new Error('Failed to load recipe book');
        
        const book = await response.json();
        
        // Display book header
        const coverImage = book.cover_image || 'https://via.placeholder.com/800x400?text=No+Cover';
        header.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-1/3">
                    <img src="${coverImage}" alt="${book.title}" class="w-full h-64 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/800x400?text=No+Cover'">
                </div>
                <div class="md:w-2/3">
                    <h1 class="text-4xl font-bold text-purple-800 mb-4">${book.title}</h1>
                    <p class="text-gray-600 mb-2">${book.recipes?.length || 0} recipe${book.recipes?.length !== 1 ? 's' : ''}</p>
                    <p class="text-sm text-gray-500">Created: ${new Date(book.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        
        loading.classList.add('hidden');
        
        if (!book.recipes || book.recipes.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        book.recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            grid.appendChild(recipeCard);
        });
    } catch (error) {
        console.error('Error loading recipe book:', error);
        loading.classList.add('hidden');
        grid.innerHTML = '<p class="text-red-600 text-center col-span-full">Error loading recipes</p>';
    }
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-200 cursor-pointer';
    card.addEventListener('click', () => {
        window.location.href = `recipeEdit.html?book_id=${recipe.recipe_book_id}&recipe_id=${recipe.id}`;
    });
    
    const thumbnail = recipe.thumbnail_image || 'https://via.placeholder.com/400x300?text=No+Image';
    
    card.innerHTML = `
        <div class="relative h-48 bg-gray-200">
            <img src="${thumbnail}" alt="${recipe.title}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            ${recipe.is_favorite ? '<div class="absolute top-2 right-2 text-yellow-500 text-2xl">⭐</div>' : ''}
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2">${recipe.title}</h3>
            ${recipe.tags ? `<p class="text-sm text-gray-500">Tags: ${recipe.tags}</p>` : ''}
        </div>
    `;
    
    return card;
}

