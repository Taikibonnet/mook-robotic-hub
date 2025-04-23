/**
 * Admin dashboard functionality for MOOK Robotics Hub
 */

import { getAllRobots, deleteRobot } from './robot-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (document.querySelector('.admin-dashboard')) {
        initAdminDashboard();
    }
});

/**
 * Initialize the admin dashboard
 */
function initAdminDashboard() {
    console.log('Initializing admin dashboard...');
    
    // Load robots
    loadRobots();
    
    // Initialize tabs
    initTabs();
    
    // Init add robot button
    const addRobotBtn = document.getElementById('add-robot-btn');
    if (addRobotBtn) {
        addRobotBtn.addEventListener('click', function() {
            window.location.href = 'add-robot.html';
        });
    }
    
    // Init add news button
    const addNewsBtn = document.getElementById('add-news-btn');
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', function() {
            window.location.href = 'add-news.html';
        });
    }
}

/**
 * Load robots for the admin dashboard
 */
function loadRobots() {
    console.log('Loading robots for admin dashboard...');
    
    const robotsContainer = document.getElementById('admin-robots-list');
    if (!robotsContainer) {
        console.error('Robots container not found');
        return;
    }
    
    // Clear loading message
    robotsContainer.innerHTML = '';
    
    // Get all robots
    try {
        const robots = getAllRobots();
        
        if (robots.length === 0) {
            robotsContainer.innerHTML = '<p class="no-items">No robots found.</p>';
            return;
        }
        
        // Sort robots by name
        robots.sort((a, b) => a.name.localeCompare(b.name));
        
        // Add each robot to the list
        robots.forEach(robot => {
            const robotItem = document.createElement('div');
            robotItem.className = 'admin-item';
            robotItem.innerHTML = `
                <div class="admin-item-image">
                    <img src="${robot.mainImage || '../images/robots/placeholder.jpg'}" alt="${robot.name}" onerror="this.src='../images/robots/placeholder.jpg'">
                </div>
                <div class="admin-item-info">
                    <h3>${robot.name}</h3>
                    <p>${robot.manufacturer || 'Unknown manufacturer'} | ${robot.year || 'Year unknown'}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small edit-item" data-id="${robot.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger delete-item" data-id="${robot.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            robotsContainer.appendChild(robotItem);
            
            // Add event listeners
            const editBtn = robotItem.querySelector('.edit-item');
            const deleteBtn = robotItem.querySelector('.delete-item');
            
            editBtn.addEventListener('click', function() {
                const robotId = this.getAttribute('data-id');
                window.location.href = `edit-robot.html?id=${robotId}`;
            });
            
            deleteBtn.addEventListener('click', function() {
                const robotId = this.getAttribute('data-id');
                deleteRobotItem(robotId, robotItem);
            });
        });
    } catch (error) {
        console.error('Error loading robots:', error);
        robotsContainer.innerHTML = '<p class="error-message">Error loading robots. Please try again.</p>';
    }
}

/**
 * Delete a robot
 * @param {string} id - Robot ID
 * @param {Element} element - DOM element to remove on success
 */
function deleteRobotItem(id, element) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this robot? This action cannot be undone.')) {
        try {
            const success = deleteRobot(id);
            
            if (success) {
                // Remove element from DOM
                element.remove();
                
                // If no robots left, show message
                const robotsContainer = document.getElementById('admin-robots-list');
                if (robotsContainer.children.length === 0) {
                    robotsContainer.innerHTML = '<p class="no-items">No robots found.</p>';
                }
                
                // Show success message
                showMessage('Robot deleted successfully.', 'success');
            } else {
                showMessage('Failed to delete robot.', 'error');
            }
        } catch (error) {
            console.error('Error deleting robot:', error);
            showMessage('Error deleting robot: ' + error.message, 'error');
        }
    }
}

/**
 * Initialize tab navigation
 */
function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected tab content
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.style.display = 'block';
            }
        });
    });
    
    // Activate the first tab by default
    if (tabs.length > 0) {
        tabs[0].click();
    }
}

/**
 * Show a temporary message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    // Check if message container exists, if not create it
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.innerHTML = `
        <div class="message-content">
            <span>${message}</span>
            <button class="message-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Add close button event
    const closeBtn = messageElement.querySelector('.message-close');
    closeBtn.addEventListener('click', function() {
        messageElement.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode === messageContainer) {
            messageElement.remove();
        }
    }, 5000);
}