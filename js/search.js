// Search JavaScript for MOOK Robotics Hub
// This file handles the search functionality for robots and news

import { robotService } from './static-services.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResultsContainer = document.getElementById('search-results');
const noResultsContainer = document.getElementById('no-results');
const categoryFilter = document.getElementById('filter-category');
const sortBySelect = document.getElementById('sort-by');
const paginationContainer = document.getElementById('pagination');

// Current search state
let currentSearchResults = [];
let currentCategory = 'all';
let currentSortBy = 'relevance';
let currentPage = 1;
const itemsPerPage = 9;

// Initialize the search page
function initializeSearchPage() {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query && searchInput) {
        // Set search input value
        searchInput.value = query;
    }
    
    // Perform search with query or get all robots if no query
    performSearch(query || '');
}

// Perform search
async function performSearch(query) {
    try {
        // Show loading spinner
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Searching...</span>
                </div>
            `;
        }
        
        // Hide no results message
        if (noResultsContainer) {
            noResultsContainer.style.display = 'none';
        }
        
        // Search for robots
        const robotResults = await robotService.searchRobots(query);
        
        // Store results for filtering and sorting
        currentSearchResults = robotResults;
        
        // Apply filters and sorting
        const filteredResults = filterResults(robotResults, currentCategory);
        const sortedResults = sortResults(filteredResults, currentSortBy);
        
        // Display results with pagination
        displayResults(sortedResults);
    } catch (error) {
        console.error("Search error:", error);
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>An error occurred while searching. Please try again.</p>
                </div>
            `;
        }
    }
}

// Filter results by category
function filterResults(results, category) {
    if (category === 'all') {
        return results;
    }
    
    return results.filter(robot => 
        robot.category && robot.category.toLowerCase() === category.toLowerCase()
    );
}

// Sort results
function sortResults(results, sortBy) {
    switch (sortBy) {
        case 'name-asc':
            return [...results].sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return [...results].sort((a, b) => b.name.localeCompare(a.name));
        case 'year-desc':
            return [...results].sort((a, b) => {
                const yearA = a.year || 0;
                const yearB = b.year || 0;
                return yearB - yearA;
            });
        case 'year-asc':
            return [...results].sort((a, b) => {
                const yearA = a.year || 0;
                const yearB = b.year || 0;
                return yearA - yearB;
            });
        case 'relevance':
        default:
            // Return as is for relevance sort
            return results;
    }
}

// Display search results with pagination
function displayResults(results) {
    if (!searchResultsContainer) return;
    
    // Calculate pagination
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, results.length);
    const currentPageResults = results.slice(startIndex, endIndex);
    
    // Check if we have results
    if (results.length === 0) {
        // Show no results message
        if (noResultsContainer) {
            noResultsContainer.style.display = 'block';
        }
        
        // Clear results container
        searchResultsContainer.innerHTML = '';
        
        // Hide pagination
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        return;
    }
    
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    // Create grid for results
    const resultsGrid = document.createElement('div');
    resultsGrid.classList.add('results-grid');
    
    // Add each result to grid
    currentPageResults.forEach(robot => {
        const resultCard = document.createElement('div');
        resultCard.classList.add('result-card');
        
        // Format year
        const yearDisplay = robot.year ? `<span class="robot-year">(${robot.year})</span>` : '';
        
        resultCard.innerHTML = `
            <div class="result-image">
                ${robot.mainImage 
                    ? `<img src="${robot.mainImage}" alt="${robot.name}">`
                    : '<div class="placeholder"></div>'
                }
            </div>
            <div class="result-content">
                <h3>${robot.name} ${yearDisplay}</h3>
                <p class="result-manufacturer">${robot.manufacturer || 'Unknown Manufacturer'}</p>
                <p class="result-category">${robot.category || 'Uncategorized'}</p>
                <p class="result-description">${robot.description}</p>
                <a href="robots/${robot.slug}.html" class="btn btn-secondary">View Details</a>
            </div>
        `;
        
        resultsGrid.appendChild(resultCard);
    });
    
    // Add grid to container
    searchResultsContainer.appendChild(resultsGrid);
    
    // Generate pagination if needed
    if (paginationContainer && totalPages > 1) {
        generatePagination(totalPages);
    } else if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}

// Generate pagination controls
function generatePagination(totalPages) {
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Previous page button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('pagination-btn', 'prev');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
            // Scroll to top of results
            searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Page numbers
    const pageNumbers = document.createElement('div');
    pageNumbers.classList.add('page-numbers');
    
    // Determine which page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // First page button if not showing page 1
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.classList.add('pagination-num');
        firstPageBtn.textContent = '1';
        firstPageBtn.addEventListener('click', () => {
            currentPage = 1;
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
            searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        });
        pageNumbers.appendChild(firstPageBtn);
        
        // Add ellipsis if there's a gap
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination-ellipsis');
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('pagination-num');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
            searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        });
        pageNumbers.appendChild(pageBtn);
    }
    
    // Last page button if not showing last page
    if (endPage < totalPages) {
        // Add ellipsis if there's a gap
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination-ellipsis');
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.classList.add('pagination-num');
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener('click', () => {
            currentPage = totalPages;
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
            searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        });
        pageNumbers.appendChild(lastPageBtn);
    }
    
    // Next page button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('pagination-btn', 'next');
    nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
            searchResultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Add all elements to pagination container
    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageNumbers);
    paginationContainer.appendChild(nextBtn);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize search page
    initializeSearchPage();
    
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            // Update URL with search query
            const url = new URL(window.location);
            url.searchParams.set('q', query);
            window.history.pushState({}, '', url);
            
            // Reset pagination
            currentPage = 1;
            
            // Perform search
            performSearch(query);
        });
    }
    
    // Search input enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                // Update URL with search query
                const url = new URL(window.location);
                url.searchParams.set('q', query);
                window.history.pushState({}, '', url);
                
                // Reset pagination
                currentPage = 1;
                
                // Perform search
                performSearch(query);
            }
        });
    }
    
    // Category filter change
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentCategory = categoryFilter.value;
            // Reset pagination
            currentPage = 1;
            
            // Apply filter and display results
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
        });
    }
    
    // Sort by change
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            currentSortBy = sortBySelect.value;
            // Reset pagination
            currentPage = 1;
            
            // Apply sorting and display results
            const filteredResults = filterResults(currentSearchResults, currentCategory);
            const sortedResults = sortResults(filteredResults, currentSortBy);
            displayResults(sortedResults);
        });
    }
});