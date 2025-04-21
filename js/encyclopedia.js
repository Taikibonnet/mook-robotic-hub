/**
 * MOOK Robotics Hub - Encyclopedia JavaScript
 * 
 * This file handles the encyclopedia page functionality,
 * including loading robots, filtering, and pagination.
 */

import { getAllRobots } from './robot-service.js';
import { getFileUrl } from './file-upload-service.js';

// Constants
const ROBOTS_PER_PAGE = 12;

// State
let currentPage = 1;
let filteredRobots = [];
let allRobots = [];

// Document is ready
document.addEventListener('DOMContentLoaded', function() {
    loadRobots();
    initFilters();
    initSearch();
    initPagination();
});

/**
 * Load robots from data source
 */
async function loadRobots() {
    // Get robots
    allRobots = getAllRobots();
    
    // Apply initial filters
    filterRobots();
    
    // Update filter dropdowns
    updateFilterOptions();
    
    // Render the first page
    renderRobotPage(1);
}

/**
 * Initialize filter functionality
 */
function initFilters() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterRobots();
            renderRobotPage(1);
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset filter dropdowns
            document.getElementById('filter-category').value = '';
            document.getElementById('filter-manufacturer').value = '';
            document.getElementById('filter-year').value = '';
            
            // Reset filters and render
            filterRobots();
            renderRobotPage(1);
        });
    }
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('encyclopedia-search-input');
    const searchBtn = document.getElementById('encyclopedia-search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            // Apply search filter
            const searchTerm = searchInput.value.toLowerCase().trim();
            filterRobots(searchTerm);
            renderRobotPage(1);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // Apply search filter
                const searchTerm = searchInput.value.toLowerCase().trim();
                filterRobots(searchTerm);
                renderRobotPage(1);
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
                renderRobotPage(currentPage - 1);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredRobots.length / ROBOTS_PER_PAGE);
            if (currentPage < totalPages) {
                renderRobotPage(currentPage + 1);
            }
        });
    }
}

/**
 * Filter robots based on criteria
 * @param {string} [searchTerm=''] - Optional search term
 */
function filterRobots(searchTerm = '') {
    // Get filter values
    const categoryFilter = document.getElementById('filter-category').value;
    const manufacturerFilter = document.getElementById('filter-manufacturer').value;
    const yearFilter = document.getElementById('filter-year').value;
    
    // Filter robots
    filteredRobots = allRobots.filter(robot => {
        // Apply category filter
        if (categoryFilter && robot.category !== categoryFilter) {
            return false;
        }
        
        // Apply manufacturer filter
        if (manufacturerFilter && robot.manufacturer !== manufacturerFilter) {
            return false;
        }
        
        // Apply year filter
        if (yearFilter && robot.year && robot.year.toString() !== yearFilter) {
            return false;
        }
        
        // Apply search term
        if (searchTerm) {
            const searchString = `${robot.name} ${robot.manufacturer || ''} ${robot.description || ''}`.toLowerCase();
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
 * Update filter dropdowns with available options
 */
function updateFilterOptions() {
    // Get unique manufacturers
    const manufacturers = [...new Set(allRobots.map(robot => robot.manufacturer).filter(Boolean))];
    const manufacturerSelect = document.getElementById('filter-manufacturer');
    
    if (manufacturerSelect) {
        // Clear existing options (except the first)
        while (manufacturerSelect.options.length > 1) {
            manufacturerSelect.remove(1);
        }
        
        // Add manufacturer options
        manufacturers.forEach(manufacturer => {
            const option = document.createElement('option');
            option.value = manufacturer;
            option.textContent = manufacturer;
            manufacturerSelect.appendChild(option);
        });
    }
    
    // Get unique years
    const years = [...new Set(allRobots.map(robot => robot.year).filter(Boolean))];
    years.sort((a, b) => b - a); // Sort descending
    const yearSelect = document.getElementById('filter-year');
    
    if (yearSelect) {
        // Clear existing options (except the first)
        while (yearSelect.options.length > 1) {
            yearSelect.remove(1);
        }
        
        // Add year options
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }
}

/**
 * Update pagination controls based on filtered robots
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredRobots.length / ROBOTS_PER_PAGE);
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
 * Render a page of robots
 * @param {number} page - Page number to render
 */
async function renderRobotPage(page) {
    // Update current page
    currentPage = page;
    
    // Update pagination
    updatePagination();
    
    // Get robots for this page
    const startIndex = (page - 1) * ROBOTS_PER_PAGE;
    const pageRobots = filteredRobots.slice(startIndex, startIndex + ROBOTS_PER_PAGE);
    
    // Get the container
    const robotsContainer = document.getElementById('robots-container');
    
    if (!robotsContainer) return;
    
    // Show loading
    robotsContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading robots...</p>
        </div>
    `;
    
    // Clear the container after a short delay to show loading
    setTimeout(() => {
        // Clear the container
        robotsContainer.innerHTML = '';
        
        // If no robots, show message
        if (pageRobots.length === 0) {
            robotsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-robot"></i>
                    <p>No robots found</p>
                    <button id="reset-search" class="btn btn-primary">Reset Filters</button>
                </div>
            `;
            
            const resetSearchBtn = document.getElementById('reset-search');
            if (resetSearchBtn) {
                resetSearchBtn.addEventListener('click', function() {
                    // Reset filters
                    document.getElementById('filter-category').value = '';
                    document.getElementById('filter-manufacturer').value = '';
                    document.getElementById('filter-year').value = '';
                    document.getElementById('encyclopedia-search-input').value = '';
                    
                    // Reset and render
                    filterRobots();
                    renderRobotPage(1);
                });
            }
            
            return;
        }
        
        // Get template
        const template = document.getElementById('robot-card-template');
        
        // Create a fragment to avoid reflows
        const fragment = document.createDocumentFragment();
        
        // Add robot cards
        for (const robot of pageRobots) {
            // Clone template
            const robotCard = template.content.cloneNode(true);
            
            // Set title and description
            robotCard.querySelector('h3').textContent = robot.name;
            robotCard.querySelector('p').textContent = robot.description || 'No description available';
            
            // Set link - make the button a link
            const button = robotCard.querySelector('button');
            button.textContent = 'Learn More';
            button.onclick = function() {
                // Check if it's Atlas (which has a static page)
                if (robot.slug === 'atlas') {
                    window.location.href = 'atlas.html';
                } else {
                    // For all other robots, use the dynamic robot.html page with a slug parameter
                    window.location.href = `robot.html?slug=${encodeURIComponent(robot.slug)}`;
                }
            };
            
            // Set image (with fallback)
            const imgElement = robotCard.querySelector('img');
            imgElement.alt = robot.name;
            
            // Use the file upload service to get the proper URL for the image
            if (robot.mainImage) {
                imgElement.src = getFileUrl(robot.mainImage);
            } else {
                imgElement.src = '../images/robots/placeholder.jpg';
            }
            
            // Error handler for images
            imgElement.onerror = function() {
                this.src = '../images/robots/placeholder.jpg';
            };
            
            // Add to fragment
            fragment.appendChild(robotCard);
        }
        
        // Add all cards to container
        robotsContainer.appendChild(fragment);
    }, 200); // Short delay for loading effect
}
