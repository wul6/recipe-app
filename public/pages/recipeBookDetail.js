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

    // Wire up delete book button if present
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.id === 'delete-book-btn') {
            onDeleteBook();
        }
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
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div class="flex-1">
                            <div id="title-display" class="flex items-center gap-3">
                                <h1 id="book-title-text" class="text-4xl font-bold text-purple-800">${escapeHtml(book.title)}</h1>
                                <button id="edit-title-btn" class="text-purple-600 hover:text-purple-800 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-50 transition">✏️ Edit Book</button>
                            </div>
                            <div id="title-edit" class="hidden flex items-center gap-2">
                                <input type="text" id="title-input" value="${escapeHtml(book.title)}" 
                                    class="text-4xl font-bold text-purple-800 border-2 border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1">
                                <button id="save-title-btn" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition">✅ Save</button>
                                <button id="cancel-title-btn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition">❌ Cancel</button>
                            </div>
                        </div>
                        <button id="delete-book-btn" class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-2 rounded-lg transition">🗑️ Delete Book</button>
                    </div>
                    <p class="text-gray-600 mb-2">${book.recipes?.length || 0} recipe${book.recipes?.length !== 1 ? 's' : ''}</p>
                    <p class="text-sm text-gray-500">Created: ${new Date(book.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        
        // Wire up title editing
        setupTitleEditing();
        
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
        window.location.href = `recipe.html?bookId=${recipe.recipe_book_id}&id=${recipe.id}`;
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

function setupTitleEditing() {
    const editBtn = document.getElementById('edit-title-btn');
    const saveBtn = document.getElementById('save-title-btn');
    const cancelBtn = document.getElementById('cancel-title-btn');
    const titleDisplay = document.getElementById('title-display');
    const titleEdit = document.getElementById('title-edit');
    const titleInput = document.getElementById('title-input');
    const titleText = document.getElementById('book-title-text');
    
    if (!editBtn) return; // Not loaded yet
    
    let originalTitle = titleText.textContent;
    
    editBtn.addEventListener('click', () => {
        originalTitle = titleText.textContent;
        titleInput.value = originalTitle;
        titleDisplay.classList.add('hidden');
        titleEdit.classList.remove('hidden');
        titleInput.focus();
        titleInput.select();
    });
    
    const saveTitle = async () => {
        const newTitle = titleInput.value.trim();
        if (!newTitle) {
            showToast('Title cannot be empty', 'error');
            return;
        }
        
        if (newTitle === originalTitle) {
            cancelTitle();
            return;
        }
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
            const res = await fetch(`/api/recipe-books/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                throw new Error(e.error || 'Failed to update title');
            }
            
            titleText.textContent = newTitle;
            titleDisplay.classList.remove('hidden');
            titleEdit.classList.add('hidden');
            showToast('✅ Title saved successfully!', 'success');
            originalTitle = newTitle;
        } catch (e) {
            console.error(e);
            showToast('Error saving title: ' + e.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = '✅ Save';
        }
    };
    
    const cancelTitle = () => {
        titleInput.value = originalTitle;
        titleDisplay.classList.remove('hidden');
        titleEdit.classList.add('hidden');
    };
    
    saveBtn.addEventListener('click', saveTitle);
    cancelBtn.addEventListener('click', cancelTitle);
    
    // Keyboard shortcuts
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTitle();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelTitle();
        }
    });
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
}

function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existing = document.getElementById('toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast';
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-0`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('opacity-100');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function onDeleteBook() {
    if (!confirm('Are you sure you want to delete this recipe book and all its recipes?')) return;
    try {
        const res = await fetch(`/api/recipe-books/${bookId}`, { method: 'DELETE' });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(e.error || 'Failed to delete');
        }
        showToast('✅ Recipe book deleted successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'recipeBooks.html';
        }, 1000);
    } catch (e) {
        console.error(e);
        showToast('Error deleting book: ' + e.message, 'error');
    }
}

