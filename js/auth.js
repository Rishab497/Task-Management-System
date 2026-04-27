/**
 * Authentication JavaScript
 * Handles login, signup, and form switching
 */

// API Base URL - change if your setup is different
const API_BASE_URL = 'http://localhost/task-management-system/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const loadingOverlay = document.getElementById('loadingOverlay');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

/**
 * Initialize authentication page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Form toggle handlers
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchToSignup();
    });
    
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });
    
    // Form submission handlers
    loginFormElement.addEventListener('submit', handleLogin);
    signupFormElement.addEventListener('submit', handleSignup);
});

/**
 * Check if user is already authenticated
 * Redirect to dashboard if logged in
 */
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check.php`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.data.isLoggedIn) {
            // User is logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.log('Not logged in');
    }
}

/**
 * Switch to signup form
 */
function switchToSignup() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    clearErrors();
}

/**
 * Switch to login form
 */
function switchToLogin() {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearErrors();
}

/**
 * Clear error messages
 */
function clearErrors() {
    loginError.textContent = '';
    loginError.classList.remove('show');
    signupError.textContent = '';
    signupError.classList.remove('show');
}

/**
 * Show error message
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

/**
 * Show loading overlay
 */
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    // Get form data
    const formData = new FormData(loginFormElement);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validate inputs
    if (!email || !password) {
        showError(loginError, 'Please fill in all fields');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            // Login successful - redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            showError(loginError, data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        hideLoading();
        showError(loginError, 'Network error. Please check your connection and try again.');
        console.error('Login error:', error);
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(e) {
    e.preventDefault();
    clearErrors();
    
    // Get form data
    const formData = new FormData(signupFormElement);
    const fullName = formData.get('full_name');
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validate inputs
    if (!fullName || !username || !email || !password || !confirmPassword) {
        showError(signupError, 'Please fill in all fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(signupError, 'Please enter a valid email address');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showError(signupError, 'Password must be at least 6 characters long');
        return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        showError(signupError, 'Passwords do not match');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                full_name: fullName,
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            // Signup successful - automatically log in and redirect
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            showError(signupError, data.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        hideLoading();
        showError(signupError, 'Network error. Please check your connection and try again.');
        console.error('Signup error:', error);
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
