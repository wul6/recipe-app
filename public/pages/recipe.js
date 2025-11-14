// Query params: ?id=<recipeId>&bookId=<bookId>
const params = new URLSearchParams(window.location.search);
const recipeId = params.get('id');
const bookId = params.get('bookId');

if (!recipeId || !bookId) {
	window.location.href = 'recipeBooks.html';
}

let currentRecipe = null;

document.addEventListener('DOMContentLoaded', () => {
	loadBookAndRecipes();
	loadRecipe();
	document.getElementById('open-edit').addEventListener('click', openLightbox);
	document.getElementById('close-edit').addEventListener('click', closeLightbox);
	document.getElementById('save-edit').addEventListener('click', saveEdits);
	
	// Keyboard shortcuts for lightbox
	document.addEventListener('keydown', (e) => {
		const lightbox = document.getElementById('edit-lightbox');
		if (!lightbox.classList.contains('hidden')) {
			if (e.key === 'Escape') {
				closeLightbox();
			}
		}
	});
});

async function loadBookAndRecipes() {
	try {
		const res = await fetch(`/api/recipe-books/${bookId}`);
		if (!res.ok) throw new Error('Failed to load book');
		const book = await res.json();

		// Book title
		const bookTitleSpan = document.querySelector('#book-title span');
		bookTitleSpan.innerText = book.title;
		const bookLink = document.getElementById('book-title-link');
		bookLink.href = `recipeBookDetail.html?id=${bookId}`;

		// Recipe list
		const list = document.getElementById('recipe-list');
		list.innerHTML = '';
		(book.recipes || []).forEach(r => {
			const li = document.createElement('li');
			const active = String(r.id) === String(recipeId);
			li.innerHTML = `
				<a href="recipe.html?id=${r.id}&bookId=${bookId}"
				   class="block px-3 py-2 rounded-md ${active ? 'bg-gray-200' : 'hover:bg-gray-100'}">
					${r.title}
				</a>
			`;
			list.appendChild(li);
		});
	} catch (e) {
		console.error(e);
	}
}

async function loadRecipe() {
	try {
		const res = await fetch(`/api/recipes/${recipeId}`);
		if (!res.ok) throw new Error('Failed to load recipe');
		const recipe = await res.json();
		currentRecipe = recipe;
		renderRecipe(recipe);
	} catch (e) {
		console.error(e);
	}
}

function renderRecipe(recipe) {
	document.getElementById('recipe-title').textContent = recipe.title;

	// Thumbnail image with upload
	const thumbnailContainer = document.getElementById('recipe-thumbnail-container');
	const thumbnailImage = recipe.thumbnail_image;
	thumbnailContainer.innerHTML = `
		<div class="relative group max-w-md">
			<img id="recipe-thumbnail-image" src="${thumbnailImage}" alt="${recipe.title}" 
				class="w-full h-64 object-cover rounded-lg shadow-md" 
				onerror="this.src='/images/default-recipe-1.png'">
			<div id="recipe-thumbnail-overlay" class="hidden group-hover:flex absolute inset-0 bg-black/50 text-white items-center justify-center rounded-lg cursor-pointer transition">
				<div class="text-center">
					<div class="text-2xl mb-2">📷</div>
					<div class="text-sm font-semibold">Click to Upload</div>
				</div>
			</div>
			<input type="file" id="recipe-thumbnail-input" accept="image/*" class="hidden">
		</div>
	`;
	
	// Wire up thumbnail upload
	setupRecipeThumbnailUpload();
	
	// Description
	const description = document.getElementById('description');
	description.classList.add('hidden');
	if (recipe.description && recipe.description.trim() !== '') {
		description.innerHTML = `
			<h3 class="text-xl mb-2">${recipe.description}</h3>
		`;
		description.classList.remove('hidden');
	}

	// Ingredients
	const ingredients = document.getElementById('ingredients');
	ingredients.innerHTML = `
		<h3 class="text-xl font-semibold mb-2">Ingredients</h3>
		<ul class="list-disc list-inside bg-gray-50 p-4 rounded-lg space-y-1">
			${(recipe.ingredients || []).map(ing => `
				<li class="text-gray-700">
					${[ing.quantity, ing.unit, ing.ingredient_name].filter(Boolean).join(' ')}
				</li>
			`).join('')}
		</ul>
	`;

	// Instructions
	const instructions = document.getElementById('instructions');
	instructions.innerHTML = `
		<h3 class="text-xl font-semibold mb-2">Instructions</h3>
		<ol class="list-decimal list-inside bg-gray-50 p-4 rounded-lg space-y-2">
			${(recipe.instructions || []).map(step => `
				<li class="text-gray-700 flex items-start gap-2">
					${step.icon ? `<span class="mt-0.5">${iconToEmoji(step.icon)}</span>` : ''}
					<span>${step.description}</span>
				</li>
			`).join('')}
		</ol>
	`;
}

function iconToEmoji(icon) {
	switch (icon) {
		case 'knife.png': return '🔪';
		case 'pot.png': return '🍲';
		case 'oven.png': return '🔥';
		case 'whisk.png': return '🥄';
		case 'pan.png': return '🍳';
		case 'grill.png': return '🔥';
		default: return '';
	}
}

function openLightbox() {
	const lb = document.getElementById('edit-lightbox');
	const container = document.getElementById('edit-content');
	container.innerHTML = '';
	if (!currentRecipe) return;

	// Title (todo: make into inline edit)
	container.appendChild(sectionTitle('Title'));
	const titleInput = inlineEditableText('recipe-title-input', currentRecipe.title);
	container.appendChild(titleInput);
	
	// Description
	container.appendChild(sectionTitle('Description'));
	const descriptionInput = inlineTextarea('recipe-description-input', currentRecipe.description || '', 'Description');
	container.appendChild(descriptionInput);

	// Auto-focus title input
	setTimeout(() => {
		const input = document.getElementById('recipe-title-input');
		if (input) {
			input.focus();
			input.select();
		}
	}, 100);

	// Ingredients
	container.appendChild(sectionTitle('Ingredients'));
	const ingWrap = document.createElement('div');
	ingWrap.className = 'space-y-2';
	(currentRecipe.ingredients || []).forEach((ing, idx) => {
		ingWrap.appendChild(inlineRow([
			inlineField(`qty-${idx}`, ing.quantity || '', 'Quantity'),
			inlineField(`unit-${idx}`, ing.unit || '', 'Unit'),
			inlineField(`name-${idx}`, ing.ingredient_name || '', 'Ingredient', true)
		]));
	});
	container.appendChild(ingWrap);

	// Instructions
	container.appendChild(sectionTitle('Instructions'));
	const instWrap = document.createElement('div');
	instWrap.className = 'space-y-2';
	(currentRecipe.instructions || []).forEach((st, idx) => {
		instWrap.appendChild(inlineRow([
			inlineTextarea(`step-${idx}`, st.description || '', 'Step description')
		]));
	});
	container.appendChild(instWrap);

	lb.classList.remove('hidden');
}

function closeLightbox() {
	document.getElementById('edit-lightbox').classList.add('hidden');
}

function sectionTitle(text) {
	const h = document.createElement('h4');
	h.className = 'text-lg font-semibold text-gray-800 mt-4';
	h.textContent = text;
	return h;
}

function inlineRow(children) {
	const row = document.createElement('div');
	row.className = 'flex items-start gap-3';
	children.forEach(c => row.appendChild(c));
	return row;
}

function inlineField(id, value, placeholder, required = false) {
	const wrap = document.createElement('div');
	wrap.className = 'flex-1 relative';
	wrap.innerHTML = `
		<input id="${id}" value="${escapeHtml(value)}" placeholder="${placeholder}" ${required ? 'required' : ''}
			class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
	`;
	return wrap;
}

function inlineTextarea(id, value, placeholder) {
	const wrap = document.createElement('div');
	wrap.className = 'flex-1 relative';
	wrap.innerHTML = `
		<textarea id="${id}" placeholder="${placeholder}" rows="2"
			class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">${escapeHtml(value)}</textarea>
	`;
	return wrap;
}

function inlineEditableText(id, value) {
	const wrap = document.createElement('div');
	wrap.className = 'flex-1 relative';
	wrap.innerHTML = `
		<input id="${id}" value="${escapeHtml(value)}" 
			class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
	`;
	return wrap;
}

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, s => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[s]));
}

async function saveEdits() {
	if (!currentRecipe) return;

	const saveBtn = document.getElementById('save-edit');
	const originalText = saveBtn.textContent;
	saveBtn.disabled = true;
	saveBtn.textContent = 'Saving...';
	saveBtn.classList.add('opacity-50', 'cursor-not-allowed');

	// Gather title
	const titleInput = document.getElementById('recipe-title-input');
	const newTitle = titleInput ? titleInput.value.trim() : currentRecipe.title;

	if (!newTitle) {
		showToast('Recipe title cannot be empty', 'error');
		saveBtn.disabled = false;
		saveBtn.textContent = originalText;
		saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
		return;
	}

	// Gather description
	const descriptionInput = document.getElementById('recipe-description-input');
	const newDescription = descriptionInput ? descriptionInput.value.trim() : currentRecipe.description;

	// Gather ingredients
	const newIngredients = [];
	(currentRecipe.ingredients || []).forEach((_, idx) => {
		const qty = document.getElementById(`qty-${idx}`)?.value.trim();
		const unit = document.getElementById(`unit-${idx}`)?.value.trim();
		const name = document.getElementById(`name-${idx}`)?.value.trim();
		if (name) {
			newIngredients.push({
				quantity: qty || null,
				unit: unit || null,
				ingredient_name: name
			});
		}
	});

	if (newIngredients.length === 0) {
		showToast('Please add at least one ingredient', 'error');
		saveBtn.disabled = false;
		saveBtn.textContent = originalText;
		saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
		return;
	}

	// Gather instructions
	const newInstructions = [];
	(currentRecipe.instructions || []).forEach((_, idx) => {
		const desc = document.getElementById(`step-${idx}`)?.value.trim();
		if (desc) {
			newInstructions.push({
				step_number: idx + 1,
				description: desc
			});
		}
	});

	if (newInstructions.length === 0) {
		showToast('Please add at least one instruction', 'error');
		saveBtn.disabled = false;
		saveBtn.textContent = originalText;
		saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
		return;
	}

	try {
		const res = await fetch(`/api/recipes/${recipeId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: newTitle,
				description: newDescription,
				ingredients: newIngredients,
				instructions: newInstructions
			})
		});
		if (!res.ok) {
			const e = await res.json().catch(() => ({}));
			throw new Error(e.error || 'Failed to save');
		}
		closeLightbox();
		await loadRecipe();
		showToast('✅ Recipe updated successfully!', 'success');
	} catch (e) {
		console.error(e);
		showToast('Error saving changes: ' + e.message, 'error');
	} finally {
		saveBtn.disabled = false;
		saveBtn.textContent = originalText;
		saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
	}
}

function setupRecipeThumbnailUpload() {
	const overlay = document.getElementById('recipe-thumbnail-overlay');
	const input = document.getElementById('recipe-thumbnail-input');
	const image = document.getElementById('recipe-thumbnail-image');
	
	if (!overlay || !input || !image) return;
	
	// Click to upload
	overlay.addEventListener('click', () => input.click());
	
	// Drag and drop
	const container = overlay.parentElement;
	container.addEventListener('dragover', (e) => {
		e.preventDefault();
		container.classList.add('border-2', 'border-dashed', 'border-purple-400', 'bg-purple-50');
	});
	
	container.addEventListener('dragleave', (e) => {
		e.preventDefault();
		container.classList.remove('border-2', 'border-dashed', 'border-purple-400', 'bg-purple-50');
	});
	
	container.addEventListener('drop', (e) => {
		e.preventDefault();
		container.classList.remove('border-2', 'border-dashed', 'border-purple-400', 'bg-purple-50');
		
		const files = e.dataTransfer.files;
		if (files.length > 0 && files[0].type.startsWith('image/')) {
			handleThumbnailUpload(files[0]);
		}
	});
	
	input.addEventListener('change', (e) => {
		if (e.target.files && e.target.files[0]) {
			handleThumbnailUpload(e.target.files[0]);
		}
	});
	
	async function handleThumbnailUpload(file) {
		// Preview before upload
		const reader = new FileReader();
		reader.onload = (e) => {
			image.src = e.target.result;
		};
		reader.readAsDataURL(file);
		
		// Upload to server
		const formData = new FormData();
		formData.append('thumbnail_image', file);
		
		try {
			const res = await fetch(`/api/recipes/${recipeId}`, {
				method: 'PUT',
				body: formData
			});
			
			if (!res.ok) {
				const e = await res.json().catch(() => ({}));
				throw new Error(e.error || 'Failed to upload image');
			}
			
			const data = await res.json();
			if (data.thumbnail_image) {
				image.src = data.thumbnail_image;
			} else if (data.thumbnail_image === undefined && currentRecipe) {
				// Update current recipe object
				currentRecipe.thumbnail_image = `/uploads/recipes/${file.name}`;
			}
			showToast('✅ Recipe image updated successfully!', 'success');
		} catch (e) {
			console.error(e);
			showToast('Error uploading image: ' + e.message, 'error');
			// Revert to original image on error
			if (currentRecipe) {
				image.src = currentRecipe.thumbnail_image;
			}
		}
	}
}

function showToast(message, type = 'success') {
	// Remove existing toast if any
	const existing = document.getElementById('toast');
	if (existing) existing.remove();
	
	const toast = document.createElement('div');
	toast.id = 'toast';
	const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
	toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-0 opacity-0`;
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


