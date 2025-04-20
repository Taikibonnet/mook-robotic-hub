/**
 * MOOK Robotics Hub - News List JavaScript
 * 
 * This file handles the news listing page functionality,
 * including loading news articles, filtering, and pagination.
 */

import { getAllNews } from './news-service.js';

// Constants
const NEWS_PER_PAGE = 9;

// State
let currentPage = 1;
let filteredNews = [];
let allNews = [];

// Document is ready
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    initFilters();
    initSearch();
    initPagination();
});

/**
 * Load news articles from data source
 */
async function loadNews() {
    // Get news
    allNews = getAllNews();
    
    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    
    // Apply initial filters
    filterNews();
    
    // Render the first page
    renderNewsPage(1);
}

/**
 * Initialize filter functionality
 */
function initFilters() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterNews();
            renderNewsPage(1);
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset filter dropdowns
            document.getElementById('filter-category').value = '';
            document.getElementById('filter-date').value = '';
            
            // Reset filters and render
            filterNews();
            renderNewsPage(1);
        });
    }
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('news-search-input');
    const searchBtn = document.getElementById('news-search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            // Apply search filter
            const searchTerm = searchInput.value.toLowerCase().trim();
            filterNews(searchTerm);
            renderNewsPage(1);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // Apply search filter
                const searchTerm = searchInput.value.toLowerCase().trim();
                filterNews(searchTerm);
                renderNewsPage(1);
            }
        });
    }
}

/**
 * Initialize pagination controls
 */
function initPagination() {
    const prevPageBtn = document.querySelector('.prev-page');
    const nextPageBtn = document.querySelector('.next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                renderNewsPage(currentPage - 1);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE);
            if (currentPage < totalPages) {
                renderNewsPage(currentPage + 1);
            }
        });
    }
}

/**
 * Filter news articles based on criteria
 * @param {string} [searchTerm=''] - Optional search term
 */
function filterNews(searchTerm = '') {
    // Get filter values
    const categoryFilter = document.getElementById('filter-category').value;
    const dateFilter = document.getElementById('filter-date').value;
    
    // Filter news
    filteredNews = allNews.filter(article => {
        // Apply category filter
        if (categoryFilter && article.category !== categoryFilter) {
            return false;
        }
        
        // Apply date filter
        if (dateFilter) {
            const articleDate = new Date(article.publishDate);
            const now = new Date();
            
            if (dateFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                if (articleDate < weekAgo) {
                    return false;
                }
            } else if (dateFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                if (articleDate < monthAgo) {
                    return false;
                }
            } else if (dateFilter === 'year') {
                const yearAgo = new Date();
                yearAgo.setFullYear(now.getFullYear() - 1);
                if (articleDate < yearAgo) {
                    return false;
                }
            }
        }
        
        // Apply search term
        if (searchTerm) {
            const searchString = `${article.title} ${article.author || ''} ${article.content || ''} ${article.summary || ''} ${article.category || ''}`.toLowerCase();
            if (!searchString.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update pagination
    updatePagination();
}

/**
 * Update pagination controls based on filtered news
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE);
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    
    if (currentPageElement) currentPageElement.textContent = currentPage;
    if (totalPagesElement) totalPagesElement.textContent = totalPages;
    
    // Update button states
    const prevPageBtn = document.querySelector('.prev-page');
    const nextPageBtn = document.querySelector('.next-page');
    
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
}

/**
 * Render a page of news articles
 * @param {number} page - Page number to render
 */
function renderNewsPage(page) {
    // Update current page
    currentPage = page;
    
    // Update pagination
    updatePagination();
    
    // Get news for this page
    const startIndex = (page - 1) * NEWS_PER_PAGE;
    const pageNews = filteredNews.slice(startIndex, startIndex + NEWS_PER_PAGE);
    
    // Get the container
    const newsContainer = document.getElementById('news-container');
    
    if (!newsContainer) return;
    
    // Show loading
    newsContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading news articles...</p>
        </div>
    `;
    
    // Clear the container after a short delay to show loading
    setTimeout(() => {
        newsContainer.innerHTML = '';
        
        // If no news, show message
        if (pageNews.length === 0) {
            newsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-newspaper"></i>
                    <p>No news articles found</p>
                    <button id="reset-search" class="btn btn-primary">Reset Filters</button>
                </div>
            `;
            
            const resetSearchBtn = document.getElementById('reset-search');
            if (resetSearchBtn) {
                resetSearchBtn.addEventListener('click', function() {
                    // Reset filters
                    document.getElementById('filter-category').value = '';
                    document.getElementById('filter-date').value = '';
                    document.getElementById('news-search-input').value = '';
                    
                    // Reset and render
                    filterNews();
                    renderNewsPage(1);
                });
            }
            
            return;
        }
        
        // Get template
        const template = document.getElementById('news-card-template');
        
        // Create a fragment to avoid reflows
        const fragment = document.createDocumentFragment();
        
        // Add news cards
        for (const article of pageNews) {
            // Clone template
            const newsCard = template.content.cloneNode(true);
            
            // Set title
            newsCard.querySelector('.news-card-title').textContent = article.title;
            
            // Set summary or content excerpt
            const summary = article.summary || (article.content ? extractExcerpt(article.content, 150) : 'No description available');
            newsCard.querySelector('.news-card-summary').textContent = summary;
            
            // Set category
            newsCard.querySelector('.news-card-category').textContent = article.category || 'Uncategorized';
            
            // Set date
            const publishDate = new Date(article.publishDate);
            const formattedDate = publishDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            newsCard.querySelector('.news-card-date').textContent = formattedDate;
            
            // Set author
            newsCard.querySelector('.news-card-author').textContent = article.author || 'MOOK Editorial Team';
            
            // Set link
            newsCard.querySelector('a').href = `news/${article.slug}.html`;
            
            // Set image (with fallback)
            const imgElement = newsCard.querySelector('img');
            imgElement.alt = article.title;
            imgElement.src = article.image || 'images/news/placeholder.jpg';
            imgElement.onerror = function() {
                this.src = 'images/news/placeholder.jpg';
            };
            
            // Add to fragment
            fragment.appendChild(newsCard);
        }
        
        // Add all cards to container
        newsContainer.appendChild(fragment);
    }, 200); // Short delay for loading effect
}

/**
 * Extract a text excerpt from HTML content
 * @param {string} html - HTML content
 * @param {number} length - Maximum length
 * @returns {string} Text excerpt
 */
function extractExcerpt(html, length = 150) {
    // Create a temporary div
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get the text content
    const text = temp.textContent || temp.innerText || '';
    
    // Trim and limit length
    return text.trim().substring(0, length) + (text.length > length ? '...' : '');
}
