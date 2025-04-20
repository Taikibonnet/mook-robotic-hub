/**
 * MOOK Robotics Hub - Add Robot Page JavaScript
 * 
 * This file contains the logic for the add robot form,
 * including validation, image handling, and data submission.
 */

import { createRobot } from '../../js/robot-service.js';
import { logActivity } from './dashboard.js';

// Keep track of selected images
let mainImageFile = null;
let galleryImageFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    initAddRobotForm();
    initImageUploads();
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
 * Initialize image upload functionality
 */
function initImageUploads() {
    // Main image upload
    initMainImageUpload();
    
    // Additional images upload
    initGalleryImagesUpload();
    
    // Initialize drag and drop for file uploads
    initDragAndDrop();
}

/**
 * Initialize main image upload functionality
 */
function initMainImageUpload() {
    const mainImageInput = document.getElementById('main-image-input');
    const mainImagePreview = document.getElementById('main-image-preview');
    const mainImagePreviewImg = document.getElementById('main-image-preview-img');
    const removeMainImage = document.getElementById('remove-main-image');
    const mainImageUpload = document.getElementById('main-image-upload');
    
    if (!mainImageInput || !mainImagePreview || !mainImagePreviewImg || !removeMainImage || !mainImageUpload) return;
    
    // Handle file selection
    mainImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                showError('Please select an image file (JPEG, PNG, etc.)');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('Image file is too large. Maximum size is 5MB.');
                return;
            }
            
            // Store the file
            mainImageFile = file;
            
            // Create a URL for the file
            const imageUrl = URL.createObjectURL(file);
            
            // Show preview
            mainImagePreviewImg.src = imageUrl;
            mainImagePreview.style.display = 'flex';
            mainImageUpload.style.display = 'none';
        }
    });
    
    // Handle image removal
    removeMainImage.addEventListener('click', function() {
        // Clear the input
        mainImageInput.value = '';
        
        // Clear the stored file
        mainImageFile = null;
        
        // Hide preview
        mainImagePreview.style.display = 'none';
        mainImageUpload.style.display = 'block';
    });
}

/**
 * Initialize additional images upload functionality
 */
function initGalleryImagesUpload() {
    const additionalImagesInput = document.getElementById('additional-images-input');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    
    if (!additionalImagesInput || !additionalImagesPreview || !additionalImagesUpload) return;
    
    // Handle file selection
    additionalImagesInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            // Clear the gallery array
            galleryImageFiles = [];
            
            // Clear existing previews
            additionalImagesPreview.innerHTML = '';
            
            // Process each file
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                
                // Check if file is an image
                if (!file.type.startsWith('image/')) {
                    showError(`File "${file.name}" is not an image. Skipping.`);
                    continue;
                }
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showError(`Image "${file.name}" is too large. Maximum size is 5MB. Skipping.`);
                    continue;
                }
                
                // Store the file
                galleryImageFiles.push(file);
                
                // Create a URL for the file
                const imageUrl = URL.createObjectURL(file);
                
                // Create preview element
                const previewContainer = document.createElement('div');
                previewContainer.className = 'gallery-item';
                
                previewContainer.innerHTML = `
                    <img src="${imageUrl}" alt="Preview">
                    <button type="button" class="remove-gallery-item" data-index="${galleryImageFiles.length - 1}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Add to preview container
                additionalImagesPreview.appendChild(previewContainer);
                
                // Add remove functionality
                const removeBtn = previewContainer.querySelector('.remove-gallery-item');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        const index = parseInt(this.dataset.index);
                        
                        // Remove from gallery array
                        galleryImageFiles.splice(index, 1);
                        
                        // Remove preview
                        previewContainer.remove();
                        
                        // Update indices on remaining buttons
                        const remainingButtons = additionalImagesPreview.querySelectorAll('.remove-gallery-item');
                        remainingButtons.forEach((btn, idx) => {
                            btn.dataset.index = idx;
                        });
                        
                        // Show upload area if no images left
                        if (galleryImageFiles.length === 0) {
                            additionalImagesUpload.style.display = 'block';
                            additionalImagesPreview.style.display = 'none';
                        }
                    });
                }
            }
            
            // Show/hide upload area
            if (galleryImageFiles.length > 0) {
                additionalImagesUpload.style.display = 'none';
                additionalImagesPreview.style.display = 'flex';
            } else {
                additionalImagesUpload.style.display = 'block';
                additionalImagesPreview.style.display = 'none';
            }
        }
    });
}

/**
 * Initialize drag and drop functionality for file uploads
 */
function initDragAndDrop() {
    // Main image drop zone
    const mainImageUpload = document.getElementById('main-image-upload');
    const mainImageInput = document.getElementById('main-image-input');
    
    if (mainImageUpload && mainImageInput) {
        // Highlight drop zone on drag over
        mainImageUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('file-upload-active');
        });
        
        mainImageUpload.addEventListener('dragleave', function() {
            this.classList.remove('file-upload-active');
        });
        
        // Handle file drop
        mainImageUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('file-upload-active');
            
            if (e.dataTransfer.files.length > 0) {
                // Create a new FileList with just the first file
                const file = e.dataTransfer.files[0];
                
                // Set the file to the input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                mainImageInput.files = dataTransfer.files;
                
                // Trigger change event
                const event = new Event('change');
                mainImageInput.dispatchEvent(event);
            }
        });
    }
    
    // Additional images drop zone
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    const additionalImagesInput = document.getElementById('additional-images-input');
    
    if (additionalImagesUpload && additionalImagesInput) {
        // Highlight drop zone on drag over
        additionalImagesUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('file-upload-active');
        });
        
        additionalImagesUpload.addEventListener('dragleave', function() {
            this.classList.remove('file-upload-active');
        });
        
        // Handle file drop
        additionalImagesUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('file-upload-active');
            
            if (e.dataTransfer.files.length > 0) {
                // Create a new FileList with all dropped files
                const files = e.dataTransfer.files;
                
                // Set the files to the input
                additionalImagesInput.files = files;
                
                // Trigger change event
                const event = new Event('change');
                additionalImagesInput.dispatchEvent(event);
            }
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
    
    // Image paths - will be set by the saveRobot function
    // We're storing the files in the variables mainImageFile and galleryImageFiles
    
    // For preview, use placeholder or blob URL
    let mainImageUrl = 'images/robots/placeholder.jpg';
    if (mainImageFile) {
        mainImageUrl = URL.createObjectURL(mainImageFile);
    }
    
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
        mainImage: mainImageUrl,
        mainImageFile: mainImageFile,
        galleryImageFiles: galleryImageFiles,
        officialWebsite: website,
        tags,
        featured: false
    };
}

/**
 * Save a new robot
 * @param {Object} robotData - Robot data object
 */
async function saveRobot(robotData) {
    try {
        // Process images
        let mainImagePath = 'images/robots/placeholder.jpg';
        const galleryPaths = [];
        
        // Process main image
        if (robotData.mainImageFile) {
            // In a real application, this would upload the file to a server
            // For our static implementation, we'll use a data URL
            mainImagePath = await fileToDataUrl(robotData.mainImageFile);
        }
        
        // Process gallery images
        if (robotData.galleryImageFiles && robotData.galleryImageFiles.length > 0) {
            for (const file of robotData.galleryImageFiles) {
                const galleryPath = await fileToDataUrl(file);
                galleryPaths.push(galleryPath);
            }
        }
        
        // Update the robot data with the processed image paths
        const robotToSave = {
            ...robotData,
            mainImage: mainImagePath,
            gallery: galleryPaths
        };
        
        // Remove the file objects
        delete robotToSave.mainImageFile;
        delete robotToSave.galleryImageFiles;
        
        // Create the robot
        const createdRobot = createRobot(robotToSave);
        
        // Log the activity
        logActivity('robot', `New robot "${createdRobot.name}" was added`);
        
        // Show success message
        showSuccess(`Robot "${createdRobot.name}" has been added successfully!`);
        
        // Reset form
        document.getElementById('add-robot-form').reset();
        
        // Clear image previews
        resetImagePreviews();
        
        // Ask if user wants to view the new robot
        setTimeout(() => {
            if (confirm('Would you like to view the new robot page?')) {
                window.location.href = `../robots/${createdRobot.slug}.html`;
            }
        }, 500);
    } catch (error) {
        console.error('Error saving robot:', error);
        showError('An error occurred while saving the robot. Please try again.');
    }
}

/**
 * Reset image previews
 */
function resetImagePreviews() {
    // Reset main image
    const mainImagePreview = document.getElementById('main-image-preview');
    const mainImageUpload = document.getElementById('main-image-upload');
    
    if (mainImagePreview && mainImageUpload) {
        mainImagePreview.style.display = 'none';
        mainImageUpload.style.display = 'block';
    }
    
    // Reset gallery images
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    
    if (additionalImagesPreview && additionalImagesUpload) {
        additionalImagesPreview.innerHTML = '';
        additionalImagesPreview.style.display = 'none';
        additionalImagesUpload.style.display = 'block';
    }
    
    // Reset file variables
    mainImageFile = null;
    galleryImageFiles = [];
}

/**
 * Convert a file to a data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Data URL
 */
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Show a preview of the robot page
 * @param {Object} robotData - Robot data object
 */
function showRobotPreview(robotData) {
    // Create a modal for preview
    const previewModal = document.createElement('div');
    previewModal.className = 'admin-modal';
    previewModal.id = 'robot-preview-modal';
    
    // Format content for display
    const previewContent = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>Robot Preview: ${robotData.name}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="robot-preview-container">
                    <div class="robot-preview-image">
                        <img src="${robotData.mainImage}" alt="${robotData.name}">
                    </div>
                    <div class="robot-preview-details">
                        <h2>${robotData.name}</h2>
                        <p class="robot-preview-meta">
                            <span class="robot-manufacturer">${robotData.manufacturer || 'Unknown Manufacturer'}</span>
                            <span class="robot-category">${robotData.category || 'Uncategorized'}</span>
                            <span class="robot-year">${robotData.year}</span>
                        </p>
                        <div class="robot-preview-description">
                            <p>${robotData.description}</p>
                        </div>
                        <div class="robot-preview-specs">
                            <h3>Specifications</h3>
                            <ul>
                                ${Object.entries(robotData.specifications).map(([key, value]) => 
                                    `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</li>`
                                ).join('')}
                            </ul>
                        </div>
                        <div class="robot-preview-features">
                            <h3>Features</h3>
                            <ul>
                                ${robotData.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="robot-preview-content">
                    <h3>Detailed Description</h3>
                    ${robotData.content}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" id="close-preview">Close</button>
            </div>
        </div>
    `;
    
    previewModal.innerHTML = previewContent;
    
    // Add to page
    document.body.appendChild(previewModal);
    
    // Add close functionality
    const closeBtn = previewModal.querySelector('.close-modal');
    const closePreviewBtn = previewModal.querySelector('#close-preview');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            previewModal.remove();
        });
    }
    
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', function() {
            previewModal.remove();
        });
    }
    
    // Show modal
    previewModal.style.display = 'block';
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

// Export functions for use in other scripts
export {
    initAddRobotForm,
    validateRobotForm,
    collectFormData,
    saveRobot
};
