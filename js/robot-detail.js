/**
 * MOOK Robotics Hub - Robot Detail JavaScript
 * 
 * This file handles displaying the details of a specific robot.
 * It identifies the robot from the URL slug and fetches data from
 * localStorage or generates content from the robot-service.
 */

import { getRobotBySlug } from './robot-service.js';
import { getFileUrl } from './file-upload-service.js';

document.addEventListener('DOMContentLoaded', function() {
    loadRobotDetails();
});

/**
 * Load robot details based on the URL
 */
function loadRobotDetails() {
    try {
        // Get the current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        const isPreview = urlParams.get('preview') === 'true';
        
        // If this is a preview, get data from session storage
        if (isPreview && slug === 'preview') {
            const previewData = JSON.parse(sessionStorage.getItem('robotPreview'));
            
            if (previewData) {
                renderRobotDetails(previewData, true);
                return;
            }
        }
        
        // If not a preview or no preview data, try to get from slug in URL
        if (slug) {
            // Fetch the robot data by slug parameter
            const robot = getRobotBySlug(slug);
            
            if (robot) {
                renderRobotDetails(robot);
                return;
            }
        }
        
        // If we reach here and don't have a slug parameter, try to extract from URL path
        const currentPath = window.location.pathname;
        
        // Extract slug from path (e.g., /robots/atlas.html -> atlas)
        // Using regex to match the pattern: robots/SLUG.html
        const slugMatch = currentPath.match(/robots\/(.+?)\.html/);
        
        if (slugMatch && slugMatch[1]) {
            const pathSlug = slugMatch[1];
            
            // Fetch the robot data
            const robot = getRobotBySlug(pathSlug);
            
            if (robot) {
                renderRobotDetails(robot);
                return;
            }
        }
        
        // If we get here, no robot was found
        showError('Robot not found. It may have been removed or does not exist.');
        
    } catch (error) {
        console.error('Error loading robot details:', error);
        showError('An error occurred while loading the robot details.');
    }
}

/**
 * Render robot details on the page
 * @param {Object} robot - Robot data object
 * @param {boolean} isPreview - Whether this is a preview of an unsaved robot
 */
function renderRobotDetails(robot, isPreview = false) {
    // Update the page title
    document.title = `${robot.name} - MOOK Robotics Hub`;
    
    // If this is a preview, add a preview banner
    if (isPreview) {
        const mainElement = document.querySelector('main');
        const previewBanner = document.createElement('div');
        previewBanner.className = 'preview-banner';
        previewBanner.innerHTML = `
            <div class="preview-banner-content">
                <i class="fas fa-eye"></i> 
                <span>Preview Mode - This robot has not been saved yet</span>
                <button class="btn btn-small btn-outline close-preview">Close Preview</button>
            </div>
        `;
        mainElement.insertBefore(previewBanner, mainElement.firstChild);
        
        // Add close button functionality
        previewBanner.querySelector('.close-preview').addEventListener('click', function() {
            window.close(); // Close the preview window/tab
        });
    }
    
    // Update the main image
    const mainImage = document.querySelector('.robot-hero-image img');
    if (mainImage && robot.mainImage) {
        // Use getFileUrl to get proper URL for the image
        mainImage.src = getFileUrl(robot.mainImage);
        mainImage.alt = robot.name;
        // Add error handler for image
        mainImage.onerror = function() {
            this.src = '../images/robots/placeholder.jpg';
        };
    }
    
    // Update text content
    document.querySelector('.robot-hero-info h1').textContent = robot.name;
    document.querySelector('.robot-category').textContent = robot.category || 'Uncategorized';
    document.querySelector('.robot-year').textContent = robot.year || 'Unknown Year';
    document.querySelector('.robot-manufacturer').textContent = robot.manufacturer || 'Unknown Manufacturer';
    document.querySelector('.robot-description').textContent = robot.description || 'No description available.';
    
    // Update the breadcrumb
    const breadcrumbSpan = document.querySelector('.breadcrumb-container span');
    if (breadcrumbSpan) {
        breadcrumbSpan.textContent = robot.name;
    }
    
    // Update the content section
    const contentElement = document.querySelector('.robot-content');
    if (contentElement) {
        contentElement.innerHTML = robot.content || `<p>${robot.description || 'No detailed content available for this robot yet.'}</p>`;
    }
    
    // Update features list
    const featuresList = document.querySelector('.features-list');
    if (featuresList) {
        if (robot.features && robot.features.length > 0) {
            featuresList.innerHTML = robot.features.map(feature => `<li>${feature}</li>`).join('');
        } else {
            featuresList.innerHTML = '<li>No features listed.</li>';
        }
    }
    
    // Update specifications
    const specsContainer = document.querySelector('.specs-container');
    if (specsContainer && robot.specifications) {
        const specsGroups = specsContainer.querySelectorAll('.spec-group');
        
        if (specsGroups.length > 0) {
            const specGroup = specsGroups[0];
            
            // Clear existing specs
            while (specGroup.children.length > 1) { // Keep the h3 title
                specGroup.removeChild(specGroup.lastChild);
            }
            
            // Add new specs
            if (Object.keys(robot.specifications).length > 0) {
                Object.entries(robot.specifications).forEach(([key, value]) => {
                    const specItem = document.createElement('div');
                    specItem.className = 'spec-item';
                    
                    specItem.innerHTML = `
                        <span class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span class="spec-value">${value}</span>
                    `;
                    
                    specGroup.appendChild(specItem);
                });
            } else {
                specGroup.innerHTML += '<p>No specifications available.</p>';
            }
        }
    }
    
    // Update gallery
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        if (robot.gallery && robot.gallery.length > 0) {
            galleryGrid.innerHTML = robot.gallery.map(image => {
                // Use getFileUrl to get proper URL for the image
                const imageUrl = getFileUrl(image);
                return `
                    <div class="gallery-item">
                        <img src="${imageUrl}" alt="${robot.name}" onerror="this.src='../images/robots/placeholder.jpg'">
                    </div>
                `;
            }).join('');
            
            // Add lightbox functionality to gallery images
            const galleryItems = galleryGrid.querySelectorAll('.gallery-item img');
            galleryItems.forEach(img => {
                img.addEventListener('click', function() {
                    showImageLightbox(this.src, robot.name);
                });
            });
        } else {
            galleryGrid.innerHTML = '<p>No additional images available.</p>';
        }
    }
    
    // Update videos section if available
    const videosContainer = document.querySelector('.videos-container');
    if (videosContainer && robot.videos && robot.videos.length > 0) {
        let videosHTML = '<h3>Videos</h3><div class="video-grid">';
        
        robot.videos.forEach(videoUrl => {
            // Process video URL to create embed
            const videoEmbed = createVideoEmbed(videoUrl);
            if (videoEmbed) {
                videosHTML += `
                    <div class="video-item">
                        ${videoEmbed}
                    </div>
                `;
            }
        });
        
        videosHTML += '</div>';
        videosContainer.innerHTML = videosHTML;
    } else if (videosContainer) {
        videosContainer.style.display = 'none';
    }
    
    // Update quick facts sidebar
    const quickFacts = document.querySelector('.quick-facts');
    if (quickFacts) {
        const yearFact = quickFacts.querySelector('li:nth-child(1) .fact-value');
        const manufacturerFact = quickFacts.querySelector('li:nth-child(2) .fact-value');
        const categoryFact = quickFacts.querySelector('li:nth-child(3) .fact-value');
        
        if (yearFact) yearFact.textContent = robot.year || 'Unknown';
        if (manufacturerFact) manufacturerFact.textContent = robot.manufacturer || 'Unknown';
        if (categoryFact) categoryFact.textContent = robot.category || 'Unspecified';
    }
    
    // If the robot has a website, update the link
    const websiteLink = document.querySelector('.robot-website');
    if (websiteLink) {
        if (robot.website) {
            websiteLink.href = robot.website;
            websiteLink.style.display = 'inline-flex';
        } else {
            websiteLink.style.display = 'none';
        }
    }
}

/**
 * Create a video embed from a video URL
 * @param {string} videoUrl - URL of the video
 * @returns {string} HTML code for the embed
 */
function createVideoEmbed(videoUrl) {
    // YouTube embed
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        const videoId = youtubeMatch[1];
        return `
            <div class="video-wrapper">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allowfullscreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
            </div>
        `;
    }
    
    // Vimeo embed
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[1]) {
        const videoId = vimeoMatch[1];
        return `
            <div class="video-wrapper">
                <iframe src="https://player.vimeo.com/video/${videoId}" 
                    width="560" height="315" frameborder="0" 
                    allowfullscreen allow="autoplay; fullscreen; picture-in-picture">
                </iframe>
            </div>
        `;
    }
    
    // If no match, return a link to the video
    return `
        <div class="video-link">
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer">
                <i class="fas fa-external-link-alt"></i> Watch Video
            </a>
        </div>
    `;
}

/**
 * Show image in a lightbox
 * @param {string} src - Image source URL
 * @param {string} alt - Image alt text
 */
function showImageLightbox(src, alt) {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${src}" alt="${alt}">
            <button class="lightbox-close">&times;</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(lightbox);
    
    // Add close functionality
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            lightbox.remove();
        }
    });
    
    // Add keyboard close (ESC key)
    document.addEventListener('keydown', function escClose(e) {
        if (e.key === 'Escape') {
            lightbox.remove();
            document.removeEventListener('keydown', escClose);
        }
    });
}

/**
 * Show error message on the page
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Find the main content area
    const mainElement = document.querySelector('main');
    
    if (mainElement) {
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-container';
        
        errorElement.innerHTML = `
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error</h2>
            <p>${message}</p>
            <a href="index.html" class="btn btn-primary">Return to Encyclopedia</a>
        `;
        
        // Replace main content with error
        mainElement.innerHTML = '';
        mainElement.appendChild(errorElement);
    } else {
        // If main element not found, alert
        alert(`Error: ${message}`);
    }
}
