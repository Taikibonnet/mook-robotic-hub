/**
 * MOOK Robotics Hub - Add Robot JavaScript
 * 
 * This file contains code for handling the add robot form functionality.
 */

import { createRobot } from './robot-service.js';
import { uploadFile, uploadMultipleFiles, getFileUrl } from './file-upload-service.js';

// Track uploaded files
let mainImageFile = null;
let additionalImageFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    initImageUpload();
    initVideoUrlsAndReferences();
    initFormSubmission();
});

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
        additionalImagesPreview.innerHTML = '';
        additionalImageFiles = []; // Reset the additional images array
        
        // Limit to 5 images
        const maxImages = Math.min(files.length, 5);
        
        for (let i = 0; i < maxImages; i++) {
            const reader = new FileReader();
            const file = files[i];
            
            // Store the file for later upload
            additionalImageFiles.push(file);
            
            reader.onload = function(e) {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                const fileIndex = i; // Capture the current index
                
                galleryItem.innerHTML = `
                    <img src="${e.target.result}" alt="Additional image">
                    <button type="button" class="remove-gallery-image">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                additionalImagesPreview.appendChild(galleryItem);
                
                // Add remove button functionality
                galleryItem.querySelector('.remove-gallery-image').addEventListener('click', function() {
                    galleryItem.remove();
                    
                    // Remove the file from the array
                    additionalImageFiles = additionalImageFiles.filter((_, index) => index !== fileIndex);
                    
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
    
    if (videoUrls) {
        // Get the initial add button
        const addVideoBtn = videoUrls.querySelector('.add-video-btn');
        
        if (addVideoBtn) {
            addVideoBtn.addEventListener('click', function() {
                // Create a new video URL input
                const newVideoUrl = document.createElement('div');
                newVideoUrl.className = 'video-url-input';
                
                newVideoUrl.innerHTML = `
                    <input type="url" class="form-control" placeholder="YouTube or Vimeo URL">
                    <button type="button" class="remove-video-btn">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                videoUrls.appendChild(newVideoUrl);
                
                // Add remove button functionality
                newVideoUrl.querySelector('.remove-video-btn').addEventListener('click', function() {
                    newVideoUrl.remove();
                });
                
                // Convert the first button to a remove button if it's not already
                const firstVideoInput = videoUrls.querySelector('.video-url-input:first-child');
                const firstButton = firstVideoInput.querySelector('button');
                
                if (firstButton.classList.contains('add-video-btn')) {
                    firstButton.className = 'remove-video-btn';
                    firstButton.innerHTML = '<i class="fas fa-times"></i>';
                    
                    // Remove the old event listener (this is tricky, but we'll recreate the button)
                    const newButton = firstButton.cloneNode(true);
                    firstButton.parentNode.replaceChild(newButton, firstButton);
                    
                    newButton.addEventListener('click', function() {
                        firstVideoInput.remove();
                    });
                    
                    // Add a new add button to the last video input
                    const addButton = document.createElement('button');
                    addButton.type = 'button';
                    addButton.className = 'add-video-btn';
                    addButton.innerHTML = '<i class="fas fa-plus"></i>';
                    
                    addButton.addEventListener('click', arguments.callee); // Reference the same function
                    
                    newVideoUrl.appendChild(addButton);
                }
            });
        }
    }
    
    // References
    const references = document.getElementById('references');
    
    if (references) {
        // Get the initial add button
        const addReferenceBtn = references.querySelector('.add-reference-btn');
        
        if (addReferenceBtn) {
            addReferenceBtn.addEventListener('click', function() {
                // Create a new reference input
                const newReference = document.createElement('div');
                newReference.className = 'reference-input';
                
                newReference.innerHTML = `
                    <input type="text" class="form-control" placeholder="Reference title or URL">
                    <button type="button" class="remove-reference-btn">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                references.appendChild(newReference);
                
                // Add remove button functionality
                newReference.querySelector('.remove-reference-btn').addEventListener('click', function() {
                    newReference.remove();
                });
                
                // Convert the first button to a remove button if it's not already
                const firstReferenceInput = references.querySelector('.reference-input:first-child');
                const firstButton = firstReferenceInput.querySelector('button');
                
                if (firstButton.classList.contains('add-reference-btn')) {
                    firstButton.className = 'remove-reference-btn';
                    firstButton.innerHTML = '<i class="fas fa-times"></i>';
                    
                    // Remove the old event listener (recreate the button)
                    const newButton = firstButton.cloneNode(true);
                    firstButton.parentNode.replaceChild(newButton, firstButton);
                    
                    newButton.addEventListener('click', function() {
                        firstReferenceInput.remove();
                    });
                    
                    // Add a new add button to the last reference input
                    const addButton = document.createElement('button');
                    addButton.type = 'button';
                    addButton.className = 'add-reference-btn';
                    addButton.innerHTML = '<i class="fas fa-plus"></i>';
                    
                    addButton.addEventListener('click', arguments.callee); // Reference the same function
                    
                    newReference.appendChild(addButton);
                }
            });
        }
    }
}

/**
 * Initialize form submission
 */
function initFormSubmission() {
    const addRobotForm = document.getElementById('add-robot-form');
    const previewBtn = document.getElementById('preview-btn');
    
    if (!addRobotForm) return;
    
    // Handle form submission
    addRobotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Show loading state
            const submitBtn = addRobotForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Upload files first
            let mainImagePath = 'images/robots/placeholder.jpg'; // Default
            let galleryPaths = [];
            
            // Upload main image if one was selected
            if (mainImageFile) {
                try {
                    mainImagePath = await uploadFile(mainImageFile, 'robots');
                } catch (error) {
                    console.error('Error uploading main image:', error);
                    alert('There was an error uploading the main image. Using placeholder instead.');
                }
            }
            
            // Upload additional images if any were selected
            if (additionalImageFiles.length > 0) {
                try {
                    galleryPaths = await uploadMultipleFiles(additionalImageFiles, 'robots');
                } catch (error) {
                    console.error('Error uploading additional images:', error);
                    alert('There was an error uploading some additional images.');
                }
            }
            
            // Get form data
            const robotData = await getFormData(mainImagePath, galleryPaths);
            
            // Validate required fields
            if (!robotData.name || !robotData.category) {
                alert('Please fill in all required fields (Name and Category are required).');
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                return;
            }
            
            // Create the robot
            const createdRobot = createRobot(robotData);
            
            // Show success message
            alert(`Robot "${createdRobot.name}" has been saved successfully! You can now view it in the encyclopedia.`);
            
            // Reset form
            addRobotForm.reset();
            resetFormPreviews();
            
            // Redirect to encyclopedia page
            setTimeout(() => {
                window.location.href = '../robots/index.html';
            }, 1000);
        } catch (error) {
            console.error('Error creating robot:', error);
            alert('There was an error saving the robot. Please try again.');
            
            // Reset button state
            const submitBtn = addRobotForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Save Robot';
            submitBtn.disabled = false;
        }
    });
    
    // Handle preview
    if (previewBtn) {
        previewBtn.addEventListener('click', async function() {
            try {
                // Get form data (without uploading files)
                const mainImagePreviewImg = document.getElementById('main-image-preview-img');
                let mainImageTemp = 'images/robots/placeholder.jpg';
                
                if (mainImagePreviewImg && mainImagePreviewImg.src) {
                    mainImageTemp = mainImagePreviewImg.src;
                }
                
                // Collect temporary gallery paths (data URLs)
                const galleryTemp = [];
                const galleryItems = document.querySelectorAll('#additional-images-preview .gallery-item img');
                galleryItems.forEach(img => {
                    galleryTemp.push(img.src);
                });
                
                // Get form data
                const robotData = await getFormData(mainImageTemp, galleryTemp);
                
                // Store in session storage for preview
                sessionStorage.setItem('robotPreview', JSON.stringify(robotData));
                
                // Open preview in new tab/window
                window.open(`../robots/robot.html?slug=preview&preview=true`, '_blank');
            } catch (error) {
                console.error('Error creating preview:', error);
                alert('There was an error generating the preview. Please try again.');
            }
        });
    }
    
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
        const features = [...capabilitiesList, ...applicationsList];
        
        // Return the structured robot data
        return {
            name,
            slug: createSlug(name),
            description: shortDesc,
            manufacturer,
            year: parseInt(year) || new Date().getFullYear(),
            category,
            specifications: specsList,
            features: features.length > 0 ? features : capabilitiesList,
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
    
    /**
     * Create a URL-friendly slug from a name
     * @param {string} name - Robot name
     * @returns {string} Slug
     */
    function createSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/--+/g, '-') // Replace multiple hyphens with a single one
            .trim(); // Trim extra spaces
    }
    
    /**
     * Reset form previews
     */
    function resetFormPreviews() {
        // Reset files
        mainImageFile = null;
        additionalImageFiles = [];
        
        // Reset main image
        const mainImagePreview = document.getElementById('main-image-preview');
        const mainImageUpload = document.getElementById('main-image-upload');
        
        if (mainImagePreview) mainImagePreview.style.display = 'none';
        if (mainImageUpload) mainImageUpload.style.display = 'block';
        
        // Reset additional images
        const additionalImagesPreview = document.getElementById('additional-images-preview');
        if (additionalImagesPreview) additionalImagesPreview.innerHTML = '';
        
        // Reset video URLs
        const videoUrls = document.getElementById('video-urls');
        if (videoUrls) {
            // Remove all but the first video URL input
            const videoInputs = videoUrls.querySelectorAll('.video-url-input');
            
            for (let i = 1; i < videoInputs.length; i++) {
                videoInputs[i].remove();
            }
            
            // Reset the first one
            if (videoInputs.length > 0) {
                const firstInput = videoInputs[0];
                const input = firstInput.querySelector('input');
                
                if (input) input.value = '';
                
                // Make sure the button is an add button
                const button = firstInput.querySelector('button');
                
                if (button && !button.classList.contains('add-video-btn')) {
                    button.className = 'add-video-btn';
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                }
            }
        }
        
        // Reset references
        const references = document.getElementById('references');
        if (references) {
            // Remove all but the first reference input
            const referenceInputs = references.querySelectorAll('.reference-input');
            
            for (let i = 1; i < referenceInputs.length; i++) {
                referenceInputs[i].remove();
            }
            
            // Reset the first one
            if (referenceInputs.length > 0) {
                const firstInput = referenceInputs[0];
                const input = firstInput.querySelector('input');
                
                if (input) input.value = '';
                
                // Make sure the button is an add button
                const button = firstInput.querySelector('button');
                
                if (button && !button.classList.contains('add-reference-btn')) {
                    button.className = 'add-reference-btn';
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                }
            }
        }
    }
}
