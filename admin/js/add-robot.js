/**
 * MOOK Robotics Hub - Add Robot Page JavaScript
 * 
 * This file contains the logic for the add robot form,
 * including validation, image handling, and data submission.
 */

import { createRobot } from '../js/robot-service.js';

document.addEventListener('DOMContentLoaded', function() {
    initAddRobotForm();
});

/**
 * Initialize the add robot form
 */
function initAddRobotForm() {
    const addRobotForm = document.getElementById('add-robot-form');
    
    if (!addRobotForm) return;
    
    // Handle form submission
    addRobotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateRobotForm()) {
            return;
        }
        
        // Collect form data
        const robotData = collectFormData();
        
        // Save the robot
        saveRobot(robotData);
    });
    
    // Handle preview button
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            // Collect form data without validation
            const robotData = collectFormData(false);
            
            // Show preview
            showRobotPreview(robotData);
        });
    }
}

/**
 * Validate the robot form
 * @returns {boolean} True if valid, false otherwise
 */
function validateRobotForm() {
    const form = document.getElementById('add-robot-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            
            // Add error styling
            field.classList.add('input-error');
            
            // Find or create error message
            let errorMsg = field.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                field.parentNode.insertBefore(errorMsg, field.nextSibling);
            }
            
            errorMsg.textContent = 'This field is required';
        } else {
            // Remove error styling
            field.classList.remove('input-error');
            
            // Remove error message if it exists
            const errorMsg = field.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.remove();
            }
        }
    });
    
    return isValid;
}

/**
 * Collect form data for robot
 * @param {boolean} [validate=true] Whether to validate the data
 * @returns {Object} Robot data object
 */
function collectFormData(validate = true) {
    // Basic information
    const name = document.getElementById('robot-name').value;
    const manufacturer = document.getElementById('robot-manufacturer').value;
    const year = document.getElementById('robot-year').value;
    const category = document.getElementById('robot-category').value;
    const description = document.getElementById('robot-short-desc').value;
    
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
    
    // Image handling (placeholder for now)
    const mainImage = 'images/robots/placeholder.jpg';
    const gallery = [];
    
    // Return the constructed robot object
    return {
        name,
        manufacturer,
        year: parseInt(year) || new Date().getFullYear(),
        category,
        description,
        content: `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
        specifications,
        features,
        mainImage,
        gallery,
        officialWebsite: website,
        tags,
        featured: false
    };
}

/**
 * Save a new robot
 * @param {Object} robotData - Robot data object
 */
function saveRobot(robotData) {
    try {
        // Create the robot
        const createdRobot = createRobot(robotData);
        
        // Show success message
        alert(`Robot "${createdRobot.name}" has been added successfully!`);
        
        // Reset form
        document.getElementById('add-robot-form').reset();
        
        // Redirect to robot page (in a real app)
        if (confirm('Would you like to view the new robot page?')) {
            window.location.href = `../robots/${createdRobot.slug}.html`;
        }
    } catch (error) {
        console.error('Error saving robot:', error);
        alert('An error occurred while saving the robot. Please try again.');
    }
}

/**
 * Show a preview of the robot page
 * @param {Object} robotData - Robot data object
 */
function showRobotPreview(robotData) {
    // In a real application, this would open a modal or new tab with a preview
    alert('Preview functionality would be implemented here.');
    console.log('Robot Preview Data:', robotData);
}

// Export functions for use in other scripts
export {
    initAddRobotForm,
    validateRobotForm,
    collectFormData,
    saveRobot
};
