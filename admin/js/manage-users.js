/**
 * MOOK Robotics Hub - User Management JavaScript
 * 
 * This file contains functionality for managing users in the admin panel,
 * including viewing, adding, editing, and deleting users.
 */

import { USERS_DATA } from '../../js/data.js';
import { logActivity } from './dashboard.js';

// Global variables for pagination
const USERS_PER_PAGE = 10;
let currentPage = 1;
let totalPages = 1;
let filteredUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize users
    initUsers();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the users page
 */
function initUsers() {
    // Load user stats
    loadUserStats();
    
    // Load users table
    loadUsers();
}

/**
 * Set up event listeners for the user management page
 */
function setupEventListeners() {
    // Add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }
    
    // Search functionality
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            loadUsers(this.value);
        });
    }
    
    // Modal close buttons
    const closeModal = document.getElementById('close-modal');
    const cancelUser = document.getElementById('cancel-user');
    
    if (closeModal) closeModal.addEventListener('click', closeUserModal);
    if (cancelUser) cancelUser.addEventListener('click', closeUserModal);
    
    // Save user button
    const saveUserBtn = document.getElementById('save-user');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', saveUser);
    }
    
    // Delete modal buttons
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');
    
    if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteConfirmation);
    if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteConfirmation);
    if (confirmDelete) confirmDelete.addEventListener('click', deleteUser);
    
    // Pagination buttons
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                updateUsersTable();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                updateUsersTable();
            }
        });
    }
}

/**
 * Load user statistics for the dashboard
 */
function loadUserStats() {
    // Get users from localStorage (combined with default users)
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    const defaultUsers = USERS_DATA;
    const allUsers = [...defaultUsers, ...storedUsers];
    
    // Count total users
    const totalUsers = allUsers.length;
    
    // Count admin users
    const adminUsers = allUsers.filter(user => user.role === 'admin').length;
    
    // Count active users
    const activeUsers = allUsers.filter(user => user.status === 'active').length;
    
    // Count new users this month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newUsers = allUsers.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= firstDayOfMonth;
    }).length;
    
    // Update stat cards
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('admin-users').textContent = adminUsers;
    document.getElementById('active-users').textContent = activeUsers;
    document.getElementById('new-users').textContent = newUsers;
}

/**
 * Load users into the table
 * @param {string} searchQuery - Optional search query to filter users
 */
function loadUsers(searchQuery = '') {
    // Get users from localStorage (combined with default users)
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    const defaultUsers = USERS_DATA;
    let allUsers = [...defaultUsers, ...storedUsers];
    
    // Filter users if search query is provided
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        allUsers = allUsers.filter(user => 
            user.name?.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query) ||
            user.role?.toLowerCase().includes(query)
        );
    }
    
    // Sort users by creation date (newest first)
    allUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
    });
    
    // Update global filtered users
    filteredUsers = allUsers;
    
    // Calculate total pages
    totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);
    
    // Ensure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    
    // Update the table
    updateUsersTable();
}

/**
 * Update the users table with current page data
 */
function updateUsersTable() {
    const tableBody = document.getElementById('users-list');
    
    if (!tableBody) return;
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length);
    
    // Update pagination UI
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    // Enable/disable pagination buttons
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Check if there are no users
    if (filteredUsers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="no-results">
                <p>No users found. Try a different search or add a new user.</p>
                <button id="no-results-add" class="btn btn-primary">
                    <i class="fas fa-user-plus"></i> Add New User
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        
        // Add event listener to the button
        document.getElementById('no-results-add').addEventListener('click', openAddUserModal);
        return;
    }
    
    // Add rows to the table for current page
    for (let i = startIndex; i < endIndex; i++) {
        const user = filteredUsers[i];
        
        // Get initials for avatar
        const initials = getInitials(user.name || user.email);
        
        // Format the status display
        const statusClass = getStatusClass(user.status);
        
        // Calculate time since registration
        const joinedText = getTimeAgo(user.createdAt);
        
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
            <td>${user.email}</td>
            <td>${capitalizeFirstLetter(user.role || 'User')}</td>
            <td><span class="status-badge ${statusClass}">${capitalizeFirstLetter(user.status || 'Active')}</span></td>
            <td>${joinedText}</td>
            <td>
                <div class="table-actions">
                    <button class="table-action edit" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="table-action view" data-id="${user.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action delete" data-id="${user.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Add event listeners to action buttons
    const editButtons = document.querySelectorAll('.table-action.edit');
    const viewButtons = document.querySelectorAll('.table-action.view');
    const deleteButtons = document.querySelectorAll('.table-action.delete');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openEditUserModal(userId);
        });
    });
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            viewUser(userId);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openDeleteConfirmation(userId);
        });
    });
}

/**
 * Open the modal to add a new user
 */
function openAddUserModal() {
    // Reset form
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Add New User';
    
    // Show password field
    document.getElementById('password-group').style.display = 'block';
    document.getElementById('user-password').required = true;
    
    // Open modal
    document.getElementById('user-modal').classList.add('active');
}

/**
 * Open the modal to edit an existing user
 * @param {string} userId - ID of the user to edit
 */
function openEditUserModal(userId) {
    // Find the user
    const user = findUserById(userId);
    
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    // Fill form with user data
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role || 'user';
    document.getElementById('user-status').value = user.status || 'active';
    
    // Clear password field
    document.getElementById('user-password').value = '';
    document.getElementById('user-password').required = false;
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Edit User';
    
    // Show password field (optional for edit)
    document.getElementById('password-group').style.display = 'block';
    
    // Open modal
    document.getElementById('user-modal').classList.add('active');
}

/**
 * View user details (simplified version - could be expanded in a real app)
 * @param {string} userId - ID of the user to view
 */
function viewUser(userId) {
    // Find the user
    const user = findUserById(userId);
    
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    // For now, just open the edit modal with fields disabled
    openEditUserModal(userId);
    
    // Could be expanded in a real app to show more details, activity history, etc.
}

/**
 * Save the user (add new or update existing)
 */
function saveUser() {
    // Get form values
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const status = document.getElementById('user-status').value;
    const password = document.getElementById('user-password').value;
    
    // Validate form
    if (!email) {
        alert('Email is required');
        return;
    }
    
    // Get existing custom users
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    
    // Check if this is a new user or an update
    if (!userId) {
        // Generate a unique ID
        const newId = 'custom_' + Date.now();
        
        // Create the new user object
        const newUser = {
            id: newId,
            name,
            email,
            role,
            status,
            password: password || 'default123', // In a real app, this would be hashed
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // Add to the users array
        storedUsers.push(newUser);
        
        // Log activity
        logActivity('user', `New user ${name || email} was added`);
    } else {
        // Find if this is a custom user or a default user
        const userIndex = storedUsers.findIndex(user => user.id === userId);
        
        if (userIndex >= 0) {
            // Update existing custom user
            storedUsers[userIndex] = {
                ...storedUsers[userIndex],
                name,
                email,
                role,
                status,
                // Only update password if provided
                ...(password && { password })
            };
        } else {
            // This is a default user, create a custom copy
            const defaultUser = USERS_DATA.find(user => user.id === userId);
            
            if (defaultUser) {
                // Create a custom user based on the default user
                const customUser = {
                    id: 'custom_' + defaultUser.id,
                    name,
                    email,
                    role,
                    status,
                    password: password || defaultUser.password,
                    createdAt: defaultUser.createdAt,
                    lastLogin: defaultUser.lastLogin
                };
                
                storedUsers.push(customUser);
            }
        }
        
        // Log activity
        logActivity('edit', `User ${name || email} was updated`);
    }
    
    // Save to localStorage
    localStorage.setItem('mookRoboticsUsers', JSON.stringify(storedUsers));
    
    // Close the modal
    closeUserModal();
    
    // Reload the users list
    loadUsers();
    
    // Reload user stats
    loadUserStats();
}

/**
 * Open the delete confirmation modal
 * @param {string} userId - ID of the user to delete
 */
function openDeleteConfirmation(userId) {
    // Store the user ID
    document.getElementById('delete-user-id').value = userId;
    
    // Open the modal
    document.getElementById('delete-modal').classList.add('active');
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteConfirmation() {
    document.getElementById('delete-modal').classList.remove('active');
}

/**
 * Delete a user
 */
function deleteUser() {
    const userId = document.getElementById('delete-user-id').value;
    
    if (!userId) return;
    
    // Find the user
    const user = findUserById(userId);
    
    if (!user) {
        console.error('User not found:', userId);
        closeDeleteConfirmation();
        return;
    }
    
    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    
    // Check if this is a custom user
    const userIndex = storedUsers.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
        // Remove the user
        storedUsers.splice(userIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('mookRoboticsUsers', JSON.stringify(storedUsers));
    } else {
        // This is a default user, create a "deleted" flag
        const deletedUsers = JSON.parse(localStorage.getItem('mookRoboticsDeletedUsers') || '[]');
        deletedUsers.push(userId);
        localStorage.setItem('mookRoboticsDeletedUsers', JSON.stringify(deletedUsers));
    }
    
    // Log activity
    logActivity('user', `User ${user.name || user.email} was deleted`);
    
    // Close the modal
    closeDeleteConfirmation();
    
    // Reload the users list
    loadUsers();
    
    // Reload user stats
    loadUserStats();
}

/**
 * Close the user modal
 */
function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
}

/**
 * Find a user by ID
 * @param {string} userId - User ID to find
 * @returns {object|null} The user object or null if not found
 */
function findUserById(userId) {
    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    const deletedUsers = JSON.parse(localStorage.getItem('mookRoboticsDeletedUsers') || '[]');
    
    // Check if user is deleted
    if (deletedUsers.includes(userId)) {
        return null;
    }
    
    // Check custom users first
    const customUser = storedUsers.find(user => user.id === userId);
    if (customUser) {
        return customUser;
    }
    
    // Check default users
    return USERS_DATA.find(user => user.id === userId);
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
    
    if (days > 30) {
        // Show the date if it's more than a month ago
        return date.toLocaleDateString();
    } else if (days > 0) {
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    return 'Just now';
}

/**
 * Get CSS class for user status
 * @param {string} status - User status
 * @returns {string} CSS class for the status
 */
function getStatusClass(status) {
    switch (status) {
        case 'active':
            return 'status-active';
        case 'inactive':
            return 'status-inactive';
        case 'pending':
            return 'status-pending';
        default:
            return 'status-active';
    }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
