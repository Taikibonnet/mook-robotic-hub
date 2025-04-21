/**
 * MOOK Robotics Hub - Admin Dashboard Display Fix
 * 
 * This script ensures the admin dashboard displays correctly by fixing
 * any layout issues that might occur and ensuring proper styling.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard fixes
    initDashboardFix();
    
    // Fix the sidebar toggle behavior
    fixSidebarToggle();
    
    // Ensure correct stat card display
    fixStatCards();
    
    // Fix user list display
    fixUserList();
    
    // Fix responsive behavior
    handleResponsiveLayout();
    
    // Handle window resize events
    window.addEventListener('resize', handleResponsiveLayout);
});

/**
 * Initializes dashboard display fixes
 */
function initDashboardFix() {
    console.log("Dashboard display fix initialized");
    
    // Ensure all CSS classes are properly applied
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        // Force a reflow to ensure styles are applied
        void adminContainer.offsetWidth;
    }
    
    // Fix any activity list items that might be missing icons
    const activityIcons = document.querySelectorAll('.activity-icon');
    activityIcons.forEach(icon => {
        if (!icon.querySelector('i')) {
            icon.innerHTML = '<i class="fas fa-info-circle"></i>';
        }
    });
}

/**
 * Fixes the sidebar toggle behavior
 */
function fixSidebarToggle() {
    const toggleButton = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.admin-main');
    
    if (toggleButton && sidebar && mainContent) {
        toggleButton.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
}

/**
 * Ensures stat cards display correctly
 */
function fixStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        const icon = card.querySelector('.stat-icon');
        const info = card.querySelector('.stat-info');
        
        // Make sure icon has the proper icon element
        if (icon && !icon.querySelector('i')) {
            const title = info.querySelector('h3').textContent;
            let iconClass = 'fas fa-chart-line';
            
            // Set appropriate icon based on stat title
            if (title.includes('Robot')) {
                iconClass = 'fas fa-robot';
            } else if (title.includes('User')) {
                iconClass = 'fas fa-users';
            } else if (title.includes('View')) {
                iconClass = 'fas fa-eye';
            } else if (title.includes('News')) {
                iconClass = 'fas fa-newspaper';
            }
            
            icon.innerHTML = `<i class="${iconClass}"></i>`;
        }
    });
}

/**
 * Fixes user list display issues
 */
function fixUserList() {
    const userListItems = document.querySelectorAll('.user-list-item');
    
    userListItems.forEach(item => {
        // Check if user avatar is missing
        if (!item.querySelector('.user-avatar')) {
            const userInfo = item.querySelector('.user-info');
            
            if (userInfo) {
                const name = userInfo.querySelector('.user-name').textContent;
                const initials = getInitials(name);
                
                // Create and insert avatar before userInfo
                const avatar = document.createElement('div');
                avatar.className = 'user-avatar';
                avatar.textContent = initials;
                
                item.insertBefore(avatar, userInfo);
            }
        }
    });
}

/**
 * Get a user's initials from their name
 * @param {string} name - User's name
 * @returns {string} User's initials
 */
function getInitials(name) {
    if (!name || name === 'User') return 'U';
    
    const parts = name.split(' ');
    
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Handles responsive layout adjustments
 */
function handleResponsiveLayout() {
    const width = window.innerWidth;
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.admin-main');
    
    // For mobile view
    if (width <= 768) {
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }
        
        if (mainContent && !mainContent.classList.contains('expanded')) {
            mainContent.classList.add('expanded');
        }
    }
}
