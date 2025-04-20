/**
 * MOOK Robotics Hub - Robot Detail JavaScript
 * 
 * This file handles displaying the details of a specific robot.
 * It identifies the robot from the URL slug and fetches data from
 * localStorage or generates content from the robot-service.
 */

import { getRobotBySlug, robotHtmlExists, getRobotHtml } from './robot-service.js';

document.addEventListener('DOMContentLoaded', function() {
    loadRobotDetails();
});

/**
 * Load robot details based on the URL
 */
function loadRobotDetails() {
    try {
        // Get the current URL
        const currentPath = window.location.pathname;
        
        // Extract slug from path (e.g., /robots/atlas.html -> atlas)
        // Using regex to match the pattern: robots/SLUG.html
        const slugMatch = currentPath.match(/robots\/(.+?)\.html/);
        
        if (!slugMatch || !slugMatch[1]) {
            // If no match found, show error
            showError('Robot not found. The URL appears to be invalid.');
            return;
        }
        
        const slug = slugMatch[1];
        
        // First check if this robot has HTML content generated
        if (robotHtmlExists(slug)) {
            // If HTML exists, we're on a page for a robot that was added by a user
            // In a real app, we would load a proper HTML file
            // For this demo, we'll render the stored HTML content
            const htmlContent = getRobotHtml(slug);
            
            if (htmlContent) {
                // In a real app, we'd redirect to the proper HTML file
                // For demo, we'll replace the current page content
                document.documentElement.innerHTML = htmlContent;
                return;
            }
        }
        
        // Otherwise, fetch the robot data and render it
        const robot = getRobotBySlug(slug);
        
        if (!robot) {
            showError('Robot not found. It may have been removed or does not exist.');
            return;
        }
        
        // Render the robot details on the page
        renderRobotDetails(robot);
    } catch (error) {
        console.error('Error loading robot details:', error);
        showError('An error occurred while loading the robot details.');
    }
}

/**
 * Render robot details on the page
 * @param {Object} robot - Robot data object
 */
function renderRobotDetails(robot) {
    // Update the page title
    document.title = `${robot.name} - MOOK Robotics Hub`;
    
    // Update the main image
    const mainImage = document.querySelector('.robot-hero-image img');
    if (mainImage) {
        mainImage.src = `../${robot.mainImage}`;
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
    
    // Update the content section
    const contentElement = document.querySelector('.robot-content');
    if (contentElement) {
        contentElement.innerHTML = robot.content || '<p>No detailed content available for this robot yet.</p>';
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
            galleryGrid.innerHTML = robot.gallery.map(image => `
                <div class="gallery-item">
                    <img src="../${image}" alt="${robot.name}" onerror="this.src='../images/robots/placeholder.jpg'">
                </div>
            `).join('');
        } else {
            galleryGrid.innerHTML = '<p>No additional images available.</p>';
        }
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
