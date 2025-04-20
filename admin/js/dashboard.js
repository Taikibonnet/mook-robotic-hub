/**
 * MOOK Robotics Hub - Admin Dashboard JavaScript
 * 
 * This file contains functionality for the admin dashboard,
 * including loading real-time data for robots, users, and news.
 */

import { getAllRobots } from '../../js/robot-service.js';
import { getAllNews } from '../../js/news-service.js';
import { USERS_DATA } from '../../js/data.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Add click events for quick action buttons
    initQuickActions();
});

/**
 * Initialize the dashboard with real-time data
 */
function initDashboard() {
    // Load counts for dashboard stats
    loadDashboardStats();
    
    // Load popular robots
    loadPopularRobots();
    
    // Load recent users
    loadRecentUsers();
    
    // Load recent activity
    loadRecentActivity();
}

/**
 * Load real-time statistics for the dashboard
 */
function loadDashboardStats() {
    // Get all the needed data
    const robots = getAllRobots();
    const users = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    const defaultUsers = USERS_DATA;
    const allUsers = [...defaultUsers, ...users];
    const news = getAllNews();
    
    // Calculate page views (stored in localStorage)
    const pageViews = parseInt(localStorage.getItem('mookRoboticsTotalViews') || '0');
    
    // Update stat cards with real data
    updateStatCard('Total Robots', robots.length);
    updateStatCard('Registered Users', allUsers.length);
    updateStatCard('Page Views', pageViews || 2843); // Fallback to default if no views recorded
    updateStatCard('News Articles', news.length);
}

/**
 * Update a statistic card with real data
 * @param {string} statTitle - The title of the statistic
 * @param {number} value - The value to display
 */
function updateStatCard(statTitle, value) {
    // Find the stat card with this title
    const statCards = document.querySelectorAll('.stat-card');
    
    for (const card of statCards) {
        const title = card.querySelector('h3').textContent;
        
        if (title === statTitle) {
            card.querySelector('p').textContent = value.toLocaleString();
            break;
        }
    }
}

/**
 * Load popular robots for the dashboard
 */
function loadPopularRobots() {
    const robots = getAllRobots();
    const tableBody = document.querySelector('.popular-robots tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort robots by views (in a real application)
    // For now, we'll use mock view counts
    const robotsWithViews = robots.map(robot => {
        // Generate a random number of views between 100 and 1000
        const views = Math.floor(Math.random() * 900) + 100;
        return { ...robot, views };
    });
    
    // Sort by views (highest first)
    robotsWithViews.sort((a, b) => b.views - a.views);
    
    // Take the top 4 robots
    const popularRobots = robotsWithViews.slice(0, 4);
    
    // Add rows to the table
    for (const robot of popularRobots) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="robot-list-item">
                    <div class="list-item-img" style="background-image: url('../${robot.mainImage}')"></div>
                    <span>${robot.name}</span>
                </div>
            </td>
            <td>${robot.views}</td>
            <td>
                <div class="table-actions">
                    <a href="edit-robot.html?id=${robot.id}" class="table-action edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a href="../robots/${robot.slug}.html" class="table-action view">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
}

/**
 * Load recent users for the dashboard
 */
function loadRecentUsers() {
    // Get users from localStorage (combined with default users)
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    const defaultUsers = USERS_DATA;
    const allUsers = [...defaultUsers, ...storedUsers];
    
    // Sort users by creation date (newest first)
    allUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
    });
    
    // Get the table body for recent users
    const tableBody = document.querySelector('.recent-users tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Take the latest 4 users
    const recentUsers = allUsers.slice(0, 4);
    
    // Add rows to the table
    for (const user of recentUsers) {
        // Calculate time since registration
        const joinedText = getTimeAgo(user.createdAt);
        
        // Get initials for avatar
        const initials = getInitials(user.name || user.email);
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="user-list-item">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <span class="user-name">${user.name || 'User'}</span>
                        <span class="user-email">${user.email}</span>
                    </div>
                </div>
            </td>
            <td>${joinedText}</td>
            <td>
                <div class="table-actions">
                    <a href="user-detail.html?id=${user.id}" class="table-action view">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="mailto:${user.email}" class="table-action message">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
}

/**
 * Load recent activity for the dashboard
 */
function loadRecentActivity() {
    // In a real application, we would load actual activity data
    // For now, we'll use the static HTML that's already in the page
    
    // Check if we have any activity data in localStorage
    const activities = JSON.parse(localStorage.getItem('mookRoboticsActivities') || '[]');
    
    if (activities.length === 0) return;
    
    // Get the activity list
    const activityList = document.querySelector('.activity-list');
    
    if (!activityList) return;
    
    // Clear existing activities
    activityList.innerHTML = '';
    
    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
    });
    
    // Take the latest 5 activities
    const recentActivities = activities.slice(0, 5);
    
    // Add activities to the list
    for (const activity of recentActivities) {
        const li = document.createElement('li');
        li.className = 'activity-item';
        
        // Get icon class based on activity type
        const iconClass = getActivityIcon(activity.type);
        
        // Calculate time ago
        const timeAgo = getTimeAgo(activity.timestamp);
        
        li.innerHTML = `
            <div class="activity-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <p class="activity-text">${activity.text}</p>
                <p class="activity-time">${timeAgo}</p>
            </div>
        `;
        
        activityList.appendChild(li);
    }
}

/**
 * Initialize quick action buttons
 */
function initQuickActions() {
    const actionButtons = document.querySelectorAll('.action-button');
    
    if (actionButtons.length > 0) {
        actionButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // If there's an href attribute, the link will work automatically
                // This is for actions that don't have a direct link
                if (!this.getAttribute('href')) {
                    e.preventDefault();
                    
                    // Check which action to perform based on the icon or text
                    const icon = this.querySelector('i');
                    const text = this.querySelector('span').textContent;
                    
                    if (icon.classList.contains('fa-cog') || text.includes('Settings')) {
                        // Settings action
                        window.location.href = 'settings.html';
                    } else if (icon.classList.contains('fa-download') || text.includes('Export')) {
                        // Export data action
                        exportData();
                    }
                }
            });
        });
    }
}

/**
 * Export data functionality (placeholder)
 */
function exportData() {
    // Get all the data
    const data = {
        robots: getAllRobots(),
        news: getAllNews(),
        users: USERS_DATA
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create a Blob with the data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a link element to download the data
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mook-robotics-data.json';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

/**
 * Get a user's initials from their name or email
 * @param {string} nameOrEmail - User's name or email
 * @returns {string} User's initials
 */
function getInitials(nameOrEmail) {
    if (!nameOrEmail) return '??';
    
    // If it's an email, use the first two characters of the username
    if (nameOrEmail.includes('@')) {
        const username = nameOrEmail.split('@')[0];
        return username.substring(0, 2).toUpperCase();
    }
    
    // Otherwise, get initials from name
    const parts = nameOrEmail.split(' ');
    
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get the time ago from a timestamp
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Human-readable time ago
 */
function getTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    }
    
    if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    return 'Just now';
}

/**
 * Get an icon class based on activity type
 * @param {string} type - Activity type
 * @returns {string} Font Awesome icon class
 */
function getActivityIcon(type) {
    switch (type) {
        case 'user':
            return 'fas fa-user-plus';
        case 'robot':
            return 'fas fa-robot';
        case 'edit':
            return 'fas fa-edit';
        case 'comment':
            return 'fas fa-comment';
        case 'news':
            return 'fas fa-newspaper';
        default:
            return 'fas fa-info-circle';
    }
}

// Helper function to log an activity (for use in other admin pages)
export function logActivity(type, text) {
    const activities = JSON.parse(localStorage.getItem('mookRoboticsActivities') || '[]');
    
    activities.push({
        type,
        text,
        timestamp: new Date().toISOString()
    });
    
    // Keep only the latest 50 activities
    if (activities.length > 50) {
        activities.splice(0, activities.length - 50);
    }
    
    localStorage.setItem('mookRoboticsActivities', JSON.stringify(activities));
}
