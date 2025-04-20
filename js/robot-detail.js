/**
 * MOOK Robotics Hub - Robot Detail Page JavaScript
 * 
 * This file handles loading and displaying robot details,
 * supporting both static and dynamically created robots.
 */

import { getRobotBySlug, robotHtmlExists, getRobotHtml } from './robot-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is a robot detail page
    if (window.location.pathname.includes('/robots/') && !window.location.pathname.endsWith('/index.html')) {
        loadRobotData();
    }
});

/**
 * Load robot data for the current page
 */
function loadRobotData() {
    // Get the robot slug from the URL
    const slug = getRobotSlugFromUrl();
    
    if (!slug) {
        displayErrorMessage('Robot information not found');
        return;
    }
    
    // Try to get robot data
    const robot = getRobotBySlug(slug);
    
    if (robot) {
        // We have robot data, populate the page
        populateRobotPage(robot);
    } else {
        // Check if we have HTML content for this robot
        if (robotHtmlExists(slug)) {
            // This is a dynamically created robot - its HTML is stored in localStorage
            // For a static site, we'd typically create actual HTML files
            // but for this demo we'll use a different approach
            
            // Since we can't actually replace the current page content with the stored HTML
            // (due to browser security restrictions in a static site),
            // we'll redirect to a special loader page that will display the robot content
            window.location.href = `dynamic-robot.html?slug=${slug}`;
        } else {
            // No robot found with this slug
            displayErrorMessage('Robot not found');
        }
    }
}

/**
 * Extract the robot slug from the current URL
 * @returns {string|null} Robot slug or null if not found
 */
function getRobotSlugFromUrl() {
    // Get the path from the URL (e.g., "/robots/atlas.html")
    const path = window.location.pathname;
    
    // Extract the filename (e.g., "atlas.html")
    const filename = path.substring(path.lastIndexOf('/') + 1);
    
    // Remove the ".html" extension to get the slug
    const slug = filename.replace('.html', '');
    
    return slug.length > 0 ? slug : null;
}

/**
 * Populate the robot detail page with data
 * @param {Object} robot - Robot data object
 */
function populateRobotPage(robot) {
    // Set page title
    document.title = `${robot.name} - MOOK Robotics Hub`;
    
    // Update robot name in breadcrumb
    const breadcrumbName = document.querySelector('.robot-breadcrumb span');
    if (breadcrumbName) {
        breadcrumbName.textContent = robot.name;
    }
    
    // Update hero section
    updateHeroSection(robot);
    
    // Update content sections
    updateContentSections(robot);
    
    // Update sidebar
    updateSidebar(robot);
}

/**
 * Update the hero section with robot data
 * @param {Object} robot - Robot data object
 */
function updateHeroSection(robot) {
    // Update title and manufacturer
    const title = document.querySelector('.robot-hero h1');
    const manufacturer = document.querySelector('.robot-manufacturer');
    
    if (title) title.textContent = robot.name;
    if (manufacturer) manufacturer.textContent = robot.manufacturer;
    
    // Update category and year
    const category = document.querySelector('.robot-category');
    const year = document.querySelector('.robot-year');
    
    if (category) category.textContent = robot.category;
    if (year) year.textContent = robot.year;
    
    // Update description
    const description = document.querySelector('.robot-description');
    if (description) description.textContent = robot.description;
    
    // Update image
    const heroImage = document.querySelector('.robot-hero-image');
    if (heroImage) {
        // Check if there's already an img element
        let img = heroImage.querySelector('img');
        
        if (!img) {
            // Create an img element if it doesn't exist (placeholder was there)
            const placeholder = heroImage.querySelector('.placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            img = document.createElement('img');
            heroImage.appendChild(img);
        }
        
        // Set image source
        img.src = `../${robot.mainImage}`;
        img.alt = robot.name;
        img.onerror = function() {
            this.src = '../images/robots/placeholder.jpg';
        };
    }
}

/**
 * Update content sections with robot data
 * @param {Object} robot - Robot data object
 */
function updateContentSections(robot) {
    // Update overview section
    const overviewSection = document.querySelector('#overview');
    if (overviewSection) {
        const contentDiv = overviewSection.querySelector('.robot-content') || overviewSection.querySelector('p');
        if (contentDiv) {
            contentDiv.innerHTML = robot.content || '<p>No detailed content available for this robot yet.</p>';
        } else {
            // If no content div exists, append after the heading
            const heading = overviewSection.querySelector('h2');
            if (heading) {
                const div = document.createElement('div');
                div.className = 'robot-content';
                div.innerHTML = robot.content || '<p>No detailed content available for this robot yet.</p>';
                heading.after(div);
            }
        }
    }
    
    // Update features section
    const featuresSection = document.querySelector('#features');
    if (featuresSection) {
        let featuresList = featuresSection.querySelector('.features-list');
        
        if (!featuresList) {
            // Create features list if it doesn't exist
            featuresList = document.createElement('ul');
            featuresList.className = 'features-list';
            featuresSection.appendChild(featuresList);
        }
        
        if (robot.features && robot.features.length > 0) {
            featuresList.innerHTML = robot.features.map(feature => `<li>${feature}</li>`).join('');
        } else {
            featuresList.innerHTML = '<li>No features listed.</li>';
        }
    }
    
    // Update specifications section
    updateSpecifications(robot);
    
    // Update gallery section
    updateGallery(robot);
}

/**
 * Update specifications section with robot data
 * @param {Object} robot - Robot data object
 */
function updateSpecifications(robot) {
    const specsSection = document.querySelector('#specifications');
    
    if (specsSection) {
        let specsContainer = specsSection.querySelector('.specs-container');
        
        if (!specsContainer) {
            // Create specs container if it doesn't exist
            specsContainer = document.createElement('div');
            specsContainer.className = 'specs-container';
            specsSection.appendChild(specsContainer);
        }
        
        if (robot.specifications) {
            specsContainer.innerHTML = `
                <div class="specs-column">
                    <div class="spec-group">
                        <h3>Technical Details</h3>
                        ${Object.entries(robot.specifications).map(([key, value]) => `
                            <div class="spec-item">
                                <span class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span class="spec-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            specsContainer.innerHTML = '<p>No specifications available for this robot.</p>';
        }
    }
}

/**
 * Update gallery section with robot images
 * @param {Object} robot - Robot data object
 */
function updateGallery(robot) {
    const gallerySection = document.querySelector('#gallery');
    
    if (gallerySection) {
        let galleryGrid = gallerySection.querySelector('.gallery-grid');
        
        if (!galleryGrid) {
            // Create gallery grid if it doesn't exist
            galleryGrid = document.createElement('div');
            galleryGrid.className = 'gallery-grid';
            gallerySection.appendChild(galleryGrid);
        }
        
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
}

/**
 * Update sidebar with robot data
 * @param {Object} robot - Robot data object
 */
function updateSidebar(robot) {
    // Update quick facts
    const quickFacts = document.querySelector('.quick-facts');
    
    if (quickFacts) {
        // Update year
        const yearFact = quickFacts.querySelector('li:nth-child(1) .fact-value');
        if (yearFact) yearFact.textContent = robot.year || 'Unknown';
        
        // Update manufacturer
        const manufacturerFact = quickFacts.querySelector('li:nth-child(2) .fact-value');
        if (manufacturerFact) manufacturerFact.textContent = robot.manufacturer || 'Unknown';
        
        // Update type/category
        const typeFact = quickFacts.querySelector('li:nth-child(4) .fact-value');
        if (typeFact) typeFact.textContent = robot.category || 'Unspecified';
    }
}

/**
 * Display an error message on the page
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
    // Create an error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
        <p><a href="index.html">Return to Encyclopedia</a></p>
    `;
    
    // Replace main content with error message
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = '';
        main.appendChild(errorElement);
    } else {
        document.body.innerHTML = errorElement.outerHTML;
    }
}
