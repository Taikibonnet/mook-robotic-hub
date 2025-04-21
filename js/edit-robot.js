/**
 * MOOK Robotics Hub - Edit Robot JavaScript
 * 
 * This file contains code for handling the edit robot form functionality.
 */

import { getRobotById, updateRobot } from './robot-service.js';
import { uploadFile, uploadMultipleFiles, getFileUrl } from './file-upload-service.js';

// Track uploaded files
let mainImageFile = null;
let additionalImageFiles = [];
let currentRobot = null;
let existingGalleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    // Get robot ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const robotId = urlParams.get('id');
    
    if (!robotId) {
        showError('No robot ID specified');
        return;
    }
    
    // Load robot data
    loadRobotData(robotId);
    
    // Initialize form handlers
    initImageUpload();
    initVideoUrlsAndReferences();
    initFormSubmission();
});

/**
 * Load robot data from storage
 * @param {string} robotId - Robot ID to load
 */
function loadRobotData(robotId) {
    try {
        // Get robot data
        currentRobot = getRobotById(robotId);
        
        if (!currentRobot) {
            showError('Robot not found');
            return;
        }
        
        // Update page title
        document.title = `Edit ${currentRobot.name} - MOOK Robotics Hub`;
        
        // Update form title
        const panelTitle = document.querySelector('.panel-title');
        if (panelTitle) {
            panelTitle.textContent = `Edit Robot: ${currentRobot.name}`;
        }
        
        // Populate form fields
        populateFormFields(currentRobot);
        
    } catch (error) {
        console.error('Error loading robot data:', error);
        showError('Failed to load robot data');
    }
}

/**
 * Populate form fields with robot data
 * @param {Object} robot - Robot data object
 */
function populateFormFields(robot) {
    // Basic info
    document.getElementById('robot-name').value = robot.name || '';
    document.getElementById('robot-manufacturer').value = robot.manufacturer || '';
    document.getElementById('robot-year').value = robot.year || '';
    document.getElementById('robot-category').value = robot.category || '';
    document.getElementById('robot-short-desc').value = robot.description || '';
    
    // Detailed info
    document.getElementById('robot-full-desc').value = stripHtmlToPlainText(robot.content) || '';
    
    // Specifications
    let specsText = '';
    if (robot.specifications) {
        for (const [key, value] of Object.entries(robot.specifications)) {
            specsText += `${key}: ${value}\n`;
        }
    }
    document.getElementById('robot-specs').value = specsText;
    
    // Capabilities and applications
    let capabilities = '';
    let applications = '';
    
    if (robot.features && Array.isArray(robot.features)) {
        // If we have separate applications, use those
        if (robot.applications && Array.isArray(robot.applications)) {
            capabilities = robot.features.join('\n');
            applications = robot.applications.join('\n');
        } else {
            // Otherwise, just populate capabilities with features
            capabilities = robot.features.join('\n');
        }
    }
    
    document.getElementById('robot-capabilities').value = capabilities;
    document.getElementById('robot-applications').value = applications;
    
    // Main image
    if (robot.mainImage) {
        // Display the existing image
        const mainImagePreview = document.getElementById('main-image-preview');
        const mainImagePreviewImg = document.getElementById('main-image-preview-img');
        const mainImageUpload = document.getElementById('main-image-upload');
        
        if (mainImagePreview && mainImagePreviewImg && mainImageUpload) {
            // Use getFileUrl to handle both local and uploaded images
            mainImagePreviewImg.src = getFileUrl(robot.mainImage);
            mainImagePreview.style.display = 'flex';
            mainImageUpload.style.display = 'none';
        }
    }
    
    // Gallery images
    if (robot.gallery && Array.isArray(robot.gallery) && robot.gallery.length > 0) {
        existingGalleryImages = [...robot.gallery]; // Store existing gallery images
        
        const additionalImagesPreview = document.getElementById('additional-images-preview');
        if (additionalImagesPreview) {
            robot.gallery.forEach((imagePath, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.dataset.imagePath = imagePath; // Store the image path for reference
                
                galleryItem.innerHTML = `
                    <img src="${getFileUrl(imagePath)}" alt="Additional image">
                    <button type="button" class="remove-gallery-image" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                additionalImagesPreview.appendChild(galleryItem);
                
                // Add remove button functionality
                galleryItem.querySelector('.remove-gallery-image').addEventListener('click', function() {
                    const imageIndex = parseInt(this.dataset.index);
                    removeGalleryImage(imageIndex, galleryItem);
                });
            });
        }
    }
    
    // Video URLs
    if (robot.videos && Array.isArray(robot.videos) && robot.videos.length > 0) {
        const videoUrls = document.getElementById('video-urls');
        if (videoUrls) {
            // Clear default video input
            videoUrls.innerHTML = '';
            
            // Add each video URL
            robot.videos.forEach((videoUrl, index) => {
                const videoUrlInput = document.createElement('div');
                videoUrlInput.className = 'video-url-input';
                
                videoUrlInput.innerHTML = `
                    <input type="url" class="form-control" placeholder="YouTube or Vimeo URL" value="${videoUrl}">
                    <button type="button" class="remove-video-btn">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Add the input to the container
                videoUrls.appendChild(videoUrlInput);
                
                // Add remove button functionality
                videoUrlInput.querySelector('.remove-video-btn').addEventListener('click', function() {
                    videoUrlInput.remove();
                });
                
                // Add "Add" button to the last item
                if (index === robot.videos.length - 1) {
                    const addButton = document.createElement('button');
                    addButton.type = 'button';
                    addButton.className = 'add-video-btn';
                    addButton.innerHTML = '<i class="fas fa-plus"></i>';
                    
                    addButton.addEventListener('click', function() {
                        addVideoUrlField(videoUrls);
                    });
                    
                    videoUrlInput.appendChild(addButton);
                }
            });
        }
    }
    
    // References
    if (robot.references && Array.isArray(robot.references) && robot.references.length > 0) {
        const references = document.getElementById('references');
        if (references) {
            // Clear default reference input
            references.innerHTML = '';
            
            // Add each reference
            robot.references.forEach((reference, index) => {
                const referenceInput = document.createElement('div');
                referenceInput.className = 'reference-input';
                
                referenceInput.innerHTML = `
                    <input type="text" class="form-control" placeholder="Reference title or URL" value="${reference}">
                    <button type="button" class="remove-reference-btn">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Add the input to the container
                references.appendChild(referenceInput);
                
                // Add remove button functionality
                referenceInput.querySelector('.remove-reference-btn').addEventListener('click', function() {
                    referenceInput.remove();
                });
                
                // Add "Add" button to the last item
                if (index === robot.references.length - 1) {
                    const addButton = document.createElement('button');
                    addButton.type = 'button';
                    addButton.className = 'add-reference-btn';
                    addButton.innerHTML = '<i class="fas fa-plus"></i>';
                    
                    addButton.addEventListener('click', function() {
                        addReferenceField(references);
                    });
                    
                    referenceInput.appendChild(addButton);
                }
            });
        }
    }
    
    // Website URL
    if (robot.website) {
        document.getElementById('robot-website').value = robot.website;
    }
    
    // Tags
    if (robot.tags && Array.isArray(robot.tags)) {
        document.getElementById('robot-tags').value = robot.tags.join(', ');
    }
}

/**
 * Remove a gallery image
 * @param {number} index - Index of the image to remove
 * @param {HTMLElement} galleryItem - Gallery item element to remove
 */
function removeGalleryImage(index, galleryItem) {
    // Remove the gallery item from DOM
    galleryItem.remove();
    
    // Remove the image from the existing gallery array
    if (index >= 0 && index < existingGalleryImages.length) {
        existingGalleryImages.splice(index, index + 1);
    }
    
    // Update data-index attributes on remaining gallery items
    document.querySelectorAll('#additional-images-preview .gallery-item').forEach((item, i) => {
        item.querySelector('.remove-gallery-image').dataset.index = i;
    });
}

/**
 * Add a new video URL field
 * @param {HTMLElement} container - Container element for video URL inputs
 */
function addVideoUrlField(container) {
    // Create a new video URL input
    const newVideoUrl = document.createElement('div');
    newVideoUrl.className = 'video-url-input';
    
    newVideoUrl.innerHTML = `
        <input type="url" class="form-control" placeholder="YouTube or Vimeo URL">
        <button type="button" class="remove-video-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(newVideoUrl);
    
    // Add remove button functionality
    newVideoUrl.querySelector('.remove-video-btn').addEventListener('click', function() {
        newVideoUrl.remove();
    });
    
    // Move the "Add" button to the new input
    const addButton = container.querySelector('.add-video-btn');
    if (addButton) {
        addButton.remove();
    }
    
    // Create new "Add" button
    const addNewButton = document.createElement('button');
    addNewButton.type = 'button';
    addNewButton.className = 'add-video-btn';
    addNewButton.innerHTML = '<i class="fas fa-plus"></i>';
    
    addNewButton.addEventListener('click', function() {
        addVideoUrlField(container);
    });
    
    newVideoUrl.appendChild(addNewButton);
}

/**
 * Add a new reference field
 * @param {HTMLElement} container - Container element for reference inputs
 */
function addReferenceField(container) {
    // Create a new reference input
    const newReference = document.createElement('div');
    newReference.className = 'reference-input';
    
    newReference.innerHTML = `
        <input type="text" class="form-control" placeholder="Reference title or URL">
        <button type="button" class="remove-reference-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(newReference);
    
    // Add remove button functionality
    newReference.querySelector('.remove-reference-btn').addEventListener('click', function() {
        newReference.remove();
    });
    
    // Move the "Add" button to the new input
    const addButton = container.querySelector('.add-reference-btn');
    if (addButton) {
        addButton.remove();
    }
    
    // Create new "Add" button
    const addNewButton = document.createElement('button');
    addNewButton.type = 'button';
    addNewButton.className = 'add-reference-btn';
    addNewButton.innerHTML = '<i class="fas fa-plus"></i>';
    
    addNewButton.addEventListener('click', function() {
        addReferenceField(container);
    });
    
    newReference.appendChild(addNewButton);
}

/**
 * Initialize image upload functionality
 */
function initImageUpload() {
    // Main image upload
    const mainImageInput = document.getElementById('main-image-input');
    const mainImagePreview = document.getElementById('main-image-preview');
    const mainImagePreviewImg = document.getElementById('main-image-preview-img');
    const removeMainImage = document.getElementById('remove-main-image');
    const mainImageUpload = document.getElementById('main-image-upload');
    
    if (mainImageInput) {
        // Handle file drop
        const dropZone = mainImageUpload;
        
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('file-upload-dragover');
        });
        
        dropZone.addEventListener('dragleave', function() {
            dropZone.classList.remove('file-upload-dragover');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('file-upload-dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                mainImageInput.files = e.dataTransfer.files;
                handleMainImageChange(e.dataTransfer.files[0]);
            }
        });
        
        // Handle file select
        mainImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleMainImageChange(this.files[0]);
            }
        });
    }
    
    function handleMainImageChange(file) {
        // Store the file for later upload
        mainImageFile = file;
        
        // Display preview
        const reader = new FileReader();
        reader.onload = function(e) {
            mainImagePreviewImg.src = e.target.result;
            mainImagePreview.style.display = 'flex';
            mainImageUpload.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
    
    if (removeMainImage) {
        removeMainImage.addEventListener('click', function() {
            mainImageFile = null;
            mainImageInput.value = '';
            mainImagePreview.style.display = 'none';
            mainImageUpload.style.display = 'block';
        });
    }
    
    // Additional images upload
    const additionalImagesInput = document.getElementById('additional-images-input');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    
    if (additionalImagesInput) {
        // Handle file drop
        const dropZone = additionalImagesUpload;
        
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('file-upload-dragover');
        });
        
        dropZone.addEventListener('dragleave', function() {
            dropZone.classList.remove('file-upload-dragover');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('file-upload-dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                additionalImagesInput.files = e.dataTransfer.files;
                handleAdditionalImagesChange(e.dataTransfer.files);
            }
        });
        
        // Handle file select
        additionalImagesInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                handleAdditionalImagesChange(this.files);
            }
        });
    }
    
    function handleAdditionalImagesChange(files) {
        // Don't clear the preview if we already have images loaded from existing robot data
        
        // Limit to 5 new images
        const maxNewImages = Math.min(files.length, 5);
        
        // Track the current count of gallery items
        const currentItemCount = additionalImagesPreview.querySelectorAll('.gallery-item').length;
        
        for (let i = 0; i < maxNewImages; i++) {
            const reader = new FileReader();
            const file = files[i];
            
            // Store the file for later upload
            additionalImageFiles.push(file);
            
            reader.onload = function(e) {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.dataset.isNew = 'true';
                const fileIndex = additionalImageFiles.length - 1; // Index of this file in additionalImageFiles
                
                galleryItem.innerHTML = `
                    <img src="${e.target.result}" alt="Additional image">
                    <button type="button" class="remove-gallery-image" data-new-index="${fileIndex}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                additionalImagesPreview.appendChild(galleryItem);
                
                // Add remove button functionality
                galleryItem.querySelector('.remove-gallery-image').addEventListener('click', function() {
                    const newIndex = parseInt(this.dataset.newIndex);
                    
                    // Remove the file from the additionalImageFiles array
                    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < additionalImageFiles.length) {
                        additionalImageFiles.splice(newIndex, 1);
                        
                        // Update new-index attributes on remaining new gallery items
                        document.querySelectorAll('[data-new-index]').forEach((button, idx) => {
                            const currentIndex = parseInt(button.dataset.newIndex);
                            if (currentIndex > newIndex) {
                                button.dataset.newIndex = currentIndex - 1;
                            }
                        });
                    }
                    
                    // Remove the gallery item from the DOM
                    galleryItem.remove();
                    
                    // If all images are removed, clear the input
                    if (additionalImagesPreview.children.length === 0) {
                        additionalImagesInput.value = '';
                    }
                });
            }
            
            reader.readAsDataURL(file);
        }
    }
}

/**
 * Initialize video URLs and references
 */
function initVideoUrlsAndReferences() {
    // Video URLs
    const videoUrls = document.getElementById('video-urls');
    
    if (videoUrls && !videoUrls.querySelector('.video-url-input')) {
        // If there are no video inputs already (from the loaded robot data), add a default one
        const defaultVideoUrl = document.createElement('div');
        defaultVideoUrl.className = 'video-url-input';
        
        defaultVideoUrl.innerHTML = `
            <input type="url" class="form-control" placeholder="YouTube or Vimeo URL">
            <button type="button" class="add-video-btn">
                <i class="fas fa-plus"></i>
            </button>
        `;
        
        videoUrls.appendChild(defaultVideoUrl);
        
        // Add button functionality
        defaultVideoUrl.querySelector('.add-video-btn').addEventListener('click', function() {
            addVideoUrlField(videoUrls);
        });
    }
    
    // References
    const references = document.getElementById('references');
    
    if (references && !references.querySelector('.reference-input')) {
        // If there are no reference inputs already (from the loaded robot data), add a default one
        const defaultReference = document.createElement('div');
        defaultReference.className = 'reference-input';
        
        defaultReference.innerHTML = `
            <input type="text" class="form-control" placeholder="Reference title or URL">
            <button type="button" class="add-reference-btn">
                <i class="fas fa-plus"></i>
            </button>
        `;
        
        references.appendChild(defaultReference);
        
        // Add button functionality
        defaultReference.querySelector('.add-reference-btn').addEventListener('click', function() {
            addReferenceField(references);
        });
    }
}

/**
 * Initialize form submission
 */
function initFormSubmission() {
    const editRobotForm = document.getElementById('edit-robot-form');
    
    if (!editRobotForm) return;
    
    // Handle form submission
    editRobotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentRobot) {
            showError('No robot data available');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = editRobotForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Prepare for file uploads
            let mainImagePath = currentRobot.mainImage; // Use existing image path by default
            let galleryPaths = [...existingGalleryImages]; // Start with existing gallery images
            
            // Upload main image if a new one was selected
            if (mainImageFile) {
                try {
                    mainImagePath = await uploadFile(mainImageFile, 'robots');
                } catch (error) {
                    console.error('Error uploading main image:', error);
                    alert('There was an error uploading the main image. Using existing image instead.');
                }
            }
            
            // Upload additional images if any new ones were selected
            if (additionalImageFiles.length > 0) {
                try {
                    const newGalleryPaths = await uploadMultipleFiles(additionalImageFiles, 'robots');
                    // Combine existing gallery paths with new ones
                    galleryPaths = [...galleryPaths, ...newGalleryPaths];
                } catch (error) {
                    console.error('Error uploading additional images:', error);
                    alert('There was an error uploading some additional images.');
                }
            }
            
            // Get form data with updated file paths
            const robotData = await getFormData(mainImagePath, galleryPaths);
            
            // Validate required fields
            if (!robotData.name || !robotData.category) {
                alert('Please fill in all required fields (Name and Category are required).');
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                return;
            }
            
            // Update the robot
            const updatedRobot = updateRobot(currentRobot.id, robotData);
            
            if (!updatedRobot) {
                throw new Error('Failed to update robot data');
            }
            
            // Show success message
            alert(`Robot "${updatedRobot.name}" has been updated successfully!`);
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            // Redirect to robots list
            window.location.href = 'robots.html';
            
        } catch (error) {
            console.error('Error updating robot:', error);
            alert('There was an error updating the robot. Please try again.');
            
            // Reset button state
            const submitBtn = editRobotForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Save Changes';
            submitBtn.disabled = false;
        }
    });
    
    /**
     * Get all form data as an object
     * @param {string} mainImagePath - Path to the main image
     * @param {Array} galleryPaths - Paths to gallery images
     * @returns {Object} Robot data
     */
    async function getFormData(mainImagePath, galleryPaths) {
        // Basic info
        const name = document.getElementById('robot-name').value;
        const manufacturer = document.getElementById('robot-manufacturer').value;
        const year = document.getElementById('robot-year').value;
        const category = document.getElementById('robot-category').value;
        const shortDesc = document.getElementById('robot-short-desc').value;
        
        // Detailed info
        const fullDesc = document.getElementById('robot-full-desc').value;
        const specs = document.getElementById('robot-specs').value;
        const capabilities = document.getElementById('robot-capabilities').value;
        const applications = document.getElementById('robot-applications').value;
        
        // Parse specifications into structured format
        const specsList = {};
        if (specs) {
            specs.split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim().toLowerCase();
                    const value = parts.slice(1).join(':').trim();
                    specsList[key] = value;
                }
            });
        }
        
        // Parse capabilities and applications into arrays
        const capabilitiesList = capabilities.split('\n').filter(Boolean).map(item => item.trim());
        const applicationsList = applications.split('\n').filter(Boolean).map(item => item.trim());
        
        // Get video URLs
        const videoList = [];
        const videoInputs = document.querySelectorAll('#video-urls .video-url-input input');
        
        videoInputs.forEach(input => {
            if (input.value) {
                videoList.push(input.value);
            }
        });
        
        // Get references
        const referencesList = [];
        const referenceInputs = document.querySelectorAll('#references .reference-input input');
        
        referenceInputs.forEach(input => {
            if (input.value) {
                referencesList.push(input.value);
            }
        });
        
        // Additional info
        const website = document.getElementById('robot-website').value;
        const tags = document.getElementById('robot-tags').value;
        const tagsList = tags ? tags.split(',').map(tag => tag.trim()) : [];
        
        // Formatted HTML content from full description
        const formattedContent = fullDesc ? `<p>${fullDesc.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : '';
        
        // Combine features from capabilities and applications
        const features = [...capabilitiesList];
        
        // Return the structured robot data
        return {
            name,
            description: shortDesc,
            manufacturer,
            year: parseInt(year) || new Date().getFullYear(),
            category,
            specifications: specsList,
            features,
            applications: applicationsList,
            mainImage: mainImagePath,
            gallery: galleryPaths,
            videos: videoList,
            references: referencesList,
            website,
            tags: tagsList,
            content: formattedContent
        };
    }
}

/**
 * Strip HTML to plain text
 * @param {string} html - HTML content to convert to plain text
 * @returns {string} Plain text
 */
function stripHtmlToPlainText(html) {
    if (!html) return '';
    
    // Create a temporary element
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Replace <br> tags with newlines
    const brElements = temp.querySelectorAll('br');
    for (const br of brElements) {
        br.replaceWith('\n');
    }
    
    // Replace paragraph closings with double newlines
    const content = temp.innerHTML
        .replace(/<\/p><p>/g, '\n\n')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<p>/g, '');
    
    // Set content of temp element to the modified HTML
    temp.innerHTML = content;
    
    // Get text content
    return temp.textContent || temp.innerText || '';
}

/**
 * Show error message on the page
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Find the main content area
    const content = document.querySelector('.admin-content');
    
    if (content) {
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'admin-message admin-message-error';
        
        errorMessage.innerHTML = `
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
        
        // Insert at the beginning of content
        content.insertBefore(errorMessage, content.firstChild);
        
        // Add close button functionality
        errorMessage.querySelector('.admin-message-close').addEventListener('click', function() {
            errorMessage.remove();
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.remove();
            }
        }, 5000);
    } else {
        // Fallback to alert if content area not found
        alert(`Error: ${message}`);
    }
}
