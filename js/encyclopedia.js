/**
 * MOOK Robotics Hub - Encyclopedia JavaScript
 * 
 * This file contains functionality for the robotics encyclopedia,
 * including search, filtering, and interaction.
 */

document.addEventListener('DOMContentLoaded', function() {
    initEncyclopedia();
    initSubmitRobotModal();
});

/**
 * Initialize encyclopedia functionality
 */
function initEncyclopedia() {
    // Setup search
    const searchInput = document.getElementById('encyclopedia-search');
    const searchBtn = document.getElementById('encyclopedia-search-btn');
    
    if (searchInput && searchBtn) {
        // Search button click
        searchBtn.addEventListener('click', function() {
            searchRobots(searchInput.value);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRobots(searchInput.value);
            }
        });
        
        // Live search as you type (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchRobots(searchInput.value);
            }, 300); // 300ms delay to reduce frequency of searches
        });
        
        // Check URL for search query param
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            searchInput.value = searchQuery;
            searchRobots(searchQuery);
        }
    }
    
    // Setup filters
    setupFilters();
    
    // Setup pagination
    setupPagination();
    
    // Add hover effects to robot cards
    const robotCards = document.querySelectorAll('.robot-card');
    robotCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
}

/**
 * Search robots based on a query
 * @param {string} query - The search query
 */
function searchRobots(query) {
    query = query.toLowerCase().trim();
    
    const robotCards = document.querySelectorAll('.robot-card');
    let matchCount = 0;
    
    robotCards.forEach(card => {
        const robotName = card.querySelector('h3').textContent.toLowerCase();
        const robotManufacturer = card.querySelector('.robot-manufacturer').textContent.toLowerCase();
        const robotDescription = card.querySelector('.robot-description').textContent.toLowerCase();
        const robotCategory = card.dataset.category.toLowerCase();
        
        // Check if any fields match the query
        if (query === '' || 
            robotName.includes(query) || 
            robotManufacturer.includes(query) || 
            robotDescription.includes(query) || 
            robotCategory.includes(query)) {
            
            card.style.display = 'flex';
            matchCount++;
            
            // Highlight matching text if there's a query
            if (query !== '') {
                highlightText(card, query);
            } else {
                // Remove any existing highlights
                removeHighlights(card);
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results message
    updateResultsMessage(matchCount, query);
}

/**
 * Highlight matching text in a robot card
 * @param {HTMLElement} card - The robot card element
 * @param {string} query - The search query
 */
function highlightText(card, query) {
    // Remove any existing highlights first
    removeHighlights(card);
    
    // Fields to highlight
    const titleElement = card.querySelector('h3');
    const manufacturerElement = card.querySelector('.robot-manufacturer');
    const descriptionElement = card.querySelector('.robot-description');
    
    // Highlight function
    const highlightInElement = (element, text) => {
        if (!element) return;
        
        const regex = new RegExp(`(${escapeRegExp(text)})`, 'gi');
        element.innerHTML = element.textContent.replace(
            regex, 
            '<span class="highlight-search">$1</span>'
        );
    };
    
    // Apply highlights
    highlightInElement(titleElement, query);
    highlightInElement(manufacturerElement, query);
    highlightInElement(descriptionElement, query);
}

/**
 * Remove highlight spans from a robot card
 * @param {HTMLElement} card - The robot card element
 */
function removeHighlights(card) {
    const highlightSpans = card.querySelectorAll('.highlight-search');
    
    highlightSpans.forEach(span => {
        // Replace the span with its text content
        span.outerHTML = span.textContent;
    });
}

/**
 * Escape special characters for regex
 * @param {string} string - The string to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\/**
 * MOOK Robotics Hub - Encyclopedia JavaScript
 * 
 * This file contains functionality for the robotics encyclopedia,
 * including search, filtering, and interaction.
 */

document.addEventListener('DOMContentLoaded', function() {
    initEncyclopedia();
    initSubmitRobotModal();
});

/**
 * Initialize encyclopedia functionality
 */
function initEncyclopedia() {
    // Setup search
    const searchInput = document.getElementById('encyclopedia-search');
    const searchBtn = document.getElementById('encyclopedia-search-btn');
    
    if (searchInput && searchBtn) {
        // Search button click
        searchBtn.addEventListener('click', function() {
            searchRobots(searchInput.value);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRobots(searchInput.value);
            }
        });
        
        // Live search as you type (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchRobots(searchInput.value);
            }, 300); // 300');
}

/**
 * Update the results message based on search results
 * @param {number} count - Number of matching robots
 * @param {string} query - The search query
 */
function updateResultsMessage(count, query) {
    // Create or get the results message element
    let resultsMessage = document.querySelector('.results-message');
    
    if (!resultsMessage) {
        resultsMessage = document.createElement('p');
        resultsMessage.className = 'results-message';
        
        // Insert after the filters section
        const filtersSection = document.querySelector('.encyclopedia-filters');
        if (filtersSection) {
            filtersSection.after(resultsMessage);
        }
    }
    
    // Update the message content
    if (query) {
        if (count === 0) {
            resultsMessage.textContent = `No robots found matching "${query}"`;
            resultsMessage.classList.add('no-results');
        } else {
            resultsMessage.textContent = `Found ${count} robot${count !== 1 ? 's' : ''} matching "${query}"`;
            resultsMessage.classList.remove('no-results');
        }
        
        resultsMessage.style.display = 'block';
    } else {
        // Hide the message if there's no query
        resultsMessage.style.display = 'none';
    }
}

/**
 * Setup filters for the encyclopedia
 */
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const manufacturerFilter = document.getElementById('manufacturer-filter');
    const yearFilter = document.getElementById('year-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    // Apply filters function
    const applyFilters = () => {
        const categoryValue = categoryFilter.value;
        const manufacturerValue = manufacturerFilter.value;
        const yearValue = yearFilter.value;
        
        const robotCards = document.querySelectorAll('.robot-card');
        let visibleCount = 0;
        
        robotCards.forEach(card => {
            // Check if card matches all selected filters
            const categoryMatch = !categoryValue || card.dataset.category === categoryValue;
            const manufacturerMatch = !manufacturerValue || card.dataset.manufacturer === manufacturerValue;
            
            // For year filter, need to check ranges
            let yearMatch = true;
            if (yearValue) {
                const robotYear = parseInt(card.dataset.year);
                
                switch (yearValue) {
                    case '2020-2025':
                        yearMatch = robotYear >= 2020 && robotYear <= 2025;
                        break;
                    case '2015-2019':
                        yearMatch = robotYear >= 2015 && robotYear <= 2019;
                        break;
                    case '2010-2014':
                        yearMatch = robotYear >= 2010 && robotYear <= 2014;
                        break;
                    case '2000-2009':
                        yearMatch = robotYear >= 2000 && robotYear <= 2009;
                        break;
                    case '1990-1999':
                        yearMatch = robotYear >= 1990 && robotYear <= 1999;
                        break;
                    case 'before-1990':
                        yearMatch = robotYear < 1990;
                        break;
                }
            }
            
            // Show or hide based on all filters
            if (categoryMatch && manufacturerMatch && yearMatch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update filter status
        updateFilterStatus(visibleCount);
    };
    
    // Add event listeners to filters
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (manufacturerFilter) manufacturerFilter.addEventListener('change', applyFilters);
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    
    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            if (categoryFilter) categoryFilter.value = '';
            if (manufacturerFilter) manufacturerFilter.value = '';
            if (yearFilter) yearFilter.value = '';
            
            // Reset search
            const searchInput = document.getElementById('encyclopedia-search');
            if (searchInput) searchInput.value = '';
            
            // Show all robots
            const robotCards = document.querySelectorAll('.robot-card');
            robotCards.forEach(card => {
                card.style.display = 'flex';
                removeHighlights(card);
            });
            
            // Hide results message
            const resultsMessage = document.querySelector('.results-message');
            if (resultsMessage) resultsMessage.style.display = 'none';
            
            // Hide filter status
            const filterStatus = document.querySelector('.filter-status');
            if (filterStatus) filterStatus.style.display = 'none';
        });
    }
}

/**
 * Update filter status message
 * @param {number} count - Number of visible robots
 */
function updateFilterStatus(count) {
    // Create or get the filter status element
    let filterStatus = document.querySelector('.filter-status');
    
    if (!filterStatus) {
        filterStatus = document.createElement('p');
        filterStatus.className = 'filter-status';
        
        // Insert after the filters section
        const filtersSection = document.querySelector('.encyclopedia-filters');
        if (filtersSection) {
            filtersSection.after(filterStatus);
        }
    }
    
    // Update the status content
    if (count === 0) {
        filterStatus.textContent = 'No robots match the selected filters.';
        filterStatus.classList.add('no-results');
    } else {
        filterStatus.textContent = `Showing ${count} robot${count !== 1 ? 's' : ''} that match your filters.`;
        filterStatus.classList.remove('no-results');
    }
    
    filterStatus.style.display = 'block';
}

/**
 * Setup pagination functionality
 */
function setupPagination() {
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            paginationLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // In a real application, this would load the next page of robots
            // For this demo, we'll just scroll to the top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Initialize the submit robot modal
 */
function initSubmitRobotModal() {
    const submitRobotBtn = document.getElementById('submit-robot-btn');
    const submitRobotModal = document.getElementById('submit-robot-modal');
    const closeModal = submitRobotModal?.querySelector('.close-modal');
    const submitRobotForm = document.getElementById('submit-robot-form');
    
    // Open modal
    if (submitRobotBtn && submitRobotModal) {
        submitRobotBtn.addEventListener('click', function() {
            submitRobotModal.classList.add('active');
        });
    }
    
    // Close modal
    if (closeModal && submitRobotModal) {
        closeModal.addEventListener('click', function() {
            submitRobotModal.classList.remove('active');
        });
    }
    
    // Submit form
    if (submitRobotForm) {
        submitRobotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, this would submit the form data to a server
            alert('Thank you for your submission! Our team will review the information and add this robot to our database if appropriate.');
            
            // Close the modal
            if (submitRobotModal) {
                submitRobotModal.classList.remove('active');
            }
            
            // Reset the form
            submitRobotForm.reset();
        });
    }
}
