/**
 * MOOK Robotics Hub - Authentication System
 * 
 * This file contains functions related to user authentication,
 * including login, signup, and session management.
 * 
 * Note: In a production environment, authentication would be handled
 * by a backend server with proper security measures.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication components
    initAuthForms();
    checkLoggedInStatus();
});

/**
 * Initialize authentication forms
 */
function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Admin login check
            if (email === 'tgen.robotics@gmail.com' && password === 'Admin123!') {
                // Store admin status
                localStorage.setItem('mookRoboticsUser', JSON.stringify({
                    email: email,
                    name: 'Administrator',
                    isAdmin: true,
                    lastLogin: new Date().toISOString()
                }));
                
                // Redirect to admin dashboard
                showMessage('Login successful! Redirecting to admin dashboard...');
                setTimeout(() => {
                    window.location.href = 'admin/dashboard.html';
                }, 1500);
            } else {
                // Regular user login (demo implementation)
                attemptLogin(email, password);
            }
        });
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            // Validation
            if (password !== confirmPassword) {
                showError('Passwords do not match!');
                return;
            }
            
            // Create user account (demo implementation)
            createAccount(name, email, password);
        });
    }
}

/**
 * Attempt to log in a user
 * @param {string} email - User email
 * @param {string} password - User password
 */
function attemptLogin(email, password) {
    // In a real application, this would make an API call to a server
    // For demo purposes, we'll use localStorage to simulate users
    
    const users = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user && user.password === password) { // Note: In real apps, never store passwords in plain text
        // Store logged in user info (excluding password)
        const { password, ...userInfo } = user;
        userInfo.lastLogin = new Date().toISOString();
        
        localStorage.setItem('mookRoboticsUser', JSON.stringify(userInfo));
        
        // Show success message and redirect
        showMessage('Login successful!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        // Show error message
        showError('Invalid email or password. Please try again.');
    }
}

/**
 * Create a new user account
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
function createAccount(name, email, password) {
    // In a real application, this would make an API call to a server
    // For demo purposes, we'll use localStorage to simulate users
    
    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        showError('An account with this email already exists.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateUserId(),
        name: name,
        email: email,
        password: password, // Note: In real apps, never store passwords in plain text
        isAdmin: false,
        dateCreated: new Date().toISOString()
    };
    
    // Add user to the array
    users.push(newUser);
    
    // Save updated users array
    localStorage.setItem('mookRoboticsUsers', JSON.stringify(users));
    
    // Show success message
    showMessage('Account created successfully! You can now log in.');
    
    // Switch to login modal after a delay
    setTimeout(() => {
        const signupModal = document.getElementById('signup-modal');
        const loginModal = document.getElementById('login-modal');
        
        if (signupModal && loginModal) {
            closeModal(signupModal);
            openModal(loginModal);
        }
    }, 1500);
}

/**
 * Generate a random user ID
 * @returns {string} A unique user ID
 */
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Check if user is logged in and update UI accordingly
 */
function checkLoggedInStatus() {
    const user = JSON.parse(localStorage.getItem('mookRoboticsUser'));
    const navAuth = document.querySelector('.nav-auth');
    
    if (user && navAuth) {
        // User is logged in, update the navigation
        navAuth.innerHTML = `
            <div class="user-menu">
                <span class="user-name">Hello, ${user.name}</span>
                <div class="user-dropdown">
                    <a href="${user.isAdmin ? 'admin/dashboard.html' : '#my-account'}">
                        ${user.isAdmin ? 'Admin Dashboard' : 'My Account'}
                    </a>
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>
        `;
        
        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * Log out the current user
 */
function logout() {
    // Remove user from localStorage
    localStorage.removeItem('mookRoboticsUser');
    
    // Show message and refresh page
    showMessage('You have been logged out successfully.');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

/**
 * Display an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    // This is a simple implementation - in a real app, use a toast or notification system
    alert('Error: ' + message);
}

/**
 * Display a success message
 * @param {string} message - The success message to display
 */
function showMessage(message) {
    // This is a simple implementation - in a real app, use a toast or notification system
    alert(message);
}

/**
 * Check if current user is an admin
 * @returns {boolean} True if user is admin, false otherwise
 */
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('mookRoboticsUser'));
    return user && user.isAdmin === true;
}

/**
 * Protect admin pages from unauthorized access
 */
function protectAdminPage() {
    // Check if page URL contains '/admin/'
    if (window.location.href.includes('/admin/')) {
        if (!isAdmin()) {
            // Redirect to home page if not admin
            alert('Access denied. Administrator privileges required.');
            window.location.href = '../index.html';
        }
    }
}

// Run protection on admin pages
if (window.location.href.includes('/admin/')) {
    protectAdminPage();
}
