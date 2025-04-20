/**
 * MOOK Robotics Hub - File Utilities
 * 
 * This file provides utilities for handling file-related operations
 * in a static website environment.
 */

/**
 * Create a placeholder image data URL
 * @param {string} text - Text to display in the placeholder
 * @param {number} [width=400] - Width of the placeholder
 * @param {number} [height=300] - Height of the placeholder
 * @param {string} [bgColor='#e9e9e9'] - Background color
 * @param {string} [textColor='#666666'] - Text color
 * @returns {string} Data URL for the placeholder image
 */
function createPlaceholderImage(text, width = 400, height = 300, bgColor = '#e9e9e9', textColor = '#666666') {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // Get the drawing context
    const ctx = canvas.getContext('2d');
    
    // Fill the background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'Placeholder Image', width / 2, height / 2);
    
    // Return the data URL
    return canvas.toDataURL('image/png');
}

/**
 * Convert a File object to a Data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Promise resolving to a data URL
 */
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Simulate uploading a file to the server
 * In this static implementation, it just returns the data URL
 * @param {File} file - The file to "upload"
 * @param {string} [folder='robots'] - The target folder
 * @returns {Promise<string>} Promise resolving to the simulated file path
 */
function uploadFile(file, folder = 'robots') {
    return new Promise((resolve, reject) => {
        // In a real implementation, this would upload the file to a server
        // For our static site, we'll simulate it
        
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }
        
        // Convert file to data URL
        fileToDataUrl(file)
            .then(dataUrl => {
                // In a real app, we'd upload the file here
                // For our static app, we'll store it in localStorage as a simulation
                
                // Generate a unique filename
                const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
                
                // Store the "uploaded" file
                localStorage.setItem(`mookRoboticsFile_${filename}`, dataUrl);
                
                // Return the simulated path
                resolve(`images/${filename}`);
            })
            .catch(reject);
    });
}

/**
 * Check if an image exists at the given path
 * @param {string} path - The image path to check
 * @returns {Promise<boolean>} Promise resolving to whether the image exists
 */
function imageExists(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = path;
    });
}

/**
 * Get a valid image path, falling back to placeholder if necessary
 * @param {string} path - The image path to check
 * @param {string} [fallbackText='Image Not Found'] - Fallback text for placeholder
 * @returns {Promise<string>} Promise resolving to valid image path
 */
function getValidImagePath(path, fallbackText = 'Image Not Found') {
    return imageExists(path)
        .then(exists => exists ? path : createPlaceholderImage(fallbackText));
}

// Export functions
export {
    createPlaceholderImage,
    fileToDataUrl,
    uploadFile,
    imageExists,
    getValidImagePath
};
