/**
 * MOOK Robotics Hub - Add News JavaScript
 * 
 * This file contains code for handling the add news form functionality.
 */

import { createNews } from './news-service.js';
import { getAllRobots } from './robot-service.js';
import { uploadFile, uploadMultipleFiles, getFileUrl } from './file-upload-service.js';

// Track uploaded files
let featuredImageFile = null;
let additionalImageFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    initImageUpload();
    initRelatedRobots();
    initExternalLinks();
    initFormSubmission();
});

/**
 * Initialize image upload functionality
 */
function initImageUpload() {
    // Featured image upload
    const featuredImageInput = document.getElementById('featured-image-input');
    const featuredImagePreview = document.getElementById('featured-image-preview');
    const featuredImagePreviewImg = document.getElementById('featured-image-preview-img');
    const removeFeaturedImage = document.getElementById('remove-featured-image');
    const featuredImageUpload = document.getElementById('featured-image-upload');
    
    // Handle featured image selection
    if (featuredImageInput) {
        // Add drag and drop functionality
        featuredImageUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            featuredImageUpload.classList.add('file-upload-dragover');
        });
        
        featuredImageUpload.addEventListener('dragleave', function() {
            featuredImageUpload.classList.remove('file-upload-dragover');
        });
        
        featuredImageUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            featuredImageUpload.classList.remove('file-upload-dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                featuredImageInput.files = e.dataTransfer.files;
                handleFeaturedImageChange(e.dataTransfer.files[0]);
            }
        });
        
        // Handle file selection
        featuredImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleFeaturedImageChange(this.files[0]);
            }
        });
    }
    
    function handleFeaturedImageChange(file) {
        // Store the file for later upload
        featuredImageFile = file;
        
        // Display preview
        const reader = new FileReader();
        reader.onload = function(e) {
            featuredImagePreviewImg.src = e.target.result;
            featuredImagePreview.style.display = 'flex';
            featuredImageUpload.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
    
    // Handle featured image removal
    if (removeFeaturedImage) {
        removeFeaturedImage.addEventListener('click', function() {
            featuredImageFile = null;
            featuredImageInput.value = '';
            featuredImagePreview.style.display = 'none';
            featuredImageUpload.style.display = 'block';
        });
    }
    
    // Additional images upload
    const additionalImagesInput = document.getElementById('additional-images-input');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    
    if (additionalImagesInput) {
        // Add drag and drop functionality
        additionalImagesUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            additionalImagesUpload.classList.add('file-upload-dragover');
        });
        
        additionalImagesUpload.addEventListener('dragleave', function() {
            additionalImagesUpload.classList.remove('file-upload-dragover');
        });
        
        additionalImagesUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            additionalImagesUpload.classList.remove('file-upload-dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                additionalImagesInput.files = e.dataTransfer.files;
                handleAdditionalImagesChange(e.dataTransfer.files);
            }
        });
        
        // Handle file selection
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
 * Initialize related robots dropdown
 */
function initRelatedRobots() {
    const relatedRobotsSelect = document.getElementById('related-robots');
    const addRelatedRobotBtn = document.getElementById('add-related-robot');
    const relatedRobotsList = document.getElementById('related-robots-list');
    
    if (!relatedRobotsSelect || !addRelatedRobotBtn || !relatedRobotsList) return;
    
    // Load robots for dropdown
    const robots = getAllRobots();
    
    // Populate dropdown
    robots.forEach(robot => {
        const option = document.createElement('option');
        option.value = robot.id;
        option.textContent = robot.name;
        relatedRobotsSelect.appendChild(option);
    });
    
    // Add related robot functionality
    addRelatedRobotBtn.addEventListener('click', function() {
        const selectedRobotId = relatedRobotsSelect.value;
        
        if (!selectedRobotId) return;
        
        const selectedRobot = robots.find(robot => robot.id === selectedRobotId);
        
        if (!selectedRobot) return;
        
        // Check if this robot is already added
        const existingRelated = document.querySelector(`[data-robot-id="${selectedRobotId}"]`);
        if (existingRelated) return;
        
        // Create related robot item
        const relatedRobotItem = document.createElement('div');
        relatedRobotItem.className = 'related-item';
        relatedRobotItem.dataset.robotId = selectedRobotId;
        
        relatedRobotItem.innerHTML = `
            <span>${selectedRobot.name}</span>
            <button type="button" class="remove-related-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        relatedRobotsList.appendChild(relatedRobotItem);
        
        // Add remove functionality
        relatedRobotItem.querySelector('.remove-related-btn').addEventListener('click', function() {
            relatedRobotItem.remove();
        });
        
        // Reset dropdown
        relatedRobotsSelect.value = '';
    });
}

/**
 * Initialize external links functionality
 */
function initExternalLinks() {
    const externalLinksContainer = document.getElementById('external-links');
    if (!externalLinksContainer) return;
    
    // Add initial "Add" button functionality
    const initialAddButton = externalLinksContainer.querySelector('.add-link-btn');
    if (initialAddButton) {
        initialAddButton.addEventListener('click', addExternalLinkField);
    }
    
    /**
     * Add a new external link input field
     */
    function addExternalLinkField() {
        const newLinkInput = document.createElement('div');
        newLinkInput.className = 'external-link-input';
        
        newLinkInput.innerHTML = `
            <input type="text" class="form-control" placeholder="Link Title">
            <input type="url" class="form-control" placeholder="URL">
            <button type="button" class="remove-link-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        externalLinksContainer.appendChild(newLinkInput);
        
        // Add remove functionality
        newLinkInput.querySelector('.remove-link-btn').addEventListener('click', function() {
            newLinkInput.remove();
        });
        
        // Update the original button to be a remove button
        const firstLinkInput = externalLinksContainer.querySelector('.external-link-input:first-child');
        const firstButton = firstLinkInput.querySelector('button');
        
        firstButton.className = 'remove-link-btn';
        firstButton.innerHTML = '<i class="fas fa-times"></i>';
        
        firstButton.removeEventListener('click', addExternalLinkField);
        firstButton.addEventListener('click', function() {
            firstLinkInput.remove();
        });
        
        // Add a new "Add" button to the last item
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'add-link-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i>';
        addButton.addEventListener('click', addExternalLinkField);
        
        newLinkInput.appendChild(addButton);
    }
}

/**
 * Initialize form submission
 */
function initFormSubmission() {
    const addNewsForm = document.getElementById('add-news-form');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    
    if (!addNewsForm) return;
    
    // Handle form submission (publish)
    addNewsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Show loading state
            const submitBtn = addNewsForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
            submitBtn.disabled = true;
            
            // Upload files first
            let featuredImagePath = 'images/news/placeholder.jpg'; // Default
            let additionalImagePaths = [];
            
            // Upload featured image if one was selected
            if (featuredImageFile) {
                try {
                    featuredImagePath = await uploadFile(featuredImageFile, 'news');
                } catch (error) {
                    console.error('Error uploading featured image:', error);
                    alert('There was an error uploading the featured image. Using placeholder instead.');
                }
            }
            
            // Upload additional images if any were selected
            if (additionalImageFiles.length > 0) {
                try {
                    additionalImagePaths = await uploadMultipleFiles(additionalImageFiles, 'news');
                } catch (error) {
                    console.error('Error uploading additional images:', error);
                    alert('There was an error uploading some additional images.');
                }
            }
            
            // Get form data with uploaded file paths
            const newsData = await getFormData(featuredImagePath, additionalImagePaths);
            newsData.status = 'published';
            
            // Create the news article
            const createdNews = createNews(newsData);
            
            // Show success message
            alert(`News article "${createdNews.title}" has been published successfully!`);
            
            // Reset form
            addNewsForm.reset();
            resetFormPreviews();
            
            // Redirect to news list
            setTimeout(() => {
                window.location.href = 'news.html';
            }, 1000);
        } catch (error) {
            console.error('Error creating news article:', error);
            alert('There was an error publishing the news article. Please try again.');
            
            // Reset button state
            const submitBtn = addNewsForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Publish Article';
            submitBtn.disabled = false;
        }
    });
    
    // Handle save as draft
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', async function() {
            try {
                // Show loading state
                const originalBtnText = saveDraftBtn.textContent;
                saveDraftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveDraftBtn.disabled = true;
                
                // Upload files first (same as for publishing)
                let featuredImagePath = 'images/news/placeholder.jpg'; // Default
                let additionalImagePaths = [];
                
                // Upload featured image if one was selected
                if (featuredImageFile) {
                    try {
                        featuredImagePath = await uploadFile(featuredImageFile, 'news');
                    } catch (error) {
                        console.error('Error uploading featured image:', error);
                        alert('There was an error uploading the featured image. Using placeholder instead.');
                    }
                }
                
                // Upload additional images if any were selected
                if (additionalImageFiles.length > 0) {
                    try {
                        additionalImagePaths = await uploadMultipleFiles(additionalImageFiles, 'news');
                    } catch (error) {
                        console.error('Error uploading additional images:', error);
                        alert('There was an error uploading some additional images.');
                    }
                }
                
                // Get form data with uploaded file paths
                const newsData = await getFormData(featuredImagePath, additionalImagePaths);
                newsData.status = 'draft';
                
                // Create the news article
                const createdNews = createNews(newsData);
                
                // Show success message
                alert(`News article "${createdNews.title}" has been saved as a draft.`);
                
                // Reset form
                addNewsForm.reset();
                resetFormPreviews();
                
                // Reset button state
                saveDraftBtn.innerHTML = originalBtnText;
                saveDraftBtn.disabled = false;
            } catch (error) {
                console.error('Error saving draft:', error);
                alert('There was an error saving the draft. Please try again.');
                
                // Reset button state
                saveDraftBtn.innerHTML = 'Save as Draft';
                saveDraftBtn.disabled = false;
            }
        });
    }
    
    /**
     * Get all form data as an object
     * @param {string} featuredImagePath - Path to the uploaded featured image
     * @param {Array} additionalImagePaths - Paths to uploaded additional images
     * @returns {Object} News article data
     */
    async function getFormData(featuredImagePath, additionalImagePaths = []) {
        // Basic info
        const title = document.getElementById('news-title').value;
        const author = document.getElementById('news-author').value || 'MOOK Robotics Team';
        const dateInput = document.getElementById('news-date').value;
        const publishDate = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
        const category = document.getElementById('news-category').value || 'Technology';
        const summary = document.getElementById('news-summary').value;
        
        // Content
        const content = document.getElementById('news-content').value;
        const tags = document.getElementById('news-tags').value;
        
        // Get related robots
        const relatedRobots = [];
        const relatedRobotItems = document.querySelectorAll('#related-robots-list .related-item');
        
        relatedRobotItems.forEach(item => {
            relatedRobots.push(item.dataset.robotId);
        });
        
        // Get external links
        const externalLinks = [];
        const externalLinkInputs = document.querySelectorAll('#external-links .external-link-input');
        
        externalLinkInputs.forEach(item => {
            const titleInput = item.querySelector('input[type="text"]');
            const urlInput = item.querySelector('input[type="url"]');
            
            if (titleInput.value && urlInput.value) {
                externalLinks.push({
                    title: titleInput.value,
                    url: urlInput.value
                });
            }
        });
        
        // Generate a unique slug from the title
        const slug = generateSlug(title);
        
        // Return formatted data
        return {
            id: `news-${Date.now()}`,
            slug,
            title,
            author,
            publishDate,
            category,
            summary,
            content: content || summary, // Use summary as content if no content
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            featuredImage: featuredImagePath,
            gallery: additionalImagePaths,
            relatedRobots,
            externalLinks,
            views: 0
        };
    }
    
    /**
     * Generate a URL-friendly slug from a title
     * @param {string} title - The title to convert to a slug
     * @returns {string} URL-friendly slug
     */
    function generateSlug(title) {
        return title
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
        featuredImageFile = null;
        additionalImageFiles = [];
        
        // Reset featured image
        const featuredImagePreview = document.getElementById('featured-image-preview');
        const featuredImageUpload = document.getElementById('featured-image-upload');
        
        if (featuredImagePreview) featuredImagePreview.style.display = 'none';
        if (featuredImageUpload) featuredImageUpload.style.display = 'block';
        
        // Reset additional images
        const additionalImagesPreview = document.getElementById('additional-images-preview');
        if (additionalImagesPreview) additionalImagesPreview.innerHTML = '';
        
        // Reset related robots
        const relatedRobotsList = document.getElementById('related-robots-list');
        if (relatedRobotsList) relatedRobotsList.innerHTML = '';
        
        // Reset external links
        const externalLinksContainer = document.getElementById('external-links');
        if (externalLinksContainer) {
            // Remove all but the first external link input
            const externalLinkInputs = externalLinksContainer.querySelectorAll('.external-link-input');
            
            for (let i = 1; i < externalLinkInputs.length; i++) {
                externalLinkInputs[i].remove();
            }
            
            // Reset the first one
            if (externalLinkInputs.length > 0) {
                const firstInput = externalLinkInputs[0];
                const inputs = firstInput.querySelectorAll('input');
                
                inputs.forEach(input => {
                    input.value = '';
                });
                
                // Make sure the button is an add button
                const button = firstInput.querySelector('button');
                
                if (button && !button.classList.contains('add-link-btn')) {
                    button.className = 'add-link-btn';
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                    
                    // Reset event listeners
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    newButton.addEventListener('click', function() {
                        // This is a simplified version; the full logic would be in initExternalLinks
                        const newInput = firstInput.cloneNode(true);
                        newInput.querySelectorAll('input').forEach(input => {
                            input.value = '';
                        });
                        externalLinksContainer.appendChild(newInput);
                    });
                }
            }
        }
    }
}
