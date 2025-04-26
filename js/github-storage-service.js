/**
 * GitHub Storage Service for MOOK Robotics Hub
 * This module provides functions for storing data in the GitHub repository
 */

// GitHub repository details
const REPO_OWNER = 'TaikiBonnet';
const REPO_NAME = 'mook-robotic-hub';
const BRANCH = 'main';
const DATA_FILE_PATH = 'data/robots.json';
const IMAGES_FOLDER = 'images/robots/';

// GitHub authentication token
// Note: You'll need to add your GitHub token here
// This should be stored securely in a production environment
let authToken = '';

/**
 * Initialize the GitHub storage service
 * @param {string} token - GitHub personal access token
 */
function initGitHubStorage(token) {
    authToken = token;
    localStorage.setItem('github_token', token);
}

/**
 * Load the GitHub token from localStorage if available
 */
function loadStoredToken() {
    const token = localStorage.getItem('github_token');
    if (token) {
        authToken = token;
        return true;
    }
    return false;
}

/**
 * Check if the user is authenticated with GitHub
 * @returns {boolean} - Whether the user is authenticated
 */
function isAuthenticated() {
    return !!authToken;
}

/**
 * Get the base64 SHA of a file in the repository
 * @param {string} path - Path to the file
 * @returns {Promise<string>} - Promise resolving to the SHA
 */
async function getFileSHA(path) {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`, {
            headers: {
                'Authorization': `token ${authToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            return null; // File doesn't exist yet
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        return null;
    }
}

/**
 * Load robot data from the GitHub repository
 * @returns {Promise<Array>} - Promise resolving to array of robot objects
 */
async function loadRobots() {
    try {
        // First try to get the data from the repository
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}?ref=${BRANCH}`);
        
        if (response.status === 404) {
            // File doesn't exist yet, return empty array
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Decode base64 content
        const content = atob(data.content);
        
        // Parse JSON
        return JSON.parse(content);
    } catch (error) {
        console.error('Error loading robots from GitHub:', error);
        
        // Fallback to localStorage if GitHub API fails
        const storedRobots = localStorage.getItem('mook_robotics_hub_robots');
        return storedRobots ? JSON.parse(storedRobots) : [];
    }
}

/**
 * Save robot data to the GitHub repository
 * @param {Array} robots - Array of robot objects
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
async function saveRobots(robots) {
    if (!isAuthenticated()) {
        console.error('Not authenticated with GitHub');
        // Fallback to localStorage
        localStorage.setItem('mook_robotics_hub_robots', JSON.stringify(robots));
        return false;
    }
    
    try {
        // Convert robots to JSON
        const content = JSON.stringify(robots, null, 2);
        
        // Encode content to base64
        const base64Content = btoa(unescape(encodeURIComponent(content)));
        
        // Get the current file's SHA (if it exists)
        const sha = await getFileSHA(DATA_FILE_PATH);
        
        // Prepare the request data
        const requestData = {
            message: 'Update robots data',
            content: base64Content,
            branch: BRANCH
        };
        
        // If the file already exists, include its SHA for updating
        if (sha) {
            requestData.sha = sha;
        }
        
        // Send the request to GitHub API
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${authToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        // Also save to localStorage as a backup
        localStorage.setItem('mook_robotics_hub_robots', JSON.stringify(robots));
        
        return true;
    } catch (error) {
        console.error('Error saving robots to GitHub:', error);
        
        // Fallback to localStorage
        localStorage.setItem('mook_robotics_hub_robots', JSON.stringify(robots));
        
        return false;
    }
}

/**
 * Upload an image to the GitHub repository
 * @param {File} file - The image file to upload
 * @param {string} subfolder - Optional subfolder within images/robots/
 * @returns {Promise<string>} - Promise resolving to the image path
 */
async function uploadImage(file, subfolder = '') {
    if (!isAuthenticated()) {
        console.error('Not authenticated with GitHub');
        // Fallback to the file-upload-service
        const { uploadFile } = await import('./file-upload-service.js');
        return uploadFile(file, 'robots');
    }
    
    try {
        // Read the file as a data URL
        const dataUrl = await readFileAsDataURL(file);
        
        // Extract the base64 data (remove the data URL prefix)
        const base64Data = dataUrl.split(',')[1];
        
        // Generate a unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`.toLowerCase();
        
        // Construct the full path
        const folder = subfolder ? `${IMAGES_FOLDER}${subfolder}/` : IMAGES_FOLDER;
        const path = `${folder}${filename}`;
        
        // Send the request to GitHub API
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${authToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add image: ${filename}`,
                content: base64Data,
                branch: BRANCH
            })
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Return the path to the image (relative to the repository root)
        return path;
    } catch (error) {
        console.error('Error uploading image to GitHub:', error);
        
        // Fallback to the file-upload-service
        const { uploadFile } = await import('./file-upload-service.js');
        return uploadFile(file, 'robots');
    }
}

/**
 * Read a file as a data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} - Promise resolving to the data URL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Delete an image from the GitHub repository
 * @param {string} path - Path to the image
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
async function deleteImage(path) {
    if (!isAuthenticated()) {
        console.error('Not authenticated with GitHub');
        return false;
    }
    
    try {
        // Get the file's SHA
        const sha = await getFileSHA(path);
        
        if (!sha) {
            console.error('Image not found:', path);
            return false;
        }
        
        // Send the request to GitHub API
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${authToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete image: ${path.split('/').pop()}`,
                sha: sha,
                branch: BRANCH
            })
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting image from GitHub:', error);
        return false;
    }
}

/**
 * Create a new folder in the GitHub repository
 * @param {string} path - Path to the folder
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
async function createFolder(path) {
    if (!isAuthenticated()) {
        console.error('Not authenticated with GitHub');
        return false;
    }
    
    try {
        // In GitHub, you create a folder by creating a file inside it
        // So we'll create a .gitkeep file in the folder
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}/.gitkeep`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${authToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Create folder: ${path}`,
                content: btoa(''),  // Empty file content
                branch: BRANCH
            })
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error creating folder in GitHub:', error);
        return false;
    }
}

// Export functions
export {
    initGitHubStorage,
    loadStoredToken,
    isAuthenticated,
    loadRobots,
    saveRobots,
    uploadImage,
    deleteImage,
    createFolder
};
