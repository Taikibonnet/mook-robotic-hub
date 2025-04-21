/**
 * MOOK Robotics Hub - File Upload Service
 * 
 * This file contains functions for handling file uploads,
 * including converting files to base64 and storing them in the repository.
 */

/**
 * Upload a file to the images directory
 * @param {File} file - The file object to upload
 * @param {string} subdirectory - Subdirectory within the images folder (e.g., 'robots', 'news')
 * @returns {Promise<string>} - Promise resolving to the file path
 */
export async function uploadFile(file, subdirectory = '') {
    try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        
        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Create a unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const safeFilename = file.name
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, '-')
            .replace(/-+/g, '-');
        
        const uniqueFilename = `${timestamp}-${randomId}-${safeFilename}`;
        
        // Determine the directory path
        const directory = subdirectory ? `images/${subdirectory}` : 'images';
        
        // Store file data in localStorage temporarily
        // This is a workaround since we can't directly upload to the GitHub repository in this demo
        // In a real application, you would upload this to your server or cloud storage
        const filePath = `${directory}/${uniqueFilename}`;
        localStorage.setItem(`file:${filePath}`, base64Data);
        
        console.log(`File uploaded to: ${filePath}`);
        
        // In a GitHub Pages environment, we'll store the file info in localStorage
        // so we can retrieve it later
        const uploadedFiles = JSON.parse(localStorage.getItem('mookUploadedFiles') || '[]');
        uploadedFiles.push({
            path: filePath,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString()
        });
        localStorage.setItem('mookUploadedFiles', JSON.stringify(uploadedFiles));
        
        return filePath;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

/**
 * Upload multiple files
 * @param {FileList} files - The files to upload
 * @param {string} subdirectory - Subdirectory within the images folder
 * @returns {Promise<string[]>} - Promise resolving to array of file paths
 */
export async function uploadMultipleFiles(files, subdirectory = '') {
    const uploadPromises = [];
    
    for (let i = 0; i < files.length; i++) {
        uploadPromises.push(uploadFile(files[i], subdirectory));
    }
    
    return Promise.all(uploadPromises);
}

/**
 * Convert a file to base64
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise resolving to base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Get the base64 data (remove the data URL prefix)
            const base64Data = e.target.result.split(',')[1];
            resolve(base64Data);
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Get a file's URL by path 
 * @param {string} filePath - Path to the file
 * @returns {string} - URL to display the file
 */
export function getFileUrl(filePath) {
    // First check if this is one of our uploaded files
    const base64Data = localStorage.getItem(`file:${filePath}`);
    
    if (base64Data) {
        // It's one of our uploaded files, create a data URL
        // Determine the MIME type based on extension
        const extension = filePath.split('.').pop().toLowerCase();
        let mimeType = 'application/octet-stream'; // Default
        
        // Map common extensions to MIME types
        const mimeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg'
        };
        
        if (mimeMap[extension]) {
            mimeType = mimeMap[extension];
        }
        
        return `data:${mimeType};base64,${base64Data}`;
    }
    
    // Not one of our uploaded files, assume it's a regular file path
    return filePath;
}
