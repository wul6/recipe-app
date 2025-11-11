// Load recipe books on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRecipeBooks();
    
    // Modal handlers
    document.getElementById('create-book-btn').addEventListener('click', () => {
        document.getElementById('create-modal').classList.remove('hidden');
    });
    
    document.getElementById('create-first-btn').addEventListener('click', () => {
        document.getElementById('create-modal').classList.remove('hidden');
    });
    
    document.getElementById('cancel-create-btn').addEventListener('click', () => {
        document.getElementById('create-modal').classList.add('hidden');
        document.getElementById('create-book-form').reset();
    });
    
    // Form submission
    document.getElementById('create-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createRecipeBook();
    });
});

async function loadRecipeBooks() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('books-grid');
    const emptyState = document.getElementById('empty-state');
    
    loading.classList.remove('hidden');
    grid.innerHTML = '';
    
    try {
        const response = await fetch('/api/recipe-books');
        if (!response.ok) throw new Error('Failed to load recipe books');
        
        const books = await response.json();
        
        loading.classList.add('hidden');
        
        if (books.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        books.forEach(book => {
            const bookCard = createBookCard(book);
            grid.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error loading recipe books:', error);
        loading.classList.add('hidden');
        grid.innerHTML = '<p class="text-red-600 text-center col-span-full">Error loading recipe books</p>';
    }
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-200 cursor-pointer';
    card.addEventListener('click', () => {
        window.location.href = `recipeBookDetail.html?id=${book.id}`;
    });
    
    const coverImage = book.cover_image || 'https://via.placeholder.com/400x300?text=No+Cover';
    
    card.innerHTML = `
        <div class="relative h-48 bg-gray-200">
            <img src="${coverImage}" alt="${book.title}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/400x300?text=No+Cover'">
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2">${book.title}</h3>
            <p class="text-gray-600">${book.recipe_count || 0} recipe${book.recipe_count !== 1 ? 's' : ''}</p>
            <p class="text-sm text-gray-500 mt-2">Created: ${new Date(book.created_at).toLocaleDateString()}</p>
        </div>
    `;
    
    return card;
}

async function createRecipeBook() {
    const form = document.getElementById('create-book-form');
    const formData = new FormData();
    
    const title = document.getElementById('book-title').value;
    const coverFile = document.getElementById('book-cover').files[0];
    
    formData.append('title', title);
    if (coverFile) {
        formData.append('cover_image', coverFile);
    }
    
    try {
        const response = await fetch('/api/recipe-books', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create recipe book');
        }
        
        document.getElementById('create-modal').classList.add('hidden');
        form.reset();
        loadRecipeBooks();
    } catch (error) {
        console.error('Error creating recipe book:', error);
        alert('Error creating recipe book: ' + error.message);
    }
}

