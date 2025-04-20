/**
 * MOOK Robotics Hub - News Page JavaScript
 * 
 * This file handles the news page functionality,
 * including filtering articles by category and search.
 */

import { NEWS_DATA } from './data.js';

document.addEventListener('DOMContentLoaded', function() {
    initCategoryFilters();
    initNewsSearch();
    initNewsletterForm();
});

/**
 * Initialize category filter buttons
 */
function initCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get category
                const category = this.dataset.category;
                
                // Filter articles
                filterArticles(category);
            });
        });
    }
}

/**
 * Initialize news search functionality
 */
function initNewsSearch() {
    const searchInput = document.getElementById('news-search-input');
    const searchButton = document.getElementById('news-search-btn');
    
    if (searchInput && searchButton) {
        // Search button click
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (searchTerm) {
                searchArticles(searchTerm);
            }
        });
        
        // Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm) {
                    searchArticles(searchTerm);
                }
            }
        });
    }
}

/**
 * Initialize newsletter subscription form
 */
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value.trim();
            
            if (isValidEmail(email)) {
                // In a real application, this would send the email to a server
                // For demo purposes, we'll just show a success message
                
                // Store subscription in localStorage
                const subscriptions = JSON.parse(localStorage.getItem('mookRoboticsSubscriptions') || '[]');
                
                // Check if already subscribed
                if (!subscriptions.includes(email)) {
                    subscriptions.push(email);
                    localStorage.setItem('mookRoboticsSubscriptions', JSON.stringify(subscriptions));
                }
                
                // Show success message
                alert('Thank you for subscribing to our newsletter!');
                
                // Reset form
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

/**
 * Filter articles by category
 * @param {string} category - Category to filter by
 */
function filterArticles(category) {
    const newsCards = document.querySelectorAll('.news-card');
    
    if (newsCards.length > 0) {
        // Show/hide cards based on category
        newsCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                
                // Add animation
                card.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Check if no results
        const visibleCards = document.querySelectorAll('.news-card[style="display: block"]');
        if (visibleCards.length === 0) {
            showNoResults();
        } else {
            hideNoResults();
        }
    }
}

/**
 * Search articles by term
 * @param {string} searchTerm - Term to search for
 */
function searchArticles(searchTerm) {
    const newsCards = document.querySelectorAll('.news-card');
    const featuredArticle = document.querySelector('.featured-article');
    
    // Reset category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
    
    let matchFound = false;
    
    // Search in featured article
    if (featuredArticle) {
        const featuredTitle = featuredArticle.querySelector('h2').textContent.toLowerCase();
        const featuredExcerpt = featuredArticle.querySelector('.article-excerpt').textContent.toLowerCase();
        
        if (featuredTitle.includes(searchTerm) || featuredExcerpt.includes(searchTerm)) {
            featuredArticle.style.display = 'flex';
            matchFound = true;
        } else {
            featuredArticle.style.display = 'none';
        }
    }
    
    // Search in news cards
    if (newsCards.length > 0) {
        newsCards.forEach(card => {
            const title = card.querySelector('.news-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.news-card-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.style.display = 'block';
                
                // Add animation
                card.style.animation = 'fadeIn 0.5s ease forwards';
                
                matchFound = true;
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Show no results message if no matches
    if (!matchFound) {
        showNoResults();
    } else {
        hideNoResults();
    }
}

/**
 * Show no results message
 */
function showNoResults() {
    let noResultsElement = document.querySelector('.no-results');
    
    if (!noResultsElement) {
        const newsContainer = document.getElementById('news-container');
        
        if (newsContainer) {
            // Create no results message
            noResultsElement = document.createElement('div');
            noResultsElement.className = 'no-results';
            noResultsElement.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No articles found matching your search.</p>
                <button id="reset-search" class="btn btn-primary">Reset Search</button>
            `;
            
            // Insert before news container
            newsContainer.parentNode.insertBefore(noResultsElement, newsContainer);
            
            // Add reset button functionality
            const resetButton = noResultsElement.querySelector('#reset-search');
            if (resetButton) {
                resetButton.addEventListener('click', resetSearch);
            }
        }
    } else {
        noResultsElement.style.display = 'block';
    }
}

/**
 * Hide no results message
 */
function hideNoResults() {
    const noResultsElement = document.querySelector('.no-results');
    
    if (noResultsElement) {
        noResultsElement.style.display = 'none';
    }
}

/**
 * Reset search and filters
 */
function resetSearch() {
    // Clear search input
    const searchInput = document.getElementById('news-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
    
    // Show all articles
    const featuredArticle = document.querySelector('.featured-article');
    if (featuredArticle) {
        featuredArticle.style.display = 'flex';
    }
    
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.style.display = 'block';
        
        // Add animation
        card.style.animation = 'fadeIn 0.5s ease forwards';
    });
    
    // Hide no results message
    hideNoResults();
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}
