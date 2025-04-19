// Admin JavaScript for MOOK Robotics Hub
// This file handles admin functionality for managing robots, news, and other content

import { robotService, newsService, authService } from './static-services.js';

// DOM Elements - Dashboard
const robotsTable = document.getElementById('robots-table');
const robotsTableBody = document.getElementById('robots-table-body');
const newsTable = document.getElementById('news-table');
const newsTableBody = document.getElementById('news-table-body');
const initDbBtn = document.getElementById('init-db-btn');

// DOM Elements - Add/Edit Robot Form
const robotForm = document.getElementById('robot-form');
const robotNameInput = document.getElementById('robot-name');
const robotDescriptionInput = document.getElementById('robot-description');
const robotManufacturerInput = document.getElementById('robot-manufacturer');
const robotYearInput = document.getElementById('robot-year');
const robotCategoryInput = document.getElementById('robot-category');
const robotFeaturedCheckbox = document.getElementById('robot-featured');
const robotContentEditor = document.getElementById('robot-content');
const robotMainImageInput = document.getElementById('robot-main-image');
const robotGalleryInput = document.getElementById('robot-gallery');
const robotVideoInput = document.getElementById('robot-video');
const robotSpecificationsContainer = document.getElementById('robot-specifications');
const addSpecificationBtn = document.getElementById('add-specification');
const robotFeaturesContainer = document.getElementById('robot-features');
const addFeatureBtn = document.getElementById('add-feature');

// DOM Elements - Add/Edit News Form
const newsForm = document.getElementById('news-form');
const newsTitleInput = document.getElementById('news-title');
const newsAuthorInput = document.getElementById('news-author');
const newsCategoryInput = document.getElementById('news-category');
const newsPublishDateInput = document.getElementById('news-publish-date');
const newsContentEditor = document.getElementById('news-content');
const newsImageInput = document.getElementById('news-image');

// Current item being edited
let currentRobotId = null;
let currentNewsId = null;

// Initialize admin dashboard
async function initializeAdminDashboard() {
    // Check if user is authorized
    if (!await authService.isAdmin()) {
        // Redirect to login page if not admin
        window.location.href = '../index.html';
        return;
    }
    
    // Load robots data
    await loadRobotsTable();
    
    // Load news data
    await loadNewsTable();
}

// Load robots data into table
async function loadRobotsTable() {
    if (!robotsTableBody) return;
    
    try {
        const robots = await robotService.getAllRobots();
        
        // Clear existing rows
        robotsTableBody.innerHTML = '';
        
        // Add robots to table
        robots.forEach(robot => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${robot.name}</td>
                <td>${robot.manufacturer || 'N/A'}</td>
                <td>${robot.category || 'N/A'}</td>
                <td>${robot.featured ? 'Yes' : 'No'}</td>
                <td>
                    <button class="btn-edit" data-id="${robot.id}">Edit</button>
                    <button class="btn-delete" data-id="${robot.id}">Delete</button>
                </td>
            `;
            
            robotsTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('#robots-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editRobot(btn.dataset.id));
        });
        
        document.querySelectorAll('#robots-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteRobot(btn.dataset.id));
        });
        
    } catch (error) {
        console.error("Error loading robots table:", error);
        displayNotification("Error loading robots. Please try again.", "error");
    }
}

// Load news data into table
async function loadNewsTable() {
    if (!newsTableBody) return;
    
    try {
        const news = await newsService.getAllNews();
        
        // Clear existing rows
        newsTableBody.innerHTML = '';
        
        // Add news to table
        news.forEach(article => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(article.publishDate);
            const formattedDate = date.toLocaleDateString();
            
            row.innerHTML = `
                <td>${article.title}</td>
                <td>${article.author || 'N/A'}</td>
                <td>${article.category || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn-edit" data-id="${article.id}">Edit</button>
                    <button class="btn-delete" data-id="${article.id}">Delete</button>
                </td>
            `;
            
            newsTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('#news-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editNews(btn.dataset.id));
        });
        
        document.querySelectorAll('#news-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteNews(btn.dataset.id));
        });
        
    } catch (error) {
        console.error("Error loading news table:", error);
        displayNotification("Error loading news. Please try again.", "error");
    }
}

// Edit robot
async function editRobot(robotId) {
    try {
        const robot = await robotService.getRobotById(robotId);
        
        // Store current robot ID
        currentRobotId = robotId;
        
        // Fill form with robot data
        if (robotNameInput) robotNameInput.value = robot.name || '';
        if (robotDescriptionInput) robotDescriptionInput.value = robot.description || '';
        if (robotManufacturerInput) robotManufacturerInput.value = robot.manufacturer || '';
        if (robotYearInput) robotYearInput.value = robot.year || '';
        if (robotCategoryInput) robotCategoryInput.value = robot.category || '';
        if (robotFeaturedCheckbox) robotFeaturedCheckbox.checked = robot.featured || false;
        
        // Fill content editor
        if (robotContentEditor) {
            if (typeof tinymce !== 'undefined') {
                tinymce.get('robot-content').setContent(robot.content || '');
            } else {
                robotContentEditor.value = robot.content || '';
            }
        }
        
        // Clear image/video fields (these are file inputs, can't set values)
        
        // Fill specifications
        if (robotSpecificationsContainer) {
            robotSpecificationsContainer.innerHTML = '';
            if (robot.specifications) {
                Object.entries(robot.specifications).forEach(([key, value]) => {
                    addSpecificationField(key, value);
                });
            }
        }
        
        // Fill features
        if (robotFeaturesContainer) {
            robotFeaturesContainer.innerHTML = '';
            if (robot.features && Array.isArray(robot.features)) {
                robot.features.forEach(feature => {
                    addFeatureField(feature);
                });
            }
        }
        
        // Show the edit form section
        document.getElementById('add-robot-section').scrollIntoView();
        document.getElementById('robot-form-title').textContent = 'Edit Robot';
        document.getElementById('robot-submit-btn').textContent = 'Update Robot';
        
    } catch (error) {
        console.error("Error editing robot:", error);
        displayNotification("Error loading robot data. Please try again.", "error");
    }
}

// Delete robot
async function deleteRobot(robotId) {
    if (!confirm("Are you sure you want to delete this robot? This action cannot be undone.")) {
        return;
    }
    
    try {
        await robotService.deleteRobot(robotId);
        displayNotification("Robot deleted successfully.", "success");
        loadRobotsTable();
    } catch (error) {
        console.error("Error deleting robot:", error);
        displayNotification("Error deleting robot. Please try again.", "error");
    }
}

// Edit news
async function editNews(newsId) {
    try {
        const article = await newsService.getNewsById(newsId);
        
        // Store current news ID
        currentNewsId = newsId;
        
        // Fill form with news data
        if (newsTitleInput) newsTitleInput.value = article.title || '';
        if (newsAuthorInput) newsAuthorInput.value = article.author || '';
        if (newsCategoryInput) newsCategoryInput.value = article.category || '';
        if (newsPublishDateInput) {
            const date = new Date(article.publishDate);
            // Format date as YYYY-MM-DD for input
            const formattedDate = date.toISOString().split('T')[0];
            newsPublishDateInput.value = formattedDate;
        }
        
        // Fill content editor
        if (newsContentEditor) {
            if (typeof tinymce !== 'undefined') {
                tinymce.get('news-content').setContent(article.content || '');
            } else {
                newsContentEditor.value = article.content || '';
            }
        }
        
        // Clear image field (file input, can't set value)
        
        // Show the edit form section
        document.getElementById('add-news-section').scrollIntoView();
        document.getElementById('news-form-title').textContent = 'Edit News';
        document.getElementById('news-submit-btn').textContent = 'Update News';
        
    } catch (error) {
        console.error("Error editing news:", error);
        displayNotification("Error loading news data. Please try again.", "error");
    }
}

// Delete news
async function deleteNews(newsId) {
    if (!confirm("Are you sure you want to delete this news article? This action cannot be undone.")) {
        return;
    }
    
    try {
        await newsService.deleteNews(newsId);
        displayNotification("News article deleted successfully.", "success");
        loadNewsTable();
    } catch (error) {
        console.error("Error deleting news:", error);
        displayNotification("Error deleting news article. Please try again.", "error");
    }
}

// Add specification field
function addSpecificationField(key = '', value = '') {
    if (!robotSpecificationsContainer) return;
    
    const field = document.createElement('div');
    field.classList.add('specification-field');
    
    field.innerHTML = `
        <div class="spec-inputs">
            <input type="text" class="spec-key" placeholder="Specification name" value="${key}">
            <input type="text" class="spec-value" placeholder="Value" value="${value}">
        </div>
        <button type="button" class="btn-remove-spec">Remove</button>
    `;
    
    field.querySelector('.btn-remove-spec').addEventListener('click', () => {
        field.remove();
    });
    
    robotSpecificationsContainer.appendChild(field);
}

// Add feature field
function addFeatureField(feature = '') {
    if (!robotFeaturesContainer) return;
    
    const field = document.createElement('div');
    field.classList.add('feature-field');
    
    field.innerHTML = `
        <div class="feature-input">
            <input type="text" class="feature-value" placeholder="Feature" value="${feature}">
        </div>
        <button type="button" class="btn-remove-feature">Remove</button>
    `;
    
    field.querySelector('.btn-remove-feature').addEventListener('click', () => {
        field.remove();
    });
    
    robotFeaturesContainer.appendChild(field);
}

// Get specifications from form
function getSpecificationsFromForm() {
    const specifications = {};
    
    if (!robotSpecificationsContainer) return specifications;
    
    const fields = robotSpecificationsContainer.querySelectorAll('.specification-field');
    fields.forEach(field => {
        const key = field.querySelector('.spec-key').value.trim();
        const value = field.querySelector('.spec-value').value.trim();
        
        if (key && value) {
            specifications[key] = value;
        }
    });
    
    return specifications;
}

// Get features from form
function getFeaturesFromForm() {
    const features = [];
    
    if (!robotFeaturesContainer) return features;
    
    const fields = robotFeaturesContainer.querySelectorAll('.feature-field');
    fields.forEach(field => {
        const value = field.querySelector('.feature-value').value.trim();
        
        if (value) {
            features.push(value);
        }
    });
    
    return features;
}

// Display notification
function displayNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.classList.add(type);
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Initialize database
async function initializeDB() {
    try {
        await initializeDatabase();
        displayNotification("Database initialized successfully with sample data.", "success");
        
        // Reload tables
        await loadRobotsTable();
        await loadNewsTable();
    } catch (error) {
        console.error("Error initializing database:", error);
        displayNotification("Error initializing database. Please try again.", "error");
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const adminStatus = await isAdmin();
            if (adminStatus) {
                // User is an admin, initialize dashboard
                initializeAdminDashboard();
            } else {
                // User is not an admin, redirect to home
                window.location.href = '../index.html';
            }
        } else {
            // User is not logged in, redirect to home
            window.location.href = '../index.html';
        }
    });
    
    // Initialize database button
    if (initDbBtn) {
        initDbBtn.addEventListener('click', initializeDB);
    }
    
    // Add specification button
    if (addSpecificationBtn) {
        addSpecificationBtn.addEventListener('click', () => addSpecificationField());
    }
    
    // Add feature button
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', () => addFeatureField());
    }
    
    // Robot form submission
    if (robotForm) {
        robotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get form data
                const name = robotNameInput.value;
                const description = robotDescriptionInput.value;
                const manufacturer = robotManufacturerInput.value;
                const year = parseInt(robotYearInput.value) || null;
                const category = robotCategoryInput.value;
                const featured = robotFeaturedCheckbox.checked;
                
                // Get content from editor
                let content = '';
                if (typeof tinymce !== 'undefined' && tinymce.get('robot-content')) {
                    content = tinymce.get('robot-content').getContent();
                } else if (robotContentEditor) {
                    content = robotContentEditor.value;
                }
                
                // Get specifications and features
                const specifications = getSpecificationsFromForm();
                const features = getFeaturesFromForm();
                
                // Get files
                const mainImage = robotMainImageInput.files[0] || null;
                const galleryImages = robotGalleryInput.files.length > 0 ? Array.from(robotGalleryInput.files) : [];
                const videoFile = robotVideoInput.files[0] || null;
                
                // Prepare robot data
                const robotData = {
                    name,
                    description,
                    manufacturer,
                    year,
                    category,
                    featured,
                    content,
                    specifications,
                    features
                };
                
                if (currentRobotId) {
                    // Update existing robot
                    await robotService.updateRobot(currentRobotId, robotData, mainImage, galleryImages, videoFile);
                    displayNotification("Robot updated successfully.", "success");
                } else {
                    // Add new robot
                    await robotService.addRobot(robotData, mainImage, galleryImages, videoFile);
                    displayNotification("Robot added successfully.", "success");
                }
                
                // Reset form
                robotForm.reset();
                if (typeof tinymce !== 'undefined' && tinymce.get('robot-content')) {
                    tinymce.get('robot-content').setContent('');
                }
                
                // Clear specifications and features
                if (robotSpecificationsContainer) robotSpecificationsContainer.innerHTML = '';
                if (robotFeaturesContainer) robotFeaturesContainer.innerHTML = '';
                
                // Reset form title and button
                document.getElementById('robot-form-title').textContent = 'Add New Robot';
                document.getElementById('robot-submit-btn').textContent = 'Add Robot';
                
                // Clear current robot ID
                currentRobotId = null;
                
                // Reload robots table
                await loadRobotsTable();
                
            } catch (error) {
                console.error("Error submitting robot form:", error);
                displayNotification("Error saving robot. Please try again.", "error");
            }
        });
    }
    
    // News form submission
    if (newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get form data
                const title = newsTitleInput.value;
                const author = newsAuthorInput.value;
                const category = newsCategoryInput.value;
                const publishDate = newsPublishDateInput.value ? new Date(newsPublishDateInput.value).toISOString() : new Date().toISOString();
                
                // Get content from editor
                let content = '';
                if (typeof tinymce !== 'undefined' && tinymce.get('news-content')) {
                    content = tinymce.get('news-content').getContent();
                } else if (newsContentEditor) {
                    content = newsContentEditor.value;
                }
                
                // Get image
                const image = newsImageInput.files[0] || null;
                
                // Prepare news data
                const newsData = {
                    title,
                    author,
                    category,
                    publishDate,
                    content
                };
                
                if (currentNewsId) {
                    // Update existing news
                    await newsService.updateNews(currentNewsId, newsData, image);
                    displayNotification("News article updated successfully.", "success");
                } else {
                    // Add new news
                    await newsService.addNews(newsData, image);
                    displayNotification("News article added successfully.", "success");
                }
                
                // Reset form
                newsForm.reset();
                if (typeof tinymce !== 'undefined' && tinymce.get('news-content')) {
                    tinymce.get('news-content').setContent('');
                }
                
                // Reset form title and button
                document.getElementById('news-form-title').textContent = 'Add News Article';
                document.getElementById('news-submit-btn').textContent = 'Add News';
                
                // Clear current news ID
                currentNewsId = null;
                
                // Reload news table
                await loadNewsTable();
                
            } catch (error) {
                console.error("Error submitting news form:", error);
                displayNotification("Error saving news article. Please try again.", "error");
            }
        });
    }
});