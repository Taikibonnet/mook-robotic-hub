/**
 * MOOK Robotics Hub - Admin Robots Page JavaScript
 * 
 * This file contains functionality for the robots management page,
 * including listing, filtering, and performing actions on robots.
 */

import { getAllRobots, deleteRobot, updateRobot } from '../../js/robot-service.js';
import { logActivity } from './dashboard.js';

// Constants
const ROBOTS_PER_PAGE = 10;

// State
let allRobots = [];
let filteredRobots = [];
let currentPage = 1;
let selectedRobots = new Set();

// Document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load robots
    loadRobots();
    
    // Initialize filters
    initFilters();
    
    // Initialize search
    initSearch();
    
    // Initialize pagination
    initPagination();
    
    // Initialize selection controls
    initSelectionControls();
    
    // Initialize action buttons
    initActionButtons();
});

/**
 * Load all robots from the service
 */
async function loadRobots() {
    try {
        // Get all robots
        allRobots = getAllRobots();
        
        // Apply initial filters and render
        filterRobots();
        renderRobotPage(1);
        
        // Update filter dropdowns with available options
        updateFilterOptions();
    } catch (error) {
        console.error('Error loading robots:', error);
        showError('Failed to load robots. Please try again later.');
    }
}

/**
 * Initialize filter panel and controls
 */
function initFilters() {
    // Filter button toggle
    const filterBtn = document.getElementById('robot-filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    
    if (filterBtn && filterPanel) {
        filterBtn.addEventListener('click', function() {
            filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterRobots();
            renderRobotPage(1);
            
            // Hide the filter panel
            if (filterPanel) {
                filterPanel.style.display = 'none';
            }
        });
    }
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset filter dropdowns
            document.getElementById('filter-category').value = '';
            document.getElementById('filter-manufacturer').value = '';
            document.getElementById('filter-year').value = '';
            document.getElementById('filter-featured').value = '';
            
            // Reset search
            document.getElementById('robot-search-input').value = '';
            
            // Reset filters and render
            filterRobots();
            renderRobotPage(1);
            
            // Hide the filter panel
            if (filterPanel) {
                filterPanel.style.display = 'none';
            }
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
            renderRobotPage(1);
        });
        
        // Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterRobots();
                renderRobotPage(1);
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
 * Initialize selection controls (checkboxes)
 */
function initSelectionControls() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // Get all robot checkboxes on the current page
            const checkboxes = document.querySelectorAll('#robots-list .robot-checkbox');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                
                // Update selected robots set
                const robotId = checkbox.value;
                if (isChecked) {
                    selectedRobots.add(robotId);
                } else {
                    selectedRobots.delete(robotId);
                }
            });
            
            // Update bulk action buttons
            updateBulkActionButtons();
        });
    }
}

/**
 * Initialize action buttons (edit, delete, feature, etc.)
 */
function initActionButtons() {
    // Get the bulk delete button
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function() {
            if (selectedRobots.size > 0) {
                openDeleteConfirmation([...selectedRobots]);
            }
        });
    }
    
    // Modal action buttons
    const cancelActionBtn = document.getElementById('cancel-action');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const closeModalBtn = document.querySelector('.close-modal');
    const actionModal = document.getElementById('robot-action-modal');
    
    if (cancelActionBtn && actionModal) {
        cancelActionBtn.addEventListener('click', function() {
            actionModal.style.display = 'none';
        });
    }
    
    if (closeModalBtn && actionModal) {
        closeModalBtn.addEventListener('click', function() {
            actionModal.style.display = 'none';
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            // Get the robot IDs from the data attribute
            const robotIds = this.dataset.robotIds.split(',');
            
            // Delete the robots
            deleteRobots(robotIds);
            
            // Close the modal
            if (actionModal) {
                actionModal.style.display = 'none';
            }
        });
    }
}

/**
 * Filter robots based on search and filter criteria
 */
function filterRobots() {
    // Get filter values
    const categoryFilter = document.getElementById('filter-category').value;
    const manufacturerFilter = document.getElementById('filter-manufacturer').value;
    const yearFilter = document.getElementById('filter-year').value;
    const featuredFilter = document.getElementById('filter-featured').value;
    
    // Get search value
    const searchInput = document.getElementById('robot-search-input');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // Apply filters
    filteredRobots = allRobots.filter(robot => {
        // Category filter
        if (categoryFilter && robot.category !== categoryFilter) {
            return false;
        }
        
        // Manufacturer filter
        if (manufacturerFilter && robot.manufacturer !== manufacturerFilter) {
            return false;
        }
        
        // Year filter
        if (yearFilter && robot.year.toString() !== yearFilter) {
            return false;
        }
        
        // Featured filter
        if (featuredFilter) {
            const isFeatured = robot.featured === true;
            if (featuredFilter === 'true' && !isFeatured) {
                return false;
            } else if (featuredFilter === 'false' && isFeatured) {
                return false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const searchFields = [
                robot.name,
                robot.manufacturer,
                robot.description,
                robot.category
            ].filter(Boolean).map(field => field.toLowerCase());
            
            return searchFields.some(field => field.includes(searchTerm));
        }
        
        return true;
    });
    
    // Update pagination
    updatePagination();
    
    // Reset selected robots
    selectedRobots.clear();
    updateBulkActionButtons();
}

/**
 * Update filter dropdowns with available options from robot data
 */
function updateFilterOptions() {
    // Get unique manufacturers
    const manufacturers = [...new Set(allRobots
        .map(robot => robot.manufacturer)
        .filter(Boolean))];
    
    // Sort alphabetically
    manufacturers.sort();
    
    // Get the manufacturer dropdown
    const manufacturerSelect = document.getElementById('filter-manufacturer');
    
    if (manufacturerSelect) {
        // Clear existing options (except the first one)
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
    const years = [...new Set(allRobots
        .map(robot => robot.year)
        .filter(Boolean))];
    
    // Sort numerically (descending)
    years.sort((a, b) => b - a);
    
    // Get the year dropdown
    const yearSelect = document.getElementById('filter-year');
    
    if (yearSelect) {
        // Clear existing options (except the first one)
        while (yearSelect.options.length > 1) {
            yearSelect.remove(1);
        }
        
        // Add year options
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year.toString();
            option.textContent = year.toString();
            yearSelect.appendChild(option);
        });
    }
}

/**
 * Update pagination controls based on filtered robots
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredRobots.length / ROBOTS_PER_PAGE);
    
    // Update page numbers
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    
    if (currentPageElement) {
        currentPageElement.textContent = currentPage.toString();
    }
    
    if (totalPagesElement) {
        totalPagesElement.textContent = totalPages.toString();
    }
    
    // Update button states
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
}

/**
 * Render a page of robots
 * @param {number} page - Page number
 */
function renderRobotPage(page) {
    // Update current page
    currentPage = page;
    
    // Update pagination controls
    updatePagination();
    
    // Calculate start and end indices
    const startIndex = (page - 1) * ROBOTS_PER_PAGE;
    const endIndex = startIndex + ROBOTS_PER_PAGE;
    
    // Get robots for this page
    const pageRobots = filteredRobots.slice(startIndex, endIndex);
    
    // Get the robot list element
    const robotsList = document.getElementById('robots-list');
    
    if (!robotsList) return;
    
    // Clear existing rows
    robotsList.innerHTML = '';
    
    // If no robots, show message
    if (pageRobots.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="no-results">
                <p>No robots found</p>
                <button id="reset-filter-btn" class="btn">Reset Filters</button>
            </td>
        `;
        robotsList.appendChild(row);
        
        // Add event listener to reset button
        const resetBtn = robotsList.querySelector('#reset-filter-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                // Reset filter dropdowns
                document.getElementById('filter-category').value = '';
                document.getElementById('filter-manufacturer').value = '';
                document.getElementById('filter-year').value = '';
                document.getElementById('filter-featured').value = '';
                
                // Reset search
                document.getElementById('robot-search-input').value = '';
                
                // Reset filters and render
                filterRobots();
                renderRobotPage(1);
            });
        }
        
        return;
    }
    
    // Add rows for each robot
    pageRobots.forEach(robot => {
        const row = document.createElement('tr');
        row.dataset.robotId = robot.id;
        
        // Create table cells
        row.innerHTML = `
            <td>
                <input type="checkbox" class="robot-checkbox" value="${robot.id}" ${selectedRobots.has(robot.id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="robot-list-item">
                    <div class="list-item-img" style="background-image: url('../${robot.mainImage}')"></div>
                    <span>${robot.name}</span>
                </div>
            </td>
            <td>${robot.category || 'Uncategorized'}</td>
            <td>${robot.manufacturer || 'Unknown'}</td>
            <td>${robot.year || 'N/A'}</td>
            <td>
                <div class="feature-toggle">
                    <input type="checkbox" class="toggle-checkbox" id="feature-${robot.id}" ${robot.featured ? 'checked' : ''}>
                    <label for="feature-${robot.id}" class="toggle-label"></label>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <a href="edit-robot.html?id=${robot.id}" class="table-action edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="table-action view" title="View" data-id="${robot.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action delete" title="Delete" data-id="${robot.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        robotsList.appendChild(row);
        
        // Add event listeners to the new checkboxes
        const checkbox = row.querySelector('.robot-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const robotId = this.value;
                
                if (this.checked) {
                    selectedRobots.add(robotId);
                } else {
                    selectedRobots.delete(robotId);
                }
                
                updateBulkActionButtons();
            });
        }
        
        // Add event listener to featured toggle
        const featureToggle = row.querySelector('.toggle-checkbox');
        if (featureToggle) {
            featureToggle.addEventListener('change', function() {
                const robotId = robot.id;
                const isFeatured = this.checked;
                
                toggleRobotFeatured(robotId, isFeatured);
            });
        }
        
        // Add event listeners to action buttons
        const viewBtn = row.querySelector('.table-action.view');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const robotId = this.dataset.id;
                viewRobot(robotId);
            });
        }
        
        const deleteBtn = row.querySelector('.table-action.delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const robotId = this.dataset.id;
                openDeleteConfirmation([robotId]);
            });
        }
    });
    
    // Reset the "select all" checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
}

/**
 * Update bulk action buttons based on selection
 */
function updateBulkActionButtons() {
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = selectedRobots.size === 0;
    }
}

/**
 * Toggle a robot's featured status
 * @param {string} robotId - Robot ID
 * @param {boolean} isFeatured - Whether the robot should be featured
 */
function toggleRobotFeatured(robotId, isFeatured) {
    try {
        // Find the robot in our data
        const robotIndex = allRobots.findIndex(robot => robot.id === robotId);
        
        if (robotIndex !== -1) {
            // Update the robot in our data
            allRobots[robotIndex].featured = isFeatured;
            
            // Update the robot in the database
            updateRobot(robotId, { featured: isFeatured });
            
            // Log the activity
            const robotName = allRobots[robotIndex].name;
            const activityType = 'edit';
            const activityText = isFeatured
                ? `Robot "${robotName}" marked as featured`
                : `Robot "${robotName}" removed from featured`;
            
            logActivity(activityType, activityText);
        }
    } catch (error) {
        console.error('Error toggling robot featured status:', error);
        showError('Failed to update robot. Please try again.');
    }
}

/**
 * Open the delete confirmation modal
 * @param {string[]} robotIds - Array of robot IDs to delete
 */
function openDeleteConfirmation(robotIds) {
    const modal = document.getElementById('robot-action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const previewName = document.getElementById('preview-name');
    const previewDesc = document.getElementById('preview-description');
    const previewImg = document.getElementById('preview-img');
    
    if (!modal || !modalTitle || !modalBody || !confirmDeleteBtn) return;
    
    // Clear existing content
    modalBody.innerHTML = '';
    
    // Set the title based on the number of robots
    if (robotIds.length === 1) {
        // Single robot deletion
        const robotId = robotIds[0];
        const robot = allRobots.find(r => r.id === robotId);
        
        if (!robot) return;
        
        modalTitle.textContent = 'Delete Robot';
        modalBody.innerHTML = `
            <p>Are you sure you want to delete this robot? This action cannot be undone.</p>
            <div class="robot-preview" id="robot-preview">
                <div class="robot-preview-img">
                    <img src="../${robot.mainImage}" alt="${robot.name}" onerror="this.src='../images/robots/placeholder.jpg'">
                </div>
                <div class="robot-preview-info">
                    <h4>${robot.name}</h4>
                    <p>${robot.description || 'No description available.'}</p>
                </div>
            </div>
        `;
    } else {
        // Multiple robots deletion
        modalTitle.textContent = 'Delete Multiple Robots';
        
        let robotsList = '';
        robotIds.forEach(id => {
            const robot = allRobots.find(r => r.id === id);
            if (robot) {
                robotsList += `<li>${robot.name}</li>`;
            }
        });
        
        modalBody.innerHTML = `
            <p>Are you sure you want to delete the following robots? This action cannot be undone.</p>
            <ul class="delete-list">
                ${robotsList}
            </ul>
        `;
    }
    
    // Set the robot IDs for the confirm button
    confirmDeleteBtn.dataset.robotIds = robotIds.join(',');
    
    // Show the modal
    modal.style.display = 'block';
}

/**
 * Delete one or more robots
 * @param {string[]} robotIds - Array of robot IDs to delete
 */
function deleteRobots(robotIds) {
    try {
        // Get the names of the robots being deleted (for logging)
        const robotNames = robotIds.map(id => {
            const robot = allRobots.find(r => r.id === id);
            return robot ? robot.name : 'Unknown Robot';
        });
        
        // Delete each robot
        robotIds.forEach(id => {
            deleteRobot(id);
            
            // Remove from selectedRobots set
            selectedRobots.delete(id);
        });
        
        // Update bulk action buttons
        updateBulkActionButtons();
        
        // Refresh the robots list
        allRobots = allRobots.filter(robot => !robotIds.includes(robot.id));
        filterRobots();
        renderRobotPage(1);
        
        // Log the activity
        let activityText;
        if (robotIds.length === 1) {
            activityText = `Robot "${robotNames[0]}" deleted`;
        } else {
            activityText = `${robotIds.length} robots deleted`;
        }
        
        logActivity('delete', activityText);
        
        // Show success message
        showSuccess(`${robotIds.length} robot(s) deleted successfully`);
    } catch (error) {
        console.error('Error deleting robots:', error);
        showError('Failed to delete robot(s). Please try again.');
    }
}

/**
 * View a robot (opens robot detail page in a new tab)
 * @param {string} robotId - Robot ID
 */
function viewRobot(robotId) {
    const robot = allRobots.find(r => r.id === robotId);
    
    if (robot) {
        window.open(`../robots/${robot.slug}.html`, '_blank');
    }
}

/**
 * Show a success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    // Create a success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>${message}</p>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to the page
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.close-notification');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * Show an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Create an error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to the page
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.close-notification');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
