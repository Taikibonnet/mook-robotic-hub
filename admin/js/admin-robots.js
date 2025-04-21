/**
 * MOOK Robotics Hub - Admin Robots JavaScript
 * 
 * This file contains code for handling admin robot management,
 * including displaying, editing, and deleting robots.
 */

import { getAllRobots, deleteRobot } from '../js/robot-service.js';
import { getFileUrl } from '../js/file-upload-service.js';

// State variables
let allRobots = [];
let filteredRobots = [];
let currentPage = 1;
const ROBOTS_PER_PAGE = 10;
let selectedRobots = new Set();

// Document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load robots
    loadRobots();
    
    // Initialize event listeners
    initFilters();
    initSearch();
    initPagination();
    initModalHandling();
    initBulkActions();
});

/**
 * Load robots from storage
 */
async function loadRobots() {
    try {
        // Get all robots
        allRobots = getAllRobots();
        
        // Apply initial filtering (none)
        filterRobots();
        
        // Update the table
        renderRobotsTable();
        
        // Initialize the filter dropdowns
        populateFilterOptions();
    } catch (error) {
        console.error('Error loading robots:', error);
        showErrorMessage('Failed to load robots. Please try again later.');
    }
}

/**
 * Filter robots based on selected criteria
 */
function filterRobots() {
    // Get filter values
    const searchQuery = document.getElementById('robot-search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    const manufacturerFilter = document.getElementById('filter-manufacturer').value;
    const yearFilter = document.getElementById('filter-year').value;
    const featuredFilter = document.getElementById('filter-featured').value;
    
    // Apply filters
    filteredRobots = allRobots.filter(robot => {
        // Search query filter
        if (searchQuery) {
            const searchableText = `${robot.name} ${robot.manufacturer || ''} ${robot.description || ''}`.toLowerCase();
            if (!searchableText.includes(searchQuery)) {
                return false;
            }
        }
        
        // Category filter
        if (categoryFilter && robot.category !== categoryFilter) {
            return false;
        }
        
        // Manufacturer filter
        if (manufacturerFilter && robot.manufacturer !== manufacturerFilter) {
            return false;
        }
        
        // Year filter
        if (yearFilter && (!robot.year || robot.year.toString() !== yearFilter)) {
            return false;
        }
        
        // Featured filter
        if (featuredFilter === 'true' && !robot.featured) {
            return false;
        } else if (featuredFilter === 'false' && robot.featured) {
            return false;
        }
        
        return true;
    });
    
    // Reset pagination
    currentPage = 1;
    updatePaginationControls();
}

/**
 * Populate filter dropdowns with available options
 */
function populateFilterOptions() {
    // Manufacturer filter
    const manufacturerSelect = document.getElementById('filter-manufacturer');
    const manufacturers = [...new Set(allRobots.map(robot => robot.manufacturer).filter(Boolean))];
    
    // Clear existing options (except the first one)
    while (manufacturerSelect.options.length > 1) {
        manufacturerSelect.remove(1);
    }
    
    // Add manufacturer options
    manufacturers.sort().forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerSelect.appendChild(option);
    });
    
    // Year filter
    const yearSelect = document.getElementById('filter-year');
    const years = [...new Set(allRobots.map(robot => robot.year).filter(Boolean))];
    
    // Clear existing options (except the first one)
    while (yearSelect.options.length > 1) {
        yearSelect.remove(1);
    }
    
    // Add year options (newest first)
    years.sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        yearSelect.appendChild(option);
    });
}

/**
 * Initialize filter functionality
 */
function initFilters() {
    // Toggle filter panel
    const filterBtn = document.getElementById('robot-filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    
    if (filterBtn && filterPanel) {
        filterBtn.addEventListener('click', function() {
            filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Apply filters
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterRobots();
            renderRobotsTable();
        });
    }
    
    // Reset filters
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset filter dropdowns
            document.getElementById('filter-category').value = '';
            document.getElementById('filter-manufacturer').value = '';
            document.getElementById('filter-year').value = '';
            document.getElementById('filter-featured').value = '';
            
            // Reset filters and render
            filterRobots();
            renderRobotsTable();
        });
    }
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('robot-search-input');
    const searchBtn = document.getElementById('robot-search-btn');
    
    if (searchInput && searchBtn) {
        // Search button click
        searchBtn.addEventListener('click', function() {
            filterRobots();
            renderRobotsTable();
        });
        
        // Enter key in search input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterRobots();
                renderRobotsTable();
            }
        });
    }
}

/**
 * Initialize pagination controls
 */
function initPagination() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderRobotsTable();
                updatePaginationControls();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredRobots.length / ROBOTS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderRobotsTable();
                updatePaginationControls();
            }
        });
    }
}

/**
 * Update pagination controls based on current state
 */
function updatePaginationControls() {
    const totalPages = Math.max(1, Math.ceil(filteredRobots.length / ROBOTS_PER_PAGE));
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
}

/**
 * Render the robots table with current data
 */
function renderRobotsTable() {
    const robotsList = document.getElementById('robots-list');
    
    if (!robotsList) return;
    
    // Clear the table
    robotsList.innerHTML = '';
    
    // If no robots found, show message
    if (filteredRobots.length === 0) {
        const noRobotsRow = document.createElement('tr');
        noRobotsRow.innerHTML = `
            <td colspan="7" class="no-results">
                <i class="fas fa-robot"></i>
                <p>No robots found</p>
            </td>
        `;
        robotsList.appendChild(noRobotsRow);
        return;
    }
    
    // Calculate page range
    const startIndex = (currentPage - 1) * ROBOTS_PER_PAGE;
    const endIndex = Math.min(startIndex + ROBOTS_PER_PAGE, filteredRobots.length);
    const pageRobots = filteredRobots.slice(startIndex, endIndex);
    
    // Add robot rows
    pageRobots.forEach(robot => {
        const row = document.createElement('tr');
        
        // For simplicity, we'll consider robots with their own detail pages to be "featured"
        const isFeatured = robot.featured || robot.slug === 'atlas';
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="robot-select" data-robot-id="${robot.id}">
            </td>
            <td>
                <div class="robot-info">
                    <div class="robot-thumbnail">
                        <img src="${getFileUrl(robot.mainImage || '../images/robots/placeholder.jpg')}" alt="${robot.name}" 
                             onerror="this.src='../images/robots/placeholder.jpg'">
                    </div>
                    <div class="robot-details">
                        <div class="robot-name">${robot.name}</div>
                        <div class="robot-description">${robot.description || 'No description available'}</div>
                    </div>
                </div>
            </td>
            <td>${robot.category || 'Uncategorized'}</td>
            <td>${robot.manufacturer || 'Unknown'}</td>
            <td>${robot.year || 'Unknown'}</td>
            <td>
                <span class="status-badge ${isFeatured ? 'featured' : 'not-featured'}">
                    ${isFeatured ? 'Featured' : 'Not Featured'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <a href="../robots/robot.html?slug=${robot.slug}" class="action-btn view-btn" title="View Robot" target="_blank">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="edit-robot.html?id=${robot.id}" class="action-btn edit-btn" title="Edit Robot">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="action-btn delete-btn" title="Delete Robot" data-robot-id="${robot.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        robotsList.appendChild(row);
    });
    
    // Add event listeners to checkboxes
    const checkboxes = robotsList.querySelectorAll('.robot-select');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const robotId = this.dataset.robotId;
            
            if (this.checked) {
                selectedRobots.add(robotId);
            } else {
                selectedRobots.delete(robotId);
            }
            
            updateBulkActionStatus();
        });
        
        // Set initial checked state
        checkbox.checked = selectedRobots.has(checkbox.dataset.robotId);
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = robotsList.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const robotId = this.dataset.robotId;
            const robot = allRobots.find(r => r.id === robotId);
            
            if (robot) {
                openDeleteModal(robot);
            }
        });
    });
}

/**
 * Initialize modal handling
 */
function initModalHandling() {
    const modal = document.getElementById('robot-action-modal');
    const closeButton = modal?.querySelector('.close-modal');
    const cancelButton = document.getElementById('cancel-action');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    
    // Close modal on X button click
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal on Cancel button click
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal on click outside
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Handle delete confirmation
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', function() {
            const robotId = confirmDeleteButton.dataset.robotId;
            
            if (robotId) {
                // Delete the robot
                deleteRobot(robotId);
                
                // Close the modal
                modal.style.display = 'none';
                
                // Remove from selected robots if selected
                selectedRobots.delete(robotId);
                
                // Reload robots and update the table
                loadRobots();
                
                // Show success message
                showSuccessMessage('Robot deleted successfully!');
            }
        });
    }
}

/**
 * Initialize bulk actions
 */
function initBulkActions() {
    const selectAllCheckbox = document.getElementById('select-all');
    const bulkDeleteButton = document.getElementById('bulk-delete');
    
    // Select all checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            const checkboxes = document.querySelectorAll('.robot-select');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                
                const robotId = checkbox.dataset.robotId;
                if (isChecked) {
                    selectedRobots.add(robotId);
                } else {
                    selectedRobots.delete(robotId);
                }
            });
            
            updateBulkActionStatus();
        });
    }
    
    // Bulk delete button
    if (bulkDeleteButton) {
        bulkDeleteButton.addEventListener('click', function() {
            if (selectedRobots.size > 0) {
                const confirmBulkDelete = confirm(`Are you sure you want to delete ${selectedRobots.size} robots? This action cannot be undone.`);
                
                if (confirmBulkDelete) {
                    // Delete selected robots
                    let deletedCount = 0;
                    
                    selectedRobots.forEach(robotId => {
                        const success = deleteRobot(robotId);
                        if (success) deletedCount++;
                    });
                    
                    // Clear selected robots
                    selectedRobots.clear();
                    
                    // Reload robots and update the table
                    loadRobots();
                    
                    // Show success message
                    showSuccessMessage(`${deletedCount} robots deleted successfully!`);
                }
            }
        });
    }
}

/**
 * Update bulk action button status based on selection
 */
function updateBulkActionStatus() {
    const bulkDeleteButton = document.getElementById('bulk-delete');
    
    if (bulkDeleteButton) {
        bulkDeleteButton.disabled = selectedRobots.size === 0;
    }
}

/**
 * Open the delete confirmation modal
 * @param {Object} robot - The robot to delete
 */
function openDeleteModal(robot) {
    const modal = document.getElementById('robot-action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const previewName = document.getElementById('preview-name');
    const previewDescription = document.getElementById('preview-description');
    const previewImg = document.getElementById('preview-img');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    
    if (!modal || !confirmDeleteButton) return;
    
    // Update modal content
    if (modalTitle) modalTitle.textContent = `Delete Robot: ${robot.name}`;
    
    if (previewName) previewName.textContent = robot.name;
    if (previewDescription) previewDescription.textContent = robot.description || 'No description available';
    
    if (previewImg) {
        previewImg.src = getFileUrl(robot.mainImage || '../images/robots/placeholder.jpg');
        previewImg.onerror = function() {
            this.src = '../images/robots/placeholder.jpg';
        };
    }
    
    // Set robot ID for delete confirmation
    confirmDeleteButton.dataset.robotId = robot.id;
    
    // Show the modal
    modal.style.display = 'flex';
}

/**
 * Show a success message to the user
 * @param {string} message - The message to display
 */
function showSuccessMessage(message) {
    const adminContent = document.querySelector('.admin-content');
    
    if (!adminContent) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'admin-message admin-message-success';
    messageElement.innerHTML = `
        <div class="admin-message-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="admin-message-content">
            <h4>Success</h4>
            <p>${message}</p>
        </div>
        <button type="button" class="admin-message-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to the beginning of the content
    adminContent.insertBefore(messageElement, adminContent.firstChild);
    
    // Add close button functionality
    messageElement.querySelector('.admin-message-close').addEventListener('click', function() {
        messageElement.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

/**
 * Show an error message to the user
 * @param {string} message - The message to display
 */
function showErrorMessage(message) {
    const adminContent = document.querySelector('.admin-content');
    
    if (!adminContent) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'admin-message admin-message-error';
    messageElement.innerHTML = `
        <div class="admin-message-icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="admin-message-content">
            <h4>Error</h4>
            <p>${message}</p>
        </div>
        <button type="button" class="admin-message-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to the beginning of the content
    adminContent.insertBefore(messageElement, adminContent.firstChild);
    
    // Add close button functionality
    messageElement.querySelector('.admin-message-close').addEventListener('click', function() {
        messageElement.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}
