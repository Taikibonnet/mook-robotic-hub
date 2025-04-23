/**
 * MOOK Robotics Hub - Robot Service
 * 
 * This file contains functions for managing robot data,
 * including creating, updating, and retrieving robot information.
 * It uses sessionStorage and localStorage for shared data persistence.
 */

import { ROBOTS_DATA } from './data.js';

// Use a consistent storage key for better cross-session compatibility
const STORAGE_KEY = 'mook_robotics_hub_data';

/**
 * Get all robots from storage
 * @returns {Array} Array of robot objects
 */
function getAllRobots() {
    // Always include the predefined robots from data.js
    const allRobots = [...ROBOTS_DATA];
    
    // Return enhanced robots
    return allRobots.map(enhanceRobotData);
}

/**
 * Enhance robot data with additional properties and processing
 * @param {Object} robot - Robot data
 * @returns {Object} Enhanced robot data
 */
function enhanceRobotData(robot) {
    // Create a deep copy to avoid modifying the original
    const enhancedRobot = JSON.parse(JSON.stringify(robot));
    
    // Ensure required arrays exist
    if (!enhancedRobot.features) enhancedRobot.features = [];
    if (!enhancedRobot.gallery) enhancedRobot.gallery = [];
    if (!enhancedRobot.videos) enhancedRobot.videos = [];
    if (!enhancedRobot.specifications) enhancedRobot.specifications = {};
    
    // Extract video IDs from content if they exist
    if (enhancedRobot.content) {
        // Look for YouTube embeds and add to videos array if not already present
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:\?.*)?/g;
        let youtubeMatch;
        while ((youtubeMatch = youtubeRegex.exec(enhancedRobot.content)) !== null) {
            const videoId = youtubeMatch[1];
            // Check if this video is already in the videos array
            const exists = enhancedRobot.videos.some(v => v.type === 'youtube' && v.id === videoId);
            if (!exists) {
                enhancedRobot.videos.push({
                    type: 'youtube',
                    id: videoId,
                    title: `${enhancedRobot.name} Video`
                });
            }
        }
        
        // Look for Vimeo embeds
        const vimeoRegex = /(?:https?:\/\/)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\?.*)?/g;
        let vimeoMatch;
        while ((vimeoMatch = vimeoRegex.exec(enhancedRobot.content)) !== null) {
            const videoId = vimeoMatch[1];
            // Check if this video is already in the videos array
            const exists = enhancedRobot.videos.some(v => v.type === 'vimeo' && v.id === videoId);
            if (!exists) {
                enhancedRobot.videos.push({
                    type: 'vimeo',
                    id: videoId,
                    title: `${enhancedRobot.name} Video`
                });
            }
        }
    }
    
    return enhancedRobot;
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
    
    // Enhance the robot data
    const enhancedRobot = enhanceRobotData(newRobot);
    
    // Update default robots data to include this new robot
    ROBOTS_DATA.push(enhancedRobot);
    
    return enhancedRobot;
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
    const updatedRobot = {
        ...robots[index],
        ...robotData,
        // Ensure ID and slug remain the same
        id: robots[index].id,
        slug: robotData.slug || robots[index].slug
    };
    
    // Enhance the robot data
    const enhancedRobot = enhanceRobotData(updatedRobot);
    
    // Update in the default data array
    const dataIndex = ROBOTS_DATA.findIndex(robot => robot.id === id);
    if (dataIndex !== -1) {
        ROBOTS_DATA[dataIndex] = enhancedRobot;
    }
    
    return enhancedRobot;
}

/**
 * Delete a robot
 * @param {string} id - Robot ID
 * @returns {boolean} Success status
 */
function deleteRobot(id) {
    // Find the robot in the default data
    const index = ROBOTS_DATA.findIndex(robot => robot.id === id);
    
    if (index === -1) {
        return false;
    }
    
    // Remove from array
    ROBOTS_DATA.splice(index, 1);
    
    return true;
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
 * Extract YouTube video ID from a URL
 * @param {string} url - YouTube URL
 * @returns {string|null} YouTube video ID or null if not found
 */
function extractYouTubeID(url) {
    if (!url) return null;
    
    // Various YouTube URL formats
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

/**
 * Extract Vimeo video ID from a URL
 * @param {string} url - Vimeo URL
 * @returns {string|null} Vimeo video ID or null if not found
 */
function extractVimeoID(url) {
    if (!url) return null;
    
    // Vimeo URL patterns
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\?.*)?/,
        /(?:https?:\/\/)?(?:player\.)?vimeo\.com\/video\/(\d+)(?:\?.*)?/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

/**
 * Helper function to get the URL for a file
 * @param {string} path - File path
 * @returns {string} Complete URL
 */
function getFileUrl(path) {
    // If it's already an absolute URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // If it's a placeholder, return the default image
    if (!path) {
        return '../images/robots/placeholder.jpg';
    }
    
    // Otherwise, prefix with the base path
    // If we're in a robot detail page, we need to add '../'
    const isInRobotDetail = window.location.pathname.includes('/robots/');
    
    if (isInRobotDetail && !path.startsWith('../')) {
        return '../' + path;
    }
    
    return path;
}

// Export functions
export {
    getAllRobots,
    getRobotById,
    getRobotBySlug,
    createRobot,
    updateRobot,
    deleteRobot,
    createSlug,
    extractYouTubeID,
    extractVimeoID,
    getFileUrl
};
