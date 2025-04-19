// Admin JavaScript for MOOK Robotics Hub
// This file handles admin functionality for managing robots, news, and other content

import { robotService, newsService, authService } from './static-services.js';

// DOM Elements - Dashboard
const robotsTable = document.getElementById('robots-table');
const robotsTableBody = document.getElementById('robots-table-body');
const newsTable = document.getElementById('news-table');
const newsTableBody = document.getElementById('news-table-body');
const initDbBtn = document.getElementById('init-db-btn');
const addNewsBtns = document.querySelectorAll('.add-news-btn');

// DOM Elements - Add/Edit News Modal
const newsModal = document.getElementById('news-modal');
const newsForm = document.getElementById('news-form');
const newsTitleInput = document.getElementById('news-title');
const newsAuthorInput = document.getElementById('news-author');
const newsCategoryInput = document.getElementById('news-category');
const newsPublishDateInput = document.getElementById('news-publish-date');
const newsContentEditor = document.getElementById('news-content');
const newsImageInput = document.getElementById('news-image');
const newsImagePreview = document.getElementById('news-image-preview');
const newsFormTitle = document.getElementById('news-form-title');
const newsSubmitBtn = document.getElementById('news-submit-btn');
const newsCancelBtn = document.getElementById('news-cancel-btn');

// DOM Elements - Navigation
const adminNavLinks = document.querySelectorAll('.admin-nav a');
const adminSections = document.querySelectorAll('.admin-section');

// Current item being edited
let currentNewsId = null;

// Initialize admin dashboard
async function initializeAdminDashboard() {
    // Check if user is authorized
    if (!authService.isAdmin()) {
        // Redirect to login page if not admin
        window.location.href = '../index.html';
        return;
    }
    
    // Load robots data
    await loadRobotsTable();
    
    // Load news data
    await loadNewsTable();
    
    // Set up admin navigation
    setupAdminNavigation();
    
    // Set up news modal
    setupNewsModal();
}

// Set up admin navigation
function setupAdminNavigation() {
    adminNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            adminNavLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section id
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            adminSections.forEach(section => section.classList.remove('active'));
            
            // Show target section
            document.getElementById(targetId).classList.add('active');
        });
    });
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
    // For this static version, just show a notification
    displayNotification("Edit robot functionality would open the robot editor page.", "info");
    
    // In a full implementation, this would redirect to the add-robot.html page with the robot data
    window.location.href = `add-robot.html?id=${robotId}`;
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

// Set up news modal
function setupNewsModal() {
    // Add event listeners to "Add News" buttons
    addNewsBtns.forEach(btn => {
        btn.addEventListener('click', () => showNewsModal());
    });
    
    // Add event listener to news form
    if (newsForm) {
        newsForm.addEventListener('submit', handleNewsFormSubmit);
    }
    
    // Add event listener to news cancel button
    if (newsCancelBtn) {
        newsCancelBtn.addEventListener('click', hideNewsModal);
    }
    
    // Add event listener to news modal close button
    if (newsModal) {
        const closeBtn = newsModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideNewsModal);
        }
        
        // Close when clicking outside
        newsModal.addEventListener('click', (e) => {
            if (e.target === newsModal) {
                hideNewsModal();
            }
        });
    }
    
    // Add preview functionality for news image
    if (newsImageInput) {
        newsImageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    newsImagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Image preview">
                        <button type="button" class="btn-remove-image">Remove</button>
                    `;
                    
                    // Add event listener to remove button
                    const removeBtn = newsImagePreview.querySelector('.btn-remove-image');
                    removeBtn.addEventListener('click', () => {
                        newsImageInput.value = "";
                        newsImagePreview.innerHTML = "";
                    });
                }
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

// Show news modal for adding/editing
function showNewsModal(newsItem = null) {
    if (!newsModal) return;
    
    // Reset the form
    resetNewsForm();
    
    // If editing an existing news item
    if (newsItem) {
        currentNewsId = newsItem.id;
        
        // Set form values
        newsTitleInput.value = newsItem.title || '';
        newsAuthorInput.value = newsItem.author || '';
        newsCategoryInput.value = newsItem.category || '';
        
        // Format date for input
        if (newsItem.publishDate) {
            const date = new Date(newsItem.publishDate);
            const formattedDate = date.toISOString().split('T')[0];
            newsPublishDateInput.value = formattedDate;
        }
        
        newsContentEditor.value = newsItem.content || '';
        
        // Show image preview if exists
        if (newsItem.image) {
            newsImagePreview.innerHTML = `
                <img src="${newsItem.image}" alt="Image preview">
                <button type="button" class="btn-remove-image">Remove</button>
            `;
            
            // Add event listener to remove button
            const removeBtn = newsImagePreview.querySelector('.btn-remove-image');
            removeBtn.addEventListener('click', () => {
                newsImageInput.value = "";
                newsImagePreview.innerHTML = "";
            });
        }
        
        // Update modal title and button text
        newsFormTitle.textContent = 'Edit News Article';
        newsSubmitBtn.textContent = 'Update News';
    } else {
        currentNewsId = null;
        newsFormTitle.textContent = 'Add News Article';
        newsSubmitBtn.textContent = 'Add News';
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        newsPublishDateInput.value = today;
    }
    
    // Show the modal
    newsModal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

// Hide news modal
function hideNewsModal() {
    if (!newsModal) return;
    
    newsModal.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // Reset form and current news ID
    resetNewsForm();
    currentNewsId = null;
}

// Reset news form
function resetNewsForm() {
    if (!newsForm) return;
    
    newsForm.reset();
    newsImagePreview.innerHTML = '';
}

// Handle news form submission
async function handleNewsFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const title = newsTitleInput.value;
        const author = newsAuthorInput.value;
        const category = newsCategoryInput.value;
        const publishDate = newsPublishDateInput.value;
        const content = newsContentEditor.value;
        
        // Get image file and create a DataURL (as a fallback for this static version)
        let imageUrl = '';
        if (newsImageInput.files && newsImageInput.files[0]) {
            const reader = new FileReader();
            
            // Convert to promise
            imageUrl = await new Promise((resolve) => {
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(newsImageInput.files[0]);
            });
        }
        
        // Prepare news data
        const newsData = {
            title,
            author,
            category,
            publishDate: new Date(publishDate).toISOString(),
            content,
            image: imageUrl
        };
        
        if (currentNewsId) {
            // Update existing news
            await newsService.updateNews(currentNewsId, newsData);
            displayNotification("News article updated successfully.", "success");
        } else {
            // Add new news
            await newsService.addNews(newsData);
            displayNotification("News article added successfully.", "success");
        }
        
        // Hide modal and reload news table
        hideNewsModal();
        await loadNewsTable();
        
        // If adding a new article, update the news count in the dashboard
        const newsCountElement = document.querySelector('.stat-value:nth-of-type(2)');
        if (newsCountElement) {
            const allNews = await newsService.getAllNews();
            newsCountElement.textContent = allNews.length;
        }
        
    } catch (error) {
        console.error("Error submitting news form:", error);
        displayNotification("Error saving news article. Please try again.", "error");
    }
}

// Edit news
async function editNews(newsId) {
    try {
        const article = await newsService.getNewsById(newsId);
        showNewsModal(article);
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
        await loadNewsTable();
        
        // Update the news count in the dashboard
        const newsCountElement = document.querySelector('.stat-value:nth-of-type(2)');
        if (newsCountElement) {
            const allNews = await newsService.getAllNews();
            newsCountElement.textContent = allNews.length;
        }
    } catch (error) {
        console.error("Error deleting news:", error);
        displayNotification("Error deleting news article. Please try again.", "error");
    }
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

// Initialize database (for demo purposes)
async function initializeDB() {
    displayNotification("Database initialization would normally happen here. In this static version, data is already loaded.", "info");
    
    // Reload tables
    await loadRobotsTable();
    await loadNewsTable();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    initializeAdminDashboard();
    
    // Initialize database button
    if (initDbBtn) {
        initDbBtn.addEventListener('click', initializeDB);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await authService.logout();
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Logout error:', error);
                displayNotification("Error logging out. Please try again.", "error");
            }
        });
    }
});