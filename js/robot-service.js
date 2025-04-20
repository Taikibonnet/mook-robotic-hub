/**
 * MOOK Robotics Hub - Robot Service
 * 
 * This file contains functions for managing robot data,
 * including creating, updating, and retrieving robot information.
 * It uses localStorage for data persistence in this static implementation.
 */

import { ROBOTS_DATA } from './data.js';

/**
 * Get all robots from storage
 * @returns {Array} Array of robot objects
 */
function getAllRobots() {
    // Try to get robots from localStorage first
    const storedRobots = localStorage.getItem('mookRoboticsRobots');
    
    if (storedRobots) {
        // Combine stored robots with the default ones
        const parsedStoredRobots = JSON.parse(storedRobots);
        
        // Create a map of default robots by ID for quick lookup
        const defaultRobotsMap = {};
        ROBOTS_DATA.forEach(robot => {
            defaultRobotsMap[robot.id] = true;
        });
        
        // Filter out stored robots that would duplicate default ones
        const uniqueStoredRobots = parsedStoredRobots.filter(robot => !defaultRobotsMap[robot.id]);
        
        // Return combined list
        return [...ROBOTS_DATA, ...uniqueStoredRobots];
    }
    
    // If no stored robots, return just the default ones
    return [...ROBOTS_DATA];
}

/**
 * Get a robot by ID
 * @param {string} id - Robot ID
 * @returns {Object|null} Robot object or null if not found
 */
function getRobotById(id) {
    const robots = getAllRobots();
    return robots.find(robot => robot.id === id) || null;
}

/**
 * Get a robot by slug
 * @param {string} slug - Robot slug (URL-friendly name)
 * @returns {Object|null} Robot object or null if not found
 */
function getRobotBySlug(slug) {
    const robots = getAllRobots();
    return robots.find(robot => robot.slug === slug) || null;
}

/**
 * Create a new robot
 * @param {Object} robotData - Robot data object
 * @returns {Object} Created robot with ID
 */
function createRobot(robotData) {
    // Get existing robots
    const robots = getAllRobots();
    
    // Generate ID and slug if not provided
    const newRobot = {
        ...robotData,
        id: robotData.id || `robot-${Date.now()}`,
        slug: robotData.slug || createSlug(robotData.name)
    };
    
    // Add to array
    robots.push(newRobot);
    
    // Save to localStorage (excluding default robots)
    saveRobotsToStorage(robots);
    
    // Generate HTML file for the robot
    generateRobotHtml(newRobot);
    
    return newRobot;
}

/**
 * Update an existing robot
 * @param {string} id - Robot ID
 * @param {Object} robotData - Updated robot data
 * @returns {Object|null} Updated robot or null if not found
 */
function updateRobot(id, robotData) {
    const robots = getAllRobots();
    const index = robots.findIndex(robot => robot.id === id);
    
    if (index === -1) {
        return null;
    }
    
    // Update robot data
    robots[index] = {
        ...robots[index],
        ...robotData,
        // Ensure ID and slug remain the same
        id: robots[index].id,
        slug: robotData.slug || robots[index].slug
    };
    
    // Save to localStorage
    saveRobotsToStorage(robots);
    
    // Update HTML file
    generateRobotHtml(robots[index]);
    
    return robots[index];
}

/**
 * Delete a robot
 * @param {string} id - Robot ID
 * @returns {boolean} Success status
 */
function deleteRobot(id) {
    const robots = getAllRobots();
    const index = robots.findIndex(robot => robot.id === id);
    
    if (index === -1) {
        return false;
    }
    
    // Get the robot to be deleted
    const deletedRobot = robots[index];
    
    // Remove from array
    robots.splice(index, 1);
    
    // Save to localStorage
    saveRobotsToStorage(robots);
    
    // Here we would ideally delete the HTML file, but we can't do that in a static site
    // We would need to mark it as deleted in some way
    
    return true;
}

/**
 * Save robots to localStorage (excluding default robots)
 * @param {Array} robots - Full array of robots
 */
function saveRobotsToStorage(robots) {
    // Create a map of default robots by ID for quick lookup
    const defaultRobotsMap = {};
    ROBOTS_DATA.forEach(robot => {
        defaultRobotsMap[robot.id] = true;
    });
    
    // Filter out default robots
    const customRobots = robots.filter(robot => !defaultRobotsMap[robot.id]);
    
    // Save to localStorage
    localStorage.setItem('mookRoboticsRobots', JSON.stringify(customRobots));
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
 * Generate HTML file for a robot
 * @param {Object} robot - Robot data
 * @returns {boolean} Success status
 */
function generateRobotHtml(robot) {
    // In a real backend system, this would create an actual file
    // For now, we'll store the HTML content in localStorage
    // When the page is loaded, we'll check if there's HTML content for the requested robot
    
    // Create a basic HTML template using the robot's data
    const html = generateRobotHtmlContent(robot);
    
    // Store in localStorage
    localStorage.setItem(`mookRoboticsRobotHtml_${robot.slug}`, html);
    
    return true;
}

/**
 * Generate HTML content for a robot
 * @param {Object} robot - Robot data
 * @returns {string} HTML content
 */
function generateRobotHtmlContent(robot) {
    // This is a simplified template - in a real implementation, this would be more comprehensive
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${robot.name} - MOOK Robotics Hub</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/theme.css">
    <link rel="stylesheet" href="../css/encyclopedia.css">
    <link rel="stylesheet" href="../css/robot-detail.css">
</head>
<body>
    <header>
        <nav class="main-nav">
            <div class="logo">
                <svg width="50" height="50" viewBox="0 0 50 50" class="logo-svg">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary-color)" stroke-width="2" />
                    <circle cx="25" cy="25" r="5" fill="var(--primary-color)" />
                    <path d="M25 10 L25 5" stroke="var(--primary-color)" stroke-width="2" />
                    <path d="M25 45 L25 40" stroke="var(--primary-color)" stroke-width="2" />
                    <path d="M10 25 L5 25" stroke="var(--primary-color)" stroke-width="2" />
                    <path d="M45 25 L40 25" stroke="var(--primary-color)" stroke-width="2" />
                </svg>
                <span>MOOK Robotics Hub</span>
            </div>
            <div class="nav-links">
                <a href="../index.html">Home</a>
                <a href="index.html" class="active">Encyclopedia</a>
                <a href="../news.html">News</a>
                <a href="../about.html">About</a>
            </div>
            <div class="nav-auth">
                <button id="login-btn" class="btn btn-primary">Login</button>
                <button id="signup-btn" class="btn btn-outline">Sign Up</button>
            </div>
        </nav>
    </header>

    <main>
        <div class="robot-breadcrumb">
            <div class="breadcrumb-container">
                <a href="../index.html">Home</a>
                <i class="fas fa-chevron-right"></i>
                <a href="index.html">Encyclopedia</a>
                <i class="fas fa-chevron-right"></i>
                <span>${robot.name}</span>
            </div>
        </div>

        <section class="robot-hero">
            <div class="robot-hero-container">
                <div class="robot-hero-image">
                    <img src="../${robot.mainImage}" alt="${robot.name}" onerror="this.src='../images/robots/placeholder.jpg'">
                </div>
                <div class="robot-hero-info">
                    <div class="robot-categories">
                        <span class="robot-category">${robot.category}</span>
                        <span class="robot-year">${robot.year}</span>
                    </div>
                    <h1>${robot.name}</h1>
                    <p class="robot-manufacturer">${robot.manufacturer}</p>
                    <p class="robot-description">${robot.description}</p>
                    <div class="robot-actions">
                        <a href="#specifications" class="btn btn-primary">Specifications</a>
                        <a href="#features" class="btn btn-outline">Features</a>
                    </div>
                </div>
            </div>
        </section>

        <div class="robot-content-container">
            <div class="robot-main-content">
                <section id="overview" class="robot-section">
                    <h2>Overview</h2>
                    <div class="robot-content">${robot.content || '<p>No detailed content available for this robot yet.</p>'}</div>
                </section>

                <section id="features" class="robot-section">
                    <h2>Features</h2>
                    <ul class="features-list">
                        ${robot.features ? robot.features.map(feature => `<li>${feature}</li>`).join('') : '<li>No features listed.</li>'}
                    </ul>
                </section>

                <section id="specifications" class="robot-section">
                    <h2>Specifications</h2>
                    <div class="specs-container">
                        <div class="specs-column">
                            <div class="spec-group">
                                <h3>Technical Details</h3>
                                ${robot.specifications ? 
                                    Object.entries(robot.specifications).map(([key, value]) => `
                                        <div class="spec-item">
                                            <span class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                            <span class="spec-value">${value}</span>
                                        </div>
                                    `).join('') 
                                    : '<p>No specifications available.</p>'
                                }
                            </div>
                        </div>
                    </div>
                </section>

                <section id="gallery" class="robot-section">
                    <h2>Image Gallery</h2>
                    <div class="gallery-grid">
                        ${robot.gallery && robot.gallery.length > 0 ? 
                            robot.gallery.map(image => `
                                <div class="gallery-item">
                                    <img src="../${image}" alt="${robot.name}" onerror="this.src='../images/robots/placeholder.jpg'">
                                </div>
                            `).join('') 
                            : '<p>No additional images available.</p>'
                        }
                    </div>
                </section>
            </div>

            <aside class="robot-sidebar">
                <div class="sidebar-section">
                    <h3>Quick Facts</h3>
                    <ul class="quick-facts">
                        <li>
                            <i class="fas fa-calendar-alt"></i>
                            <span class="fact-label">Year:</span>
                            <span class="fact-value">${robot.year || 'Unknown'}</span>
                        </li>
                        <li>
                            <i class="fas fa-building"></i>
                            <span class="fact-label">Manufacturer:</span>
                            <span class="fact-value">${robot.manufacturer || 'Unknown'}</span>
                        </li>
                        <li>
                            <i class="fas fa-tag"></i>
                            <span class="fact-label">Category:</span>
                            <span class="fact-value">${robot.category || 'Unspecified'}</span>
                        </li>
                    </ul>
                </div>

                <div class="sidebar-section">
                    <h3>On This Page</h3>
                    <ul class="page-nav">
                        <li><a href="#overview">Overview</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#specifications">Specifications</a></li>
                        <li><a href="#gallery">Image Gallery</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    </main>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>MOOK Robotics Hub</h3>
                <p>Your interactive guide to the world of robotics</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Navigation</h3>
                <ul>
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="index.html">Encyclopedia</a></li>
                    <li><a href="../news.html">News</a></li>
                    <li><a href="../about.html">About</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <ul>
                    <li><a href="mailto:info@mookrobotics.com">info@mookrobotics.com</a></li>
                    <li><a href="../contact.html">Contact Form</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Account</h3>
                <ul>
                    <li><a href="#login">Login</a></li>
                    <li><a href="#signup">Sign Up</a></li>
                    <li><a href="../my-account.html">My Account</a></li>
                    <li><a href="../admin/dashboard.html">Admin</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 MOOK Robotics Hub. All rights reserved.</p>
        </div>
    </footer>

    <script src="../js/main.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/robot-detail.js"></script>
</body>
</html>`;
}

/**
 * Check if robot HTML exists
 * @param {string} slug - Robot slug
 * @returns {boolean} True if HTML exists
 */
function robotHtmlExists(slug) {
    return localStorage.getItem(`mookRoboticsRobotHtml_${slug}`) !== null;
}

/**
 * Get robot HTML content
 * @param {string} slug - Robot slug
 * @returns {string|null} HTML content or null if not found
 */
function getRobotHtml(slug) {
    return localStorage.getItem(`mookRoboticsRobotHtml_${slug}`);
}

// Export functions
export {
    getAllRobots,
    getRobotById,
    getRobotBySlug,
    createRobot,
    updateRobot,
    deleteRobot,
    robotHtmlExists,
    getRobotHtml
};
