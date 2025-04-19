// Main JavaScript for MOOK Robotics Hub
// This file handles common functionality across the site

import { robotService, newsService, authService } from './static-services.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResultsContainer = document.getElementById('search-results');
const featuredRobotsContainer = document.querySelector('.robot-cards');
const newsContainer = document.querySelector('.news-container');
const themeToggle = document.getElementById('theme-toggle');
const newsletterForm = document.getElementById('newsletter-form');
const userDisplay = document.getElementById('user-display');
const adminLink = document.getElementById('admin-link');
const profileLink = document.getElementById('profile-link');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginLink = document.getElementById('login-link');
const signupLink = document.getElementById('signup-link');

// Theme handling
function initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Search functionality
async function handleSearch() {
    if (!searchInput || !searchResultsContainer) return;
    
    const query = searchInput.value.trim();
    
    if (!query) {
        hideSearchResults();
        return;
    }
    
    try {
        // Search for robots
        const robotResults = await robotService.searchRobots(query);
        
        // If we have a search results container, display the results
        if (searchResultsContainer) {
            if (robotResults.length > 0) {
                displaySearchResults(robotResults);
            } else {
                searchResultsContainer.innerHTML = '<p class="no-results">No robots found matching your search.</p>';
                searchResultsContainer.style.display = 'block';
            }
        } else {
            // If we don't have a results container, redirect to search page with query parameter
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    } catch (error) {
        console.error("Search error:", error);
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = '<p class="error">An error occurred while searching. Please try again.</p>';
            searchResultsContainer.style.display = 'block';
        }
    }
}

function displaySearchResults(results) {
    if (!searchResultsContainer) return;
    
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.classList.add('search-results-list');
    
    // Add each result
    results.forEach(robot => {
        const resultItem = document.createElement('li');
        resultItem.innerHTML = `
            <a href="robots/${robot.slug}.html" class="search-result-item">
                <div class="result-image">
                    ${robot.mainImage 
                        ? `<img src="${robot.mainImage}" alt="${robot.name}">`
                        : '<div class="placeholder"></div>'
                    }
                </div>
                <div class="result-content">
                    <h3>${robot.name}</h3>
                    <p>${robot.description}</p>
                </div>
            </a>
        `;
        resultsList.appendChild(resultItem);
    });
    
    // Add results to container
    searchResultsContainer.appendChild(resultsList);
    searchResultsContainer.style.display = 'block';
}

function hideSearchResults() {
    if (searchResultsContainer) {
        searchResultsContainer.style.display = 'none';
    }
}

// Handle click outside search results to hide them
document.addEventListener('click', (e) => {
    if (searchResultsContainer && 
        e.target !== searchResultsContainer && 
        !searchResultsContainer.contains(e.target) && 
        e.target !== searchInput &&
        e.target !== searchBtn) {
        hideSearchResults();
    }
});

// Load featured robots on homepage
async function loadFeaturedRobots() {
    if (!featuredRobotsContainer) return;
    
    try {
        const featuredRobots = await robotService.getFeaturedRobots(3);
        
        // Clear container
        featuredRobotsContainer.innerHTML = '';
        
        // Add each featured robot
        featuredRobots.forEach(robot => {
            const robotCard = document.createElement('div');
            robotCard.classList.add('robot-card');
            
            robotCard.innerHTML = `
                <div class="robot-image">
                    ${robot.mainImage 
                        ? `<img src="${robot.mainImage}" alt="${robot.name}">`
                        : '<div class="placeholder"></div>'
                    }
                </div>
                <h3>${robot.name}</h3>
                <p>${robot.description}</p>
                <a href="robots/${robot.slug}.html" class="btn btn-secondary">Learn More</a>
            `;
            
            featuredRobotsContainer.appendChild(robotCard);
        });
    } catch (error) {
        console.error("Error loading featured robots:", error);
        featuredRobotsContainer.innerHTML = '<p class="error">Error loading featured robots. Please try again later.</p>';
    }
}

// Load recent news on homepage
async function loadRecentNews() {
    if (!newsContainer) return;
    
    try {
        const recentNews = await newsService.getRecentNews(3);
        
        // Clear container
        newsContainer.innerHTML = '';
        
        // Add each recent news article
        recentNews.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');
            
            // Format date
            const date = new Date(article.publishDate);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            newsCard.innerHTML = `
                <div class="news-image">
                    ${article.image 
                        ? `<img src="${article.image}" alt="${article.title}">`
                        : '<div class="placeholder"></div>'
                    }
                </div>
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p class="news-date">${formattedDate}</p>
                    <p>${article.content.substring(0, 100).replace(/<[^>]*>/g, '')}...</p>
                    <a href="news/${article.slug}.html" class="read-more">Read More</a>
                </div>
            `;
            
            newsContainer.appendChild(newsCard);
        });
    } catch (error) {
        console.error("Error loading recent news:", error);
        newsContainer.innerHTML = '<p class="error">Error loading recent news. Please try again later.</p>';
    }
}

// Newsletter signup
function handleNewsletterSignup(e) {
    if (!newsletterForm) return;
    
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNewsletterMessage("Please enter your email address.", "error");
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNewsletterMessage("Please enter a valid email address.", "error");
        return;
    }
    
    // In a real implementation, this would send the email to a server
    // For now, we'll just show a success message
    showNewsletterMessage("Thank you for subscribing to our newsletter!", "success");
    emailInput.value = '';
}

function showNewsletterMessage(message, type = 'info') {
    if (!newsletterForm) return;
    
    // Remove existing message
    const existingMessage = newsletterForm.querySelector('.newsletter-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('p');
    messageElement.classList.add('newsletter-message', type);
    messageElement.textContent = message;
    
    // Add message to form
    newsletterForm.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.classList.add('fade-out');
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 5000);
}

// Update UI based on authentication state
function updateAuthUI(user) {
    if (user) {
        // User is logged in
        if (loginBtn && signupBtn) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
        }
        
        if (userDisplay) {
            userDisplay.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <button id="logout-btn" class="btn btn-secondary">Logout</button>
                </div>
            `;
            
            // Add logout event listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
        
        // Show/hide admin and profile links
        if (profileLink) {
            profileLink.style.display = 'block';
        }
        
        if (adminLink) {
            adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
        }
    } else {
        // User is logged out
        if (loginBtn && signupBtn) {
            loginBtn.style.display = 'block';
            signupBtn.style.display = 'block';
        }
        
        if (userDisplay) {
            userDisplay.innerHTML = `
                <button id="login-btn" class="btn btn-primary">Login</button>
                <button id="signup-btn" class="btn btn-outline">Sign Up</button>
            `;
            
            // Re-add event listeners for these new buttons
            const newLoginBtn = document.getElementById('login-btn');
            const newSignupBtn = document.getElementById('signup-btn');
            
            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', () => showModal('login-modal'));
            }
            
            if (newSignupBtn) {
                newSignupBtn.addEventListener('click', () => showModal('signup-modal'));
            }
        }
        
        // Hide admin and profile links
        if (profileLink) {
            profileLink.style.display = 'none';
        }
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }
}

// Handle logout
async function handleLogout() {
    try {
        await authService.logout();
        updateAuthUI(null);
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// Modal handling
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorElement = document.getElementById('login-error') || document.createElement('p');
    
    if (!document.getElementById('login-error')) {
        errorElement.id = 'login-error';
        errorElement.classList.add('error-message');
        document.getElementById('login-form').insertBefore(errorElement, document.querySelector('.form-footer'));
    }
    
    try {
        const user = await authService.login(emailInput.value, passwordInput.value);
        hideModal('login-modal');
        updateAuthUI(user);
        errorElement.textContent = '';
    } catch (error) {
        console.error("Login error:", error);
        errorElement.textContent = error.message;
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const errorElement = document.getElementById('signup-error') || document.createElement('p');
    
    if (!document.getElementById('signup-error')) {
        errorElement.id = 'signup-error';
        errorElement.classList.add('error-message');
        document.getElementById('signup-form').insertBefore(errorElement, document.querySelector('.form-footer'));
    }
    
    // Validate password match
    if (passwordInput.value !== confirmPasswordInput.value) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }
    
    try {
        const user = await authService.register(nameInput.value, emailInput.value, passwordInput.value);
        hideModal('signup-modal');
        updateAuthUI(user);
        errorElement.textContent = '';
    } catch (error) {
        console.error("Signup error:", error);
        errorElement.textContent = error.message;
    }
}

// Initialize the application
async function initializeApp() {
    try {
        // Set up theme
        initializeTheme();
        
        // Initialize auth
        const user = authService.init();
        updateAuthUI(user);
        
        // Load featured robots and recent news on homepage
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            await Promise.all([
                loadFeaturedRobots(),
                loadRecentNews()
            ]);
        }
        
        // Set up modals
        setupModals();
        
        // Set up auth forms
        setupAuthForms();
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

// Set up modal functionality
function setupModals() {
    // Login/Signup buttons
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showModal('login-modal'));
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => showModal('signup-modal'));
    }
    
    // Footer login/signup links
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('login-modal');
        });
    }
    
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('signup-modal');
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        const modal = btn.closest('.modal');
        if (modal) {
            btn.addEventListener('click', () => {
                hideModal(modal.id);
            });
        }
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Switch between login and signup
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('login-modal');
            showModal('signup-modal');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('signup-modal');
            showModal('login-modal');
        });
    }
}

// Set up authentication forms
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app
    initializeApp();
    
    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // Show results when input receives focus and has value
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                handleSearch();
            }
        });
    }
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
    
    // Newsletter signup
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }
});

// Expose functions for use in HTML event attributes if needed
window.handleSearch = handleSearch;
window.toggleTheme = toggleTheme;
window.showModal = showModal;