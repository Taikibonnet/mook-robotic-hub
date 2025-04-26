/**
 * MOOK Robotics Hub - Robot Service
 * 
 * This file contains functions for managing robot data,
 * including creating, updating, and retrieving robot information.
 * It uses the GitHub Storage Service for permanent data storage.
 */

import { ROBOTS_DATA } from './data.js';
import { loadRobots, saveRobots, isAuthenticated } from './github-storage-service.js';

// In-memory cache of robot data
let robotsData = [...ROBOTS_DATA];
let dataLoaded = false;

/**
 * Initialize robot data from GitHub or localStorage
 * @returns {Promise<void>}
 */
async function initRobotData() {
    if (dataLoaded) return;
    
    try {
        // Load data from GitHub or localStorage (handled in the storage service)
        const storedRobots = await loadRobots();
        
        if (storedRobots && storedRobots.length > 0) {
            // Create a map of static robots by ID for quick lookup
            const staticRobotsMap = new Map(ROBOTS_DATA.map(robot => [robot.id, robot]));
            
            // Start with the static data
            robotsData = [...ROBOTS_DATA];
            
            // Add or update robots from storage
            storedRobots.forEach(robot => {
                // If this is a new robot, add it
                if (!staticRobotsMap.has(robot.id)) {
                    robotsData.push(robot);
                } else {
                    // If it's an existing robot, update it in our array
                    const index = robotsData.findIndex(r => r.id === robot.id);
                    if (index !== -1) {
                        robotsData[index] = robot;
                    }
                }
            });
        }
        
        dataLoaded = true;
    } catch (error) {
        console.error('Error initializing robot data:', error);
    }
}

/**
 * Get all robots
 * @returns {Promise<Array>} Array of robot objects
 */
async function getAllRobots() {
    await initRobotData();
    
    // Return enhanced robots
    return robotsData.map(enhanceRobotData);
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
    
    // Process image paths to get proper URLs
    if (enhancedRobot.mainImage) {
        enhancedRobot.mainImageUrl = getFullImageUrl(enhancedRobot.mainImage);
    }
    
    // Process gallery images
    if (enhancedRobot.gallery && enhancedRobot.gallery.length > 0) {
        enhancedRobot.galleryUrls = enhancedRobot.gallery.map(imagePath => getFullImageUrl(imagePath));
    } else {
        enhancedRobot.galleryUrls = [];
    }
    
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
 * Get the full URL for an image path
 * @param {string} path - Image path
 * @returns {string} Full URL
 */
function getFullImageUrl(path) {
    // If path is already a complete URL or data URL, return it
    if (path && (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:'))) {
        return path;
    }
    
    // Handle empty or undefined paths
    if (!path) {
        return 'images/robots/placeholder.jpg';
    }
    
    // For images in the GitHub repository, construct the raw URL
    if (path.startsWith('images/')) {
        return `https://raw.githubusercontent.com/TaikiBonnet/mook-robotic-hub/main/${path}`;
    }
    
    // Otherwise, return the path as is
    return path;
}

/**
 * Get a robot by ID
 * @param {string} id - Robot ID
 * @returns {Promise<Object|null>} Robot object or null if not found
 */
async function getRobotById(id) {
    await initRobotData();
    
    const robot = robotsData.find(robot => robot.id === id);
    return robot ? enhanceRobotData(robot) : null;
}

/**
 * Get a robot by slug
 * @param {string} slug - Robot slug (URL-friendly name)
 * @returns {Promise<Object|null>} Robot object or null if not found
 */
async function getRobotBySlug(slug) {
    await initRobotData();
    
    const robot = robotsData.find(robot => robot.slug === slug);
    return robot ? enhanceRobotData(robot) : null;
}

/**
 * Create a new robot
 * @param {Object} robotData - Robot data object
 * @returns {Promise<Object>} Created robot with ID
 */
async function createRobot(robotData) {
    await initRobotData();
    
    // Generate ID and slug if not provided
    const newRobot = {
        ...robotData,
        id: robotData.id || `robot-${Date.now()}`,
        slug: robotData.slug || createSlug(robotData.name)
    };
    
    // Add to robots data
    robotsData.push(newRobot);
    
    // Save to GitHub or localStorage
    await saveRobots(robotsData);
    
    // Return enhanced robot
    return enhanceRobotData(newRobot);
}

/**
 * Update an existing robot
 * @param {string} id - Robot ID
 * @param {Object} robotData - Updated robot data
 * @returns {Promise<Object|null>} Updated robot or null if not found
 */
async function updateRobot(id, robotData) {
    await initRobotData();
    
    const index = robotsData.findIndex(robot => robot.id === id);
    
    if (index === -1) {
        return null;
    }
    
    // Update robot data
    const updatedRobot = {
        ...robotsData[index],
        ...robotData,
        // Ensure ID remains the same
        id: robotsData[index].id,
        // Update the slug only if name changed
        slug: robotData.name !== robotsData[index].name ? 
              createSlug(robotData.name) : 
              robotData.slug || robotsData[index].slug
    };
    
    // Update in array
    robotsData[index] = updatedRobot;
    
    // Save to GitHub or localStorage
    await saveRobots(robotsData);
    
    // Return enhanced robot
    return enhanceRobotData(updatedRobot);
}

/**
 * Delete a robot
 * @param {string} id - Robot ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteRobot(id) {
    await initRobotData();
    
    const index = robotsData.findIndex(robot => robot.id === id);
    
    if (index === -1) {
        return false;
    }
    
    // Remove from array
    robotsData.splice(index, 1);
    
    // Save to GitHub or localStorage
    await saveRobots(robotsData);
    
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
    getFullImageUrl
};
