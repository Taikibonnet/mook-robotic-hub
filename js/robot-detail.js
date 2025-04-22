// Robot Detail Page JavaScript

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to check if an element exists
function elementExists(id) {
    return document.getElementById(id) !== null;
}

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a robot detail page
    if (elementExists('robot-main-image')) {
        initializeRobotPage();
    }
});

// Initialize the robot page with data
function initializeRobotPage() {
    // Get robot ID from URL (e.g., "atlas" from "robots/atlas.html")
    const robotId = getUrlParameter('id') || window.location.pathname.split('/').pop().replace('.html', '');
    
    if (robotId && robotId !== 'dynamic-robot') {
        loadRobotData(robotId);
        
        // Set up the edit link for admins
        const editLink = document.getElementById('edit-this-robot');
        if (editLink) {
            editLink.href = `../admin/edit-robot.html?id=${robotId}`;
        }
    } else {
        console.log('No specific robot ID found or on dynamic-robot page');
    }
    
    // Ensure images load properly
    setupImageHandling();
}

// Function to load robot data
function loadRobotData(robotId) {
    console.log(`Loading data for robot: ${robotId}`);
    
    // Determine if we're using dynamic-robot.html or a static page
    const isDynamicPage = window.location.pathname.includes('dynamic-robot.html');
    
    if (isDynamicPage) {
        // For dynamic pages, we need to fetch the data from the server
        fetchRobotData(robotId);
    } else {
        // For static pages, enhance the existing content
        enhanceStaticPageContent();
    }
}

// Function to fetch robot data from server (for dynamic pages)
function fetchRobotData(robotId) {
    // Determine the correct path for the data
    const dataPath = `../data/robots/${robotId}.json`;
    
    // Fetch the data
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Robot data not found (${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            populateRobotData(data);
        })
        .catch(error => {
            console.error('Error loading robot data:', error);
            // Use placeholder data or show error message
            populateDummyData(robotId);
        });
}

// Function to enhance static page content
function enhanceStaticPageContent() {
    // For static pages, we just need to ensure images are handled properly
    // and any dynamic elements are initialized
    setupSmoothScrolling();
    setupTabNavigation();
    checkAdminStatus();
}

// Function to populate the page with robot data (for dynamic pages)
function populateRobotData(robot) {
    // Set main robot information
    if (elementExists('robot-name')) {
        document.getElementById('robot-name').textContent = robot.name;
    }
    
    if (elementExists('robot-title')) {
        document.getElementById('robot-title').textContent = robot.name;
    }
    
    if (elementExists('robot-category')) {
        document.getElementById('robot-category').textContent = robot.category || 'Unknown';
    }
    
    if (elementExists('robot-year')) {
        document.getElementById('robot-year').textContent = robot.year || 'Unknown';
    }
    
    if (elementExists('robot-manufacturer')) {
        document.getElementById('robot-manufacturer').textContent = robot.manufacturer || 'Unknown';
    }
    
    if (elementExists('robot-description')) {
        document.getElementById('robot-description').textContent = robot.description || 'No description available';
    }
    
    // Set quick facts
    if (elementExists('quick-year')) {
        document.getElementById('quick-year').textContent = robot.year || 'Unknown';
    }
    
    if (elementExists('quick-manufacturer')) {
        document.getElementById('quick-manufacturer').textContent = robot.manufacturer || 'Unknown';
    }
    
    if (elementExists('quick-category')) {
        document.getElementById('quick-category').textContent = robot.category || 'Unknown';
    }
    
    // Set overview
    if (elementExists('robot-overview')) {
        const overviewContainer = document.getElementById('robot-overview');
        overviewContainer.innerHTML = '';
        
        if (robot.overview && robot.overview.length > 0) {
            robot.overview.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                overviewContainer.appendChild(p);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = 'No overview available for this robot.';
            overviewContainer.appendChild(p);
        }
    }
    
    // Set features
    if (elementExists('robot-features')) {
        const featuresContainer = document.getElementById('robot-features');
        featuresContainer.innerHTML = '';
        
        if (robot.features && robot.features.length > 0) {
            robot.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresContainer.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No features listed for this robot.';
            featuresContainer.appendChild(li);
        }
    }
    
    // Set specifications
    if (elementExists('robot-specs-container')) {
        const specsContainer = document.getElementById('robot-specs-container');
        specsContainer.innerHTML = '';
        
        if (robot.specifications && Object.keys(robot.specifications).length > 0) {
            for (const [key, value] of Object.entries(robot.specifications)) {
                const specItem = document.createElement('div');
                specItem.className = 'spec-item';
                
                const specLabel = document.createElement('span');
                specLabel.className = 'spec-label';
                specLabel.textContent = key;
                
                const specValue = document.createElement('span');
                specValue.className = 'spec-value';
                specValue.textContent = value;
                
                specItem.appendChild(specLabel);
                specItem.appendChild(specValue);
                specsContainer.appendChild(specItem);
            }
        } else {
            const p = document.createElement('p');
            p.textContent = 'No specifications available for this robot.';
            specsContainer.appendChild(p);
        }
    }
    
    // Set gallery
    if (elementExists('robot-gallery')) {
        const galleryContainer = document.getElementById('robot-gallery');
        galleryContainer.innerHTML = '';
        
        if (robot.gallery && robot.gallery.length > 0) {
            robot.gallery.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = image.url || '../images/robots/placeholder.jpg';
                img.alt = image.alt || robot.name;
                img.className = 'gallery-image image-loading';
                
                img.onload = function() {
                    this.classList.remove('image-loading');
                    this.classList.add('image-loaded');
                };
                
                img.onerror = function() {
                    this.src = '../images/robots/placeholder.jpg';
                    this.classList.remove('image-loading');
                    this.classList.add('image-loaded');
                };
                
                galleryItem.appendChild(img);
                galleryContainer.appendChild(galleryItem);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = 'No gallery images available for this robot.';
            galleryContainer.appendChild(p);
        }
    }
    
    // Set main image
    if (elementExists('robot-main-image')) {
        const mainImage = document.getElementById('robot-main-image');
        
        // Check if we have a main image path
        if (robot.image) {
            mainImage.src = robot.image;
            mainImage.alt = robot.name;
        } else {
            mainImage.src = '../images/robots/placeholder.jpg';
            mainImage.alt = 'Placeholder image for ' + robot.name;
        }
        
        // Ensure image loads properly
        mainImage.onload = function() {
            this.classList.remove('image-loading');
            this.classList.add('image-loaded');
        };
        
        mainImage.onerror = function() {
            console.log('Error loading main image, using placeholder');
            this.src = '../images/robots/placeholder.jpg';
            this.classList.remove('image-loading');
            this.classList.add('image-loaded');
        };
    }
    
    // Update page title
    document.title = `${robot.name} - MOOK Robotics Hub`;
}

// Function to populate dummy data (for testing/fallback)
function populateDummyData(robotId) {
    const dummyData = {
        id: robotId,
        name: robotId.charAt(0).toUpperCase() + robotId.slice(1).replace(/-/g, ' '),
        category: 'Humanoid',
        year: '2023',
        manufacturer: 'MOOK Robotics',
        description: 'An advanced robot designed for various tasks.',
        image: '../images/robots/placeholder.jpg',
        overview: [
            'This is a placeholder description for this robot.',
            'More details about the robot would appear here in a real implementation.'
        ],
        features: [
            'Advanced AI capabilities',
            'Robust movement systems',
            'Sophisticated sensors'
        ],
        specifications: {
            'Height': '1.8 meters',
            'Weight': '80 kg',
            'Power Source': 'Rechargeable battery',
            'Battery Life': '8 hours'
        },
        gallery: [
            { url: '../images/robots/placeholder.jpg', alt: 'Robot front view' },
            { url: '../images/robots/placeholder.jpg', alt: 'Robot side view' }
        ]
    };
    
    populateRobotData(dummyData);
}

// Function to set up image handling
function setupImageHandling() {
    // Handle main robot image
    if (elementExists('robot-main-image')) {
        const mainImage = document.getElementById('robot-main-image');
        
        // Ensure proper loading
        if (!mainImage.complete) {
            mainImage.classList.add('image-loading');
            
            mainImage.onload = function() {
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
            
            mainImage.onerror = function() {
                console.log('Error loading main image, using placeholder');
                this.src = '../images/robots/placeholder.jpg';
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
        } else {
            // Image already loaded
            mainImage.classList.remove('image-loading');
            mainImage.classList.add('image-loaded');
        }
    }
    
    // Handle gallery images
    const galleryImages = document.querySelectorAll('.gallery-image');
    galleryImages.forEach(function(img) {
        if (!img.complete) {
            img.classList.add('image-loading');
            
            img.onload = function() {
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
            
            img.onerror = function() {
                this.src = '../images/robots/placeholder.jpg';
                this.classList.remove('image-loading');
                this.classList.add('image-loaded');
            };
        } else {
            // Image already loaded
            img.classList.remove('image-loading');
            img.classList.add('image-loaded');
        }
    });
}

// Function to set up smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Function to set up tab navigation
function setupTabNavigation() {
    // If we have tabs on the page
    if (elementExists('robot-tabs')) {
        const tabs = document.querySelectorAll('#robot-tabs .tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => content.style.display = 'none');
                
                // Show corresponding tab content
                const contentId = this.getAttribute('data-tab');
                document.getElementById(contentId).style.display = 'block';
            });
        });
        
        // Activate the first tab by default
        if (tabs.length > 0) {
            tabs[0].click();
        }
    }
}

// Function to check admin status and show/hide admin elements
function checkAdminStatus() {
    // In a real implementation, this would check if the user is logged in as admin
    // For now, we'll just use a simple check for presence of admin parameter
    const isAdmin = getUrlParameter('admin') === 'true';
    
    // Show/hide admin elements based on status
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Show the admin actions section if we're in admin mode
    const adminActions = document.querySelector('.admin-actions');
    if (adminActions) {
        adminActions.style.display = isAdmin ? 'block' : 'none';
    }
}

// Function to create a data API for admin interfaces to use
function getRobotDataFromPage() {
    // This function extracts the robot data from the page elements
    // Useful for admin edit functionality
    const robotData = {
        id: window.location.pathname.split('/').pop().replace('.html', ''),
        name: document.getElementById('robot-title')?.textContent || '',
        category: document.getElementById('robot-category')?.textContent || '',
        year: document.getElementById('robot-year')?.textContent || '',
        manufacturer: document.getElementById('robot-manufacturer')?.textContent || '',
        description: document.getElementById('robot-description')?.textContent || '',
        image: document.getElementById('robot-main-image')?.src || ''
    };
    
    return robotData;
}

// Export the functions for use in admin pages
if (typeof module !== 'undefined') {
    module.exports = {
        getUrlParameter,
        getRobotDataFromPage
    };
}
