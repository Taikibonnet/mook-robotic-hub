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
    
    // Remove from array
    robots.splice(index, 1);
    
    // Save to localStorage
    saveRobotsToStorage(robots);
    
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
 * Check if robot HTML exists
 * @param {string} slug - Robot slug
 * @returns {boolean} True if HTML exists
 */
function robotHtmlExists(slug) {
    // This will always return false now as we're using dynamic templates instead of stored HTML
    return false;
}

/**
 * Get robot HTML content
 * @param {string} slug - Robot slug
 * @returns {string|null} HTML content or null if not found
 */
function getRobotHtml(slug) {
    // This will always return null now as we're using dynamic templates instead of stored HTML
    return null;
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
