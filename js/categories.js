/**
 * Category Management JavaScript
 * Handles category creation, editing, and filtering
 * Include this in dashboard.html: <script src="assets/js/categories.js"></script>
 */

class CategoryManager {
    constructor() {
        this.categories = [];
        this.init();
    }

    /**
     * Initialize category manager
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.openCreateCategoryModal());
        }

        // Category filter clicks (handled in tasks.js but can be enhanced here)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-item')) {
                const categoryItem = e.target.closest('.category-item');
                const categoryId = categoryItem.dataset.categoryId;
                this.filterTasksByCategory(categoryId);
            }
        });
    }

    /**
     * Load all categories from API
     */
    async loadCategories() {
        try {
            const response = await apiRequest('/categories/read.php');
            
            if (response && response.success) {
                this.categories = response.data || [];
                this.renderCategories();
                this.populateCategoryDropdowns();
                return this.categories;
            } else {
                showToast('Failed to load categories', 'error');
                return [];
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            showToast('Error loading categories', 'error');
            return [];
        }
    }

    /**
     * Render categories in sidebar
     */
    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        
        if (!categoriesList) return;

        if (this.categories.length === 0) {
            categoriesList.innerHTML = `
                <p style="color: var(--text-secondary); font-size: 0.875rem; text-align: center; padding: 1rem;">
                    No categories yet
                </p>
            `;
            return;
        }

        // Separate system and custom categories
        const systemCategories = this.categories.filter(c => c.user_id === null);
        const customCategories = this.categories.filter(c => c.user_id !== null);

        let html = '';

        // System categories
        if (systemCategories.length > 0) {
            systemCategories.forEach(category => {
                html += this.createCategoryHTML(category);
            });
        }

        // Divider if both types exist
        if (systemCategories.length > 0 && customCategories.length > 0) {
            html += '<div style="border-top: 1px solid var(--border); margin: 0.5rem 0;"></div>';
        }

        // Custom categories
        if (customCategories.length > 0) {
            customCategories.forEach(category => {
                html += this.createCategoryHTML(category, true);
            });
        }

        categoriesList.innerHTML = html;

        // Update category counts
        this.updateCategoryCounts();
    }

    /**
     * Create category HTML
     */
    createCategoryHTML(category, isCustom = false) {
        return `
            <div class="category-item" data-category-id="${category.category_id}">
                <span class="category-color" style="background: ${category.category_color}"></span>
                <span class="category-name">${sanitizeHTML(category.category_name)}</span>
                <span class="category-count" id="cat-count-${category.category_id}">0</span>
                ${isCustom ? `
                    <button class="category-action-btn" onclick="categoryManager.editCategory(${category.category_id})" title="Edit">
                        ✏️
                    </button>
                    <button class="category-action-btn delete" onclick="categoryManager.deleteCategory(${category.category_id})" title="Delete">
                        🗑️
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Populate category dropdowns in forms
     */
    populateCategoryDropdowns() {
        const dropdowns = document.querySelectorAll('.category-dropdown, #taskCategory');
        
        dropdowns.forEach(dropdown => {
            const currentValue = dropdown.value;
            
            dropdown.innerHTML = '<option value="">No Category</option>' +
                this.categories.map(cat => 
                    `<option value="${cat.category_id}">${sanitizeHTML(cat.category_name)}</option>`
                ).join('');
            
            // Restore previous selection if it exists
            if (currentValue) {
                dropdown.value = currentValue;
            }
        });
    }

    /**
     * Update category task counts
     */
    updateCategoryCounts() {
        if (!window.allTasks) return;

        this.categories.forEach(category => {
            const count = window.allTasks.filter(
                task => task.category_id == category.category_id
            ).length;
            
            const countElement = document.getElementById(`cat-count-${category.category_id}`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    /**
     * Open create category modal
     */
    openCreateCategoryModal() {
        const modalHTML = `
            <div id="categoryModal" class="modal">
                <div class="modal-overlay" onclick="categoryManager.closeCategoryModal()"></div>
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h2>Create Category</h2>
                        <button class="btn-close" onclick="categoryManager.closeCategoryModal()">×</button>
                    </div>
                    <form id="categoryForm" class="modal-body">
                        <div class="form-group">
                            <label for="categoryName">Category Name *</label>
                            <input 
                                type="text" 
                                id="categoryName" 
                                name="category_name" 
                                placeholder="e.g., Fitness, Study, Projects"
                                required
                                maxlength="50"
                            >
                        </div>

                        <div class="form-group">
                            <label for="categoryColor">Category Color</label>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <input 
                                    type="color" 
                                    id="categoryColor" 
                                    name="category_color" 
                                    value="#3498db"
                                    style="width: 60px; height: 40px; border: 2px solid var(--border); border-radius: 8px; cursor: pointer;"
                                >
                                <input 
                                    type="text" 
                                    id="categoryColorHex" 
                                    value="#3498db"
                                    placeholder="#3498db"
                                    maxlength="7"
                                    style="width: 100px;"
                                >
                            </div>
                            <small>Choose a color to identify this category</small>
                        </div>

                        <div id="categoryError" class="error-message"></div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="categoryManager.closeCategoryModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Create Category
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('categoryModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submission
        const form = document.getElementById('categoryForm');
        form.addEventListener('submit', (e) => this.handleCategorySubmit(e));

        // Sync color picker with hex input
        const colorPicker = document.getElementById('categoryColor');
        const colorHex = document.getElementById('categoryColorHex');

        colorPicker.addEventListener('input', (e) => {
            colorHex.value = e.target.value;
        });

        colorHex.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                colorPicker.value = hex;
            }
        });
    }

    /**
     * Close category modal
     */
    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Handle category form submission
     */
    async handleCategorySubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        
        const categoryData = {
            category_name: formData.get('category_name').trim(),
            category_color: formData.get('category_color')
        };

        // Validate
        if (!categoryData.category_name) {
            this.showCategoryError('Category name is required');
            return;
        }

        if (categoryData.category_name.length < 2) {
            this.showCategoryError('Category name must be at least 2 characters');
            return;
        }

        if (categoryData.category_name.length > 50) {
            this.showCategoryError('Category name must be 50 characters or less');
            return;
        }

        // Check for duplicate
        const duplicate = this.categories.find(
            cat => cat.category_name.toLowerCase() === categoryData.category_name.toLowerCase()
        );

        if (duplicate) {
            this.showCategoryError('A category with this name already exists');
            return;
        }

        try {
            const response = await apiRequest('/categories/create.php', 'POST', categoryData);

            if (response && response.success) {
                showToast('Category created successfully', 'success');
                this.closeCategoryModal();
                
                // Reload categories
                await this.loadCategories();
                
                // Update task form dropdown
                this.populateCategoryDropdowns();
            } else {
                this.showCategoryError(response.message || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            this.showCategoryError('Network error. Please try again.');
        }
    }

    /**
     * Show error in category form
     */
    showCategoryError(message) {
        const errorElement = document.getElementById('categoryError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    /**
     * Edit category (placeholder for future feature)
     */
    editCategory(categoryId) {
        const category = this.categories.find(c => c.category_id == categoryId);
        if (!category) return;

        showToast('Edit category feature - Coming soon!', 'info');
        
        // TODO: Implement edit functionality
        // Similar to create but with update API endpoint
        console.log('Edit category:', category);
    }

    /**
     * Delete category
     */
    async deleteCategory(categoryId) {
        const category = this.categories.find(c => c.category_id == categoryId);
        if (!category) return;

        // Check if category has tasks
        const tasksCount = window.allTasks ? 
            window.allTasks.filter(t => t.category_id == categoryId).length : 0;

        let confirmMessage = `Delete category "${category.category_name}"?`;
        if (tasksCount > 0) {
            confirmMessage += `\n\nThis category has ${tasksCount} task${tasksCount > 1 ? 's' : ''}. The tasks will not be deleted, but will have no category.`;
        }

        if (!confirm(confirmMessage)) return;

        try {
            // TODO: Implement delete API endpoint
            // const response = await apiRequest('/categories/delete.php', 'POST', { category_id: categoryId });

            showToast('Delete category API endpoint not yet implemented', 'info');
            
            // For now, just show message
            console.log('Delete category:', categoryId);

            // When implemented:
            // if (response && response.success) {
            //     showToast('Category deleted successfully', 'success');
            //     await this.loadCategories();
            //     if (window.loadTasks) await window.loadTasks();
            // }
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('Error deleting category', 'error');
        }
    }

    /**
     * Filter tasks by category
     */
    filterTasksByCategory(categoryId) {
    if (!window.allTasks) return;

    const category = this.categories.find(c => c.category_id == categoryId);
    if (!category) return;

    // Update title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = `${category.category_name} Tasks`;
    }

    // Filter tasks
    const filteredTasks = window.allTasks.filter(task => task.category_id == categoryId);

    // Render filtered tasks
    if (window.renderTasks) {
        window.renderTasks(filteredTasks);
    }

    // Highlight active category
    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));

    const active = document.querySelector(`.category-item[data-category-id="${categoryId}"]`);
    if (active) active.classList.add('active');

    // Remove nav item highlights (All, Today, Upcoming, Completed)
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    // Toast
    showToast(`Showing ${filteredTasks.length} task(s) in ${category.category_name}`, 'info');
}


    /**
     * Get category by ID
     */
    getCategoryById(categoryId) {
        return this.categories.find(c => c.category_id == categoryId);
    }

    /**
     * Get category name by ID
     */
    getCategoryName(categoryId) {
        const category = this.getCategoryById(categoryId);
        return category ? category.category_name : 'No Category';
    }

    /**
     * Get category color by ID
     */
    getCategoryColor(categoryId) {
        const category = this.getCategoryById(categoryId);
        return category ? category.category_color : '#6B7280';
    }

    /**
     * Clear category filter (show all tasks)
     */
    clearCategoryFilter() {
        // Remove active state from categories
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });

        // Reset page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = 'Dashboard';
        }

        // Reload all tasks
        if (window.filterAndRenderTasks) {
            window.filterAndRenderTasks();
        }
    }
}

// Initialize category manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.categoryManager = new CategoryManager();
    });
} else {
    window.categoryManager = new CategoryManager();
}

// Make CategoryManager available globally
window.CategoryManager = CategoryManager;
