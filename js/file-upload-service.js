/**
 * File Upload Service for Mook Robotics Hub
 * This module provides functions for handling file uploads and retrievals.
 * Since we're using GitHub Pages (static hosting), this implementation
 * uses localStorage to persist uploaded files across sessions.
 */

// Storage key for uploaded files
const UPLOADED_FILES_KEY = 'mook_robotics_uploaded_files';

// Initialize uploaded files map
let uploadedFiles = new Map();

// Load any previously uploaded files from localStorage
(function initializeUploadedFiles() {
    try {
        const storedFiles = localStorage.getItem(UPLOADED_FILES_KEY);
        if (storedFiles) {
            const filesArray = JSON.parse(storedFiles);
            filesArray.forEach(([path, fileInfo]) => {
                // For URLs stored in localStorage, we need to recreate them
                if (fileInfo.dataUrl) {
                    uploadedFiles.set(path, {
                        ...fileInfo,
                        url: fileInfo.dataUrl
                    });
                } else {
                    uploadedFiles.set(path, fileInfo);
                }
            });
        }
    } catch (error) {
        console.error('Error loading uploaded files from localStorage:', error);
    }
})();

/**
 * Save uploaded files to localStorage
 */
function saveUploadedFiles() {
    try {
        // Convert Map to Array for JSON serialization
        const filesArray = Array.from(uploadedFiles.entries()).map(([path, fileInfo]) => {
            // Store the data URL instead of the object URL
            return [path, {
                ...fileInfo,
                url: undefined, // Don't store the URL as it won't be valid in a new session
                dataUrl: fileInfo.dataUrl // Store the data URL for persistence
            }];
        });
        localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(filesArray));
    } catch (error) {
        console.error('Error saving uploaded files to localStorage:', error);
    }
}

/**
 * Upload a file and persist it
 * @param {File} file - The file to upload
 * @param {string} destination - Destination folder (e.g., 'robots')
 * @returns {Promise<string>} - Promise resolving to the file path
 */
async function uploadFile(file, destination = 'robots') {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }
        
        // Generate a unique filename using timestamp and original name
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`.toLowerCase();
        const path = `images/${destination}/${filename}`;
        
        // Read the file and create a data URL for persistence
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            
            // Store file info in our storage
            uploadedFiles.set(path, {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: new Date(),
                url: dataUrl, // Use data URL for both display and storage
                dataUrl: dataUrl
            });
            
            // Save to localStorage
            saveUploadedFiles();
            
            // Resolve with the path
            resolve(path);
        };
        
        reader.onerror = function() {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Upload multiple files
 * @param {Array<File>} files - Array of files to upload
 * @param {string} destination - Destination folder
 * @returns {Promise<Array<string>>} - Promise resolving to array of file paths
 */
async function uploadMultipleFiles(files, destination = 'robots') {
    if (!files || files.length === 0) {
        return [];
    }
    
    try {
        const paths = [];
        for (const file of files) {
            const path = await uploadFile(file, destination);
            paths.push(path);
        }
        return paths;
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
}

/**
 * Get URL for a file path
 * @param {string} path - File path
 * @returns {string} - URL to access the file
 */
function getFileUrl(path) {
    // Check if this is an uploaded file
    if (uploadedFiles.has(path)) {
        return uploadedFiles.get(path).url;
    }
    
    // If path is already a complete URL or data URL, return it
    if (path && (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:'))) {
        return path;
    }
    
    // Handle empty or undefined paths
    if (!path) {
        return 'images/robots/placeholder.jpg';
    }
    
    // For static files, construct the path based on the repository structure
    return path;
}

/**
 * Delete a file
 * @param {string} path - Path of the file to delete
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
async function deleteFile(path) {
    return new Promise((resolve) => {
        // Remove from our storage
        const deleted = uploadedFiles.delete(path);
        
        if (deleted) {
            // Save updated storage
            saveUploadedFiles();
        }
        
        resolve(deleted);
    });
}

/**
 * List files in a directory
 * @param {string} directory - Directory to list files from
 * @returns {Promise<Array>} - Promise resolving to array of file info objects
 */
async function listFiles(directory = 'images/robots/') {
    return new Promise((resolve) => {
        // Create an array of files that match the directory prefix
        const files = [];
        
        for (const [path, fileInfo] of uploadedFiles.entries()) {
            if (path.startsWith(directory)) {
                files.push({
                    path,
                    ...fileInfo
                });
            }
        }
        
        resolve(files);
    });
}

// Export the functions
export {
    uploadFile,
    uploadMultipleFiles,
    getFileUrl,
    deleteFile,
    listFiles
};
