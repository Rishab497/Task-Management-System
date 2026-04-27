/**
 * Tasks Management JavaScript
 * Handles all task-related operations on the dashboard
 */

// Global variables
let allTasks = [];
let allCategories = [];
let currentUser = null;
let currentFilter = 'all';
let currentSort = 'deadline';
let currentView = 'all';
let editingTaskId = null;

// Allow filtering tasks by category from categories.js
window.filterTasksByCategory = function (categoryId) {
    const filtered = allTasks.filter(task => task.category_id == categoryId);
    renderTasks(filtered);
};


// DOM Elements
const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const taskModal = document.getElementById('taskModal');
const deleteModal = document.getElementById('deleteModal');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

/**
 * Initialize dashboard
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    await checkAuth();
    
    // Load initial data
    await loadCategories();
    await loadTasks();
    
    // Setup event listeners
    setupEventListeners();
    
    // Request notification permission
    requestNotificationPermission();
});

/**
 * Check if user is authenticated
 */
async function checkAuth() {
    try {
        const response = await apiRequest('/auth/check.php');
        
        if (!response || !response.success || !response.data.isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }
        
        currentUser = response.data.user;
        updateUserInfo(currentUser);
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'index.html';
    }
}

/**
 * Update user information in sidebar
 */
function updateUserInfo(user) {
    document.getElementById('userName').textContent = user.full_name || user.username;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userInitials').textContent = getInitials(user.full_name || user.username);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Task modal
    addTaskBtn.addEventListener('click', openCreateTaskModal);
    closeModalBtn.addEventListener('click', closeTaskModal);
    cancelBtn.addEventListener('click', closeTaskModal);
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Click outside modal to close
    taskModal.querySelector('.modal-overlay').addEventListener('click', closeTaskModal);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Sort
    sortSelect.addEventListener('change', handleSort);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            setActiveFilter(e.target);
            currentFilter = filter;
            filterAndRenderTasks();
        });
    });
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            setActiveNav(e.currentTarget);
            currentView = view;
            updatePageTitle(view);
            filterAndRenderTasks();
        });
    });
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

/**
 * Load categories from API
 */
async function loadCategories() {
    try {
        const response = await apiRequest('/categories/read.php');
        
        if (response && response.success) {
            allCategories = response.data;
            renderCategories();
            populateCategoryDropdown();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

/**
 * Render categories in sidebar
 */
function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    
    if (allCategories.length === 0) {
        categoriesList.innerHTML = '<p class="text-center" style="color: var(--text-secondary); font-size: 0.875rem;">No categories</p>';
        return;
    }
    
    categoriesList.innerHTML = allCategories.map(category => `
        <div class="category-item" data-category-id="${category.category_id}">
            <span class="category-color" style="background: ${category.category_color}"></span>
            <span class="category-name">${sanitizeHTML(category.category_name)}</span>
            <span class="category-count" id="cat-count-${category.category_id}">0</span>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const categoryId = item.dataset.categoryId;
            filterByCategory(categoryId);
        });
    });
}

/**
 * Populate category dropdown in task form
 */
function populateCategoryDropdown() {
    const select = document.getElementById('taskCategory');
    select.innerHTML = '<option value="">No Category</option>' +
        allCategories.map(cat => 
            `<option value="${cat.category_id}">${sanitizeHTML(cat.category_name)}</option>`
        ).join('');
}

/**
 * Load tasks from API
 */
async function loadTasks() {
    try {
        const response = await apiRequest('/tasks/read.php');
        
        if (response && response.success) {
            allTasks = response.data || [];
            filterAndRenderTasks();
            updateStats();
            updateCategoryCounts();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Failed to load tasks', 'error');
    }
}

/**
 * Filter and render tasks based on current filters
 */
function filterAndRenderTasks() {
    let filtered = [...allTasks];
    
    // Apply view filter
    if (currentView === 'today') {
        filtered = filtered.filter(task => isToday(task.deadline));
    } else if (currentView === 'upcoming') {
        filtered = filtered.filter(task => {
            const days = getDaysUntilDeadline(task.deadline);
            return days > 0 && days <= 7;
        });
    } else if (currentView === 'completed') {
        filtered = filtered.filter(task => task.status === 'Completed');
    }
    
    // Apply status filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(task => task.status === currentFilter);
    }
    
    // Apply search
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        filtered = filterBySearch(filtered, searchTerm);
    }
    
    // Apply sort
    filtered = sortTasks(filtered, currentSort);
    
    renderTasks(filtered);
}

/**
 * Sort tasks
 */
function sortTasks(tasks, sortType) {
    switch (sortType) {
        case 'deadline':
            return window.sortBy(tasks, 'deadline', 'asc');

        case 'priority':
            const priorityOrder = { High: 1, Medium: 2, Low: 3 };
            return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        case 'created':
            return window.sortBy(tasks, 'created_at', 'desc');

        case 'title':
            return window.sortBy(tasks, 'title', 'asc');

        default:
            return tasks;
    }
}


/**
 * Render tasks in grid
 */
function renderTasks(tasks) {
    if (tasks.length === 0) {
        tasksContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    tasksContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    tasksContainer.innerHTML = tasks.map(task => createTaskCard(task)).join('');
    
    // Add event listeners to task cards
    document.querySelectorAll('.task-card').forEach(card => {
        const taskId = card.dataset.taskId;
        const task = allTasks.find(t => t.task_id == taskId);
        
        // Edit button
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditTaskModal(task);
        });
        
        // Delete button
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteModal(taskId);
        });
        
        // Card click to view/edit
        card.addEventListener('click', () => {
            openEditTaskModal(task);
        });
    });
}

/**
 * Create task card HTML
 */
function createTaskCard(task) {
    const category = allCategories.find(c => c.category_id == task.category_id);
    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    const statusClass = task.status.toLowerCase().replace(' ', '-');
    const deadlineClass = getDeadlineBadgeClass(task.deadline);
    
    return `
        <div class="task-card ${priorityClass}" data-task-id="${task.task_id}">
            <div class="task-header">
                <h3 class="task-title">${sanitizeHTML(task.title)}</h3>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" title="Edit">✏️</button>
                    <button class="task-action-btn delete-btn delete" title="Delete">🗑️</button>
                </div>
            </div>
            
            ${task.description ? `<p class="task-description">${sanitizeHTML(task.description)}</p>` : ''}
            
            <div class="task-meta">
                <span class="task-badge status ${statusClass}">${task.status}</span>
                <span class="task-badge" style="background: ${getPriorityColor(task.priority)}20; color: ${getPriorityColor(task.priority)}">
                    ${task.priority} Priority
                </span>
                ${category ? `<span class="task-badge category">${sanitizeHTML(category.category_name)}</span>` : ''}
                ${task.deadline ? `<span class="task-badge ${deadlineClass}">📅 ${getDeadlineText(task.deadline)}</span>` : ''}
            </div>
        </div>
    `;
}

/**
 * Update statistics
 */
function updateStats() {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'Pending').length;
    const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;
    const today = allTasks.filter(t => isToday(t.deadline)).length;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statInProgress').textContent = inProgress;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('todayCount').textContent = today;
}

/**
 * Update category counts
 */
function updateCategoryCounts() {
    allCategories.forEach(category => {
        const count = allTasks.filter(t => t.category_id == category.category_id).length;
        const countElement = document.getElementById(`cat-count-${category.category_id}`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

/**
 * Open create task modal
 */
function openCreateTaskModal() {
    editingTaskId = null;
    document.getElementById('modalTitle').textContent = 'Create New Task';
    document.getElementById('taskId').value = '';
    taskForm.reset();
    
    // Set default deadline to today
    document.getElementById('taskDeadline').value = getCurrentDate();
    
    taskModal.classList.remove('hidden');
}

/**
 * Open edit task modal
 */
function openEditTaskModal(task) {
    editingTaskId = task.task_id;
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.task_id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskCategory').value = task.category_id || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskDeadline').value = formatDateForInput(task.deadline);
    
    taskModal.classList.remove('hidden');
}

/**
 * Close task modal
 */
function closeTaskModal() {
    taskModal.classList.add('hidden');
    taskForm.reset();
    editingTaskId = null;
    document.getElementById('taskError').classList.remove('show');
}

/**
 * Handle task form submission
 */
async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category_id: formData.get('category_id') || null,
        priority: formData.get('priority'),
        status: formData.get('status'),
        deadline: formData.get('deadline') || null
    };
    
    // Validate
    if (!taskData.title.trim()) {
        showError('taskError', 'Task title is required');
        return;
    }
    
    try {
        let response;
        
        if (editingTaskId) {
            // Update existing task
            taskData.task_id = editingTaskId;
            response = await apiRequest('/tasks/update.php', 'POST', taskData);
        } else {
            // Create new task
            response = await apiRequest('/tasks/create.php', 'POST', taskData);
        }
        
        if (response && response.success) {
    showToast(editingTaskId ? 'Task updated successfully' : 'Task created successfully', 'success');
    closeTaskModal();
    await loadTasks();

    // 🔔 Trigger notification checker immediately
    if (window.taskNotifications) {
        window.taskNotifications.manualCheck();
    }
}

        else {
            showError('taskError', response.message || 'Failed to save task');
        }
    } catch (error) {
        console.error('Error saving task:', error);
        showError('taskError', 'Network error. Please try again.');
    }
}

/**
 * Show error in form
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

/**
 * Open delete confirmation modal
 */
function openDeleteModal(taskId) {
    editingTaskId = taskId;
    deleteModal.classList.remove('hidden');
    
    document.getElementById('confirmDeleteBtn').onclick = async () => {
        await deleteTask(taskId);
        closeDeleteModal();
    };
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    editingTaskId = null;
}

/**
 * Delete task
 */
async function deleteTask(taskId) {
    try {
        const response = await apiRequest('/tasks/delete.php', 'POST', { task_id: taskId });
        
        if (response && response.success) {
            showToast('Task deleted successfully', 'success');
            await loadTasks();
        } else {
            showToast(response.message || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

/**
 * Handle search input
 */
function handleSearch() {
    filterAndRenderTasks();
}

/**
 * Handle sort change
 */
function handleSort(e) {
    currentSort = e.target.value;
    filterAndRenderTasks();
}

/**
 * Set active filter button
 */
function setActiveFilter(button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

/**
 * Set active navigation item
 */
function setActiveNav(item) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
}

/**
 * Update page title
 */
function updatePageTitle(view) {
    const titles = {
        'all': 'Dashboard',
        'today': 'Today\'s Tasks',
        'upcoming': 'Upcoming Tasks',
        'completed': 'Completed Tasks'
    };
    document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';
}

/**
 * Filter by category
 */
function filterByCategory(categoryId) {
    filterTasksByCategory(categoryId);
}


/**
 * Handle logout
 */
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
        const response = await apiRequest('/auth/logout.php', 'POST');
        
        if (response && response.success) {
            window.location.href = 'index.html';
        } else {
            showToast('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

/**
 * Request notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Show browser notification
 */
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico'
        });
    }
}
