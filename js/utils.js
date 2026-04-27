/**
 * Utility Functions for Frontend
 * Reusable helper functions
 */

// API Base URL
const API_URL = 'http://localhost/task-management-system/api';

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: success, error, info
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set message and type
    toastMessage.textContent = message;
    toast.className = 'toast';
    if (type) { 
        toast.classList.add(type);
    }
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

/**
 * Format date to readable format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Get days until deadline
 * @param {string} deadline - Deadline date
 * @returns {number} Days until deadline
 */
function getDaysUntilDeadline(deadline) {
    if (!deadline) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Get deadline badge class
 * @param {string} deadline - Deadline date
 * @returns {string} Badge class
 */
function getDeadlineBadgeClass(deadline) {
    const days = getDaysUntilDeadline(deadline);
    if (days === null) return '';
    if (days < 0) return 'deadline'; // Overdue
    if (days <= 3) return 'deadline'; // Due soon
    if (days <= 7) return 'upcoming'; // Upcoming
    return 'safe'; // Plenty of time
}

/**
 * Get deadline text
 * @param {string} deadline - Deadline date
 * @returns {string} Deadline text
 */
function getDeadlineText(deadline) {
    if (!deadline) return 'No deadline';
    
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
}

/**
 * Get user initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
    if (!name) return 'U';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeHTML(text) {
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request data
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, method = "GET", data = null) {
    const url = `${API_URL}${endpoint}`;

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    };

    if (data && method !== "GET") {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            console.error("HTTP Error:", response.status, response.statusText);
            return { success: false, message: `HTTP Error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error("API Request Error:", error);
        return { success: false, message: "Network error" };
    }
}


/**
 * Confirm action
 * @param {string} message - Confirmation message
 * @returns {boolean} User confirmation
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if date is today
 * @param {string} dateString - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
}

/**
 * Check if date is in the past
 * @param {string} dateString - Date to check
 * @returns {boolean} True if date is in the past
 */
function isPastDate(dateString) {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Sort array by property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} order - Order: asc or desc
 * @returns {Array} Sorted array
 */
function sortBy(array, property, order = 'asc') {
    return array.sort((a, b) => {
        let aVal = a[property];
        let bVal = b[property];
        
        // Handle null/undefined
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        // Compare
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered array
 */
function filterBySearch(array, searchTerm, searchFields = ['title', 'description']) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

/**
 * Get priority color
 * @param {string} priority - Priority level
 * @returns {string} Color hex code
 */
function getPriorityColor(priority) {
    const colors = {
        'Low': '#10B981',
        'Medium': '#F59E0B',
        'High': '#EF4444'
    };
    return colors[priority] || '#6B7280';
}

/**
 * Get status color
 * @param {string} status - Task status
 * @returns {string} Color hex code
 */
function getStatusColor(status) {
    const colors = {
        'Pending': '#6B7280',
        'In Progress': '#F59E0B',
        'Completed': '#10B981'
    };
    return colors[status] || '#6B7280';
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Capitalize first letter
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
