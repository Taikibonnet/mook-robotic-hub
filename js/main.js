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

// Initialize the application
async function initializeApp() {
    try {
        // Set up theme
        initializeTheme();
        
        // Load featured robots and recent news on homepage
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            await Promise.all([
                loadFeaturedRobots(),
                loadRecentNews()
            ]);
        }
    } catch (error) {
        console.error("Error initializing app:", error);
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