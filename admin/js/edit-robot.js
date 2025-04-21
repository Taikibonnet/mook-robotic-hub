/**
 * MOOK Robotics Hub - Edit Robot Page JavaScript
 */

import { getRobotById, updateRobot, deleteRobot } from '../../js/robot-service.js';
import { logActivity } from './dashboard.js';

// Keep track of selected images
let mainImageFile = null;
let galleryImageFiles = [];
let originalRobot = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get the robot ID from the URL
    const params = new URLSearchParams(window.location.search);
    const robotId = params.get('id');
    
    if (!robotId) {
        // No robot ID provided, redirect to robots list
        window.location.href = 'robots.html';
        return;
    }
    
    // Load the robot data
    loadRobot(robotId);
    
    // Initialize form functionality
    initEditRobotForm();
    
    // Initialize delete functionality
    initDeleteFunctionality();
});

/**
 * Load robot data from the service
 */
function loadRobot(robotId) {
    try {
        // Get the robot by ID
        const robot = getRobotById(robotId);
        
        if (!robot) {
            showError('Robot not found');
            setTimeout(() => {
                window.location.href = 'robots.html';
            }, 3000);
            return;
        }
        
        // Store the original robot data
        originalRobot = robot;
        
        // Populate form fields
        populateRobotForm(robot);
        
    } catch (error) {
        console.error('Error loading robot:', error);
        showError('Failed to load robot data. Please try again later.');
    }
}

/**
 * Populate the form with robot data
 */
function populateRobotForm(robot) {
    // Update page title
    document.title = `Edit ${robot.name} - MOOK Robotics Hub`;
    document.getElementById('edit-robot-title').textContent = `Edit ${robot.name}`;
    
    // Set hidden fields
    document.getElementById('robot-id').value = robot.id;
    document.getElementById('robot-slug').value = robot.slug || '';
    
    // Basic information
    document.getElementById('robot-name').value = robot.name || '';
    document.getElementById('robot-manufacturer').value = robot.manufacturer || '';
    document.getElementById('robot-year').value = robot.year || '';
    document.getElementById('robot-category').value = robot.category || '';
    document.getElementById('robot-short-desc').value = robot.description || '';
    document.getElementById('robot-featured').checked = robot.featured || false;
    
    // Detailed information
    // Strip HTML tags for the editor
    let fullDescription = robot.content || '';
    fullDescription = fullDescription.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<br>/g, '\n');
    fullDescription = fullDescription.trim();
    
    document.getElementById('robot-full-desc').value = fullDescription;
    
    // Specifications
    let specs = '';
    if (robot.specifications) {
        Object.entries(robot.specifications).forEach(([key, value]) => {
            specs += `${key}: ${value}\n`;
        });
    }
    document.getElementById('robot-specs').value = specs;
    
    // Capabilities
    let capabilities = '';
    if (robot.features && Array.isArray(robot.features)) {
        capabilities = robot.features.join('\n');
    }
    document.getElementById('robot-capabilities').value = capabilities;
    
    // Additional information
    document.getElementById('robot-website').value = robot.officialWebsite || '';
    
    // Tags
    if (robot.tags && Array.isArray(robot.tags)) {
        document.getElementById('robot-tags').value = robot.tags.join(', ');
    }
    
    // Main image
    const mainImagePreview = document.getElementById('current-main-image-preview');
    if (mainImagePreview && robot.mainImage) {
        mainImagePreview.src = `../${robot.mainImage}`;
        mainImagePreview.alt = robot.name;
    }
    
    // Set up "View Robot" button
    const viewRobotBtn = document.getElementById('view-robot-btn');
    if (viewRobotBtn && robot.slug) {
        viewRobotBtn.href = `../robots/${robot.slug}.html`;
    }
}

/**
 * Initialize the edit robot form
 */
function initEditRobotForm() {
    const editRobotForm = document.getElementById('edit-robot-form');
    
    if (!editRobotForm) return;
    
    // Handle form submission
    editRobotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateRobotForm()) {
            return;
        }
        
        // Collect form data
        const robotData = collectFormData();
        
        // Update the robot
        updateRobotData(robotData);
    });
}

/**
 * Initialize delete functionality
 */
function initDeleteFunctionality() {
    const deleteRobotBtn = document.getElementById('delete-robot-btn');
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const closeModalBtn = document.querySelector('#delete-confirm-modal .close-modal');
    
    if (!deleteRobotBtn || !deleteModal || !confirmDeleteBtn || !cancelDeleteBtn || !closeModalBtn) return;
    
    // Open delete confirmation modal
    deleteRobotBtn.addEventListener('click', function() {
        // Get robot data from form
        const robotId = document.getElementById('robot-id').value;
        const robotName = document.getElementById('robot-name').value;
        const robotDesc = document.getElementById('robot-short-desc').value;
        
        // Update modal content
        document.getElementById('delete-preview-name').textContent = robotName;
        document.getElementById('delete-preview-description').textContent = robotDesc || 'No description available.';
        
        // Set robot ID for confirm button
        confirmDeleteBtn.dataset.robotId = robotId;
        
        // Show modal
        deleteModal.style.display = 'block';
    });
    
    // Close modal buttons
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });
    
    closeModalBtn.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });
    
    // Confirm delete button
    confirmDeleteBtn.addEventListener('click', function() {
        const robotId = this.dataset.robotId;
        
        if (robotId) {
            deleteRobotData(robotId);
        }
        
        // Close modal
        deleteModal.style.display = 'none';
    });
}

/**
 * Validate the robot form
 */
function validateRobotForm() {
    const form = document.getElementById('edit-robot-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            
            // Add error styling
            field.classList.add('input-error');
        } else {
            // Remove error styling
            field.classList.remove('input-error');
        }
    });
    
    return isValid;
}

/**
 * Collect form data for robot
 */
function collectFormData() {
    // Get ID and slug
    const id = document.getElementById('robot-id').value;
    const slug = document.getElementById('robot-slug').value;
    
    // Basic information
    const name = document.getElementById('robot-name').value;
    const manufacturer = document.getElementById('robot-manufacturer').value;
    const year = document.getElementById('robot-year').value;
    const category = document.getElementById('robot-category').value;
    const description = document.getElementById('robot-short-desc').value;
    const featured = document.getElementById('robot-featured').checked;
    
    // Detailed information
    const content = document.getElementById('robot-full-desc').value;
    const specsRaw = document.getElementById('robot-specs').value;
    const capabilities = document.getElementById('robot-capabilities').value;
    
    // Parse specifications
    const specifications = {};
    
    if (specsRaw.trim()) {
        const specLines = specsRaw.split('\n');
        
        specLines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':').map(item => item.trim());
                if (key && value) {
                    specifications[key.toLowerCase()] = value;
                }
            }
        });
    }
    
    // Parse features from capabilities
    const features = capabilities.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    
    // Additional information
    const website = document.getElementById('robot-website').value;
    
    // Tags
    const tagsInput = document.getElementById('robot-tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // Construct the robot object, starting with the original data
    const robotData = {
        ...originalRobot,
        id,
        slug,
        name,
        manufacturer,
        year: parseInt(year) || new Date().getFullYear(),
        category,
        description,
        content: `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
        specifications,
        features,
        officialWebsite: website,
        tags,
        featured
    };
    
    return robotData;
}

/**
 * Update robot data
 */
function updateRobotData(robotData) {
    try {
        // Update the robot
        const updatedRobot = updateRobot(robotData.id, robotData);
        
        // Log the activity
        logActivity('edit', `Robot "${updatedRobot.name}" was updated`);
        
        // Show success message
        showSuccess(`Robot "${updatedRobot.name}" has been updated successfully!`);
        
        // Ask if user wants to view the updated robot
        setTimeout(() => {
            if (confirm('Would you like to view the updated robot page?')) {
                window.location.href = `../robots/${updatedRobot.slug}.html`;
            } else {
                // Reload the page to refresh the form
                window.location.reload();
            }
        }, 500);
    } catch (error) {
        console.error('Error updating robot:', error);
        showError('An error occurred while updating the robot. Please try again.');
    }
}

/**
 * Delete a robot
 */
function deleteRobotData(robotId) {
    try {
        // Get the robot name for logging
        const robotName = originalRobot ? originalRobot.name : 'Unknown Robot';
        
        // Delete the robot
        deleteRobot(robotId);
        
        // Log the activity
        logActivity('delete', `Robot "${robotName}" was deleted`);
        
        // Show success message
        showSuccess(`Robot "${robotName}" has been deleted successfully!`);
        
        // Redirect to robots list
        setTimeout(() => {
            window.location.href = 'robots.html';
        }, 1500);
    } catch (error) {
        console.error('Error deleting robot:', error);
        showError('An error occurred while deleting the robot. Please try again.');
    }
}

/**
 * Show a success message
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
