/**
 * File Upload Service for Mook Robotics Hub
 * This module provides functions for handling file uploads and retrievals
 */

// Since we're using GitHub Pages (static hosting), we can't actually upload files
// This is a mock implementation that simulates file upload/retrieval

// A map to store mock file uploads during the session
const mockUploadedFiles = new Map();

/**
 * Upload a file (mock implementation)
 * @param {File} file - The file to upload
 * @param {string} destination - Destination path (e.g., 'images/robots/')
 * @returns {Promise<string>} - Promise resolving to the file path
 */
async function uploadFile(file, destination = 'images/robots/') {
    return new Promise((resolve) => {
        // In a real implementation, we would upload the file to a server
        // For now, we'll create a mock path and store the file info
        
        // Generate a unique filename using timestamp and original name
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`.toLowerCase();
        const path = `${destination}${filename}`;
        
        // Store file info in our mock storage
        mockUploadedFiles.set(path, {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(),
            url: URL.createObjectURL(file) // Create a temporary URL for the file
        });
        
        // Simulate network delay
        setTimeout(() => {
            resolve(path);
        }, 500);
    });
}

/**
 * Get URL for a file path
 * @param {string} path - File path
 * @returns {string} - URL to access the file
 */
function getFileUrl(path) {
    // Check if this is a mock uploaded file
    if (mockUploadedFiles.has(path)) {
        return mockUploadedFiles.get(path).url;
    }
    
    // If path is already a complete URL, return it
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
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
 * Delete a file (mock implementation)
 * @param {string} path - Path of the file to delete
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
async function deleteFile(path) {
    return new Promise((resolve) => {
        // In a real implementation, we would delete the file from the server
        // For mock implementation, we'll just remove it from our mock storage
        
        const deleted = mockUploadedFiles.delete(path);
        
        // Simulate network delay
        setTimeout(() => {
            resolve(deleted);
        }, 300);
    });
}

/**
 * List files in a directory (mock implementation)
 * @param {string} directory - Directory to list files from
 * @returns {Promise<Array>} - Promise resolving to array of file info objects
 */
async function listFiles(directory = 'images/robots/') {
    return new Promise((resolve) => {
        // Create an array of files that match the directory prefix
        const files = [];
        
        for (const [path, fileInfo] of mockUploadedFiles.entries()) {
            if (path.startsWith(directory)) {
                files.push({
                    path,
                    ...fileInfo
                });
            }
        }
        
        // Simulate network delay
        setTimeout(() => {
            resolve(files);
        }, 200);
    });
}

// Export the functions
export {
    uploadFile,
    getFileUrl,
    deleteFile,
    listFiles
};
