/**
 * MOOK Robotics Hub - Admin Dashboard JavaScript
 * 
 * This file contains the logic for the admin dashboard,
 * including loading and displaying robot and user statistics.
 */

import { getAllRobots, deleteRobot } from '../js/robot-service.js';

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    initDashboardEvents();
});

/**
 * Load data for the dashboard
 */
function loadDashboardData() {
    // Load robot data
    loadRobotTable();
    
    // Update statistics
    updateDashboardStats();
}

/**
 * Initialize dashboard event handlers
 */
function initDashboardEvents() {
    // Handle robot actions (edit, delete)
    const robotTable = document.getElementById('robots-table');
    if (robotTable) {
        robotTable.addEventListener('click', function(e) {
            // Edit button
            if (e.target.classList.contains('edit-robot-btn') || 
                e.target.closest('.edit-robot-btn')) {
                const row = e.target.closest('tr');
                const robotId = row.dataset.robotId;
                editRobot(robotId);
            }
            
            // Delete button
            if (e.target.classList.contains('delete-robot-btn') || 
                e.target.closest('.delete-robot-btn')) {
                const row = e.target.closest('tr');
                const robotId = row.dataset.robotId;
                const robotName = row.querySelector('td:nth-child(2)').textContent;
                confirmDeleteRobot(robotId, robotName);
            }
        });
    }
}

/**
 * Load robot data into the dashboard table
 */
function loadRobotTable() {
    const tableBody = document.querySelector('#robots-table tbody');
    
    if (!tableBody) return;
    
    // Get all robots
    const robots = getAllRobots();
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add robots to table
    if (robots.length > 0) {
        robots.forEach((robot, index) => {
            const row = document.createElement('tr');
            row.dataset.robotId = robot.id;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${robot.name}</td>
                <td>${robot.manufacturer || 'N/A'}</td>
                <td>${robot.category || 'Uncategorized'}</td>
                <td>${robot.year || 'Unknown'}</td>
                <td>
                    <button class="edit-robot-btn btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-robot-btn btn-icon" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } else {
        // No robots
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6">
                <div class="empty-state">
                    <i class="fas fa-robot"></i>
                    <p>No robots found</p>
                    <a href="add-robot.html" class="btn btn-primary">Add Robot</a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    // Get statistics elements
    const totalRobots = document.getElementById('total-robots');
    const totalVisits = document.getElementById('total-visits');
    const totalUsers = document.getElementById('total-users');
    const totalNews = document.getElementById('total-news');
    
    // Get data
    const robots = getAllRobots();
    const users = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    
    // For demo purposes, generate random visit count
    const visits = Math.floor(Math.random() * 1000) + 100;
    
    // Update statistics
    if (totalRobots) totalRobots.textContent = robots.length;
    if (totalVisits) totalVisits.textContent = visits;
    if (totalUsers) totalUsers.textContent = users.length + 1; // +1 for admin
    if (totalNews) totalNews.textContent = '3'; // Static for now
}

/**
 * Redirect to edit robot page
 * @param {string} robotId - Robot ID
 */
function editRobot(robotId) {
    window.location.href = `edit-robot.html?id=${robotId}`;
}

/**
 * Show confirmation dialog for deleting a robot
 * @param {string} robotId - Robot ID
 * @param {string} robotName - Robot name
 */
function confirmDeleteRobot(robotId, robotName) {
    if (confirm(`Are you sure you want to delete "${robotName}"? This action cannot be undone.`)) {
        if (deleteRobot(robotId)) {
            alert(`Robot "${robotName}" has been deleted.`);
            loadRobotTable();
            updateDashboardStats();
        } else {
            alert('Failed to delete robot. Please try again.');
        }
    }
}

// Fix for admin.js to properly import from robot-service
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('mookRoboticsUser') || '{"email":"tgen.robotics@gmail.com","isAdmin":true}');
    
    // For demo purposes, we'll allow access even if not logged in
    if (!user.email || user.isAdmin !== true) {
        console.log('For demo purposes, admin access is granted without login');
        // Automatically set admin credentials
        localStorage.setItem('mookRoboticsUser', JSON.stringify({
            email: 'tgen.robotics@gmail.com',
            name: 'Administrator',
            isAdmin: true,
            lastLogin: new Date().toISOString()
        }));
    }
}

// Run the admin auth check
checkAdminAuth();

// Export functions for use in other scripts
export {
    loadDashboardData,
    loadRobotTable,
    updateDashboardStats
};
