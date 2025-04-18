/**
 * MOOK Robotics Hub - Main JavaScript
 * 
 * This file contains the main functionality for the website,
 * including UI interactions, animations, and general behavior.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initModals();
    initAnimations();
    initSearch();
    
    // Log initialization message
    console.log('MOOK Robotics Hub initialized successfully!');
});

/**
 * Modal functionality
 */
function initModals() {
    // Get all modals and triggers
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const assistantModal = document.getElementById('assistant-modal');
    
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const activateAssistantBtn = document.getElementById('activate-assistant');
    
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Login button functionality
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            openModal(loginModal);
        });
    }
    
    // Signup button functionality
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            openModal(signupModal);
        });
    }
    
    // Activate assistant button functionality
    if (activateAssistantBtn) {
        activateAssistantBtn.addEventListener('click', function() {
            openModal(assistantModal);
        });
    }
    
    // Switch between login and signup
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            openModal(signupModal);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(signupModal);
            openModal(loginModal);
        });
    }
    
    // Close modal functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside of content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
            closeModal(event.target);
        }
    });
}

/**
 * Open a modal
 * @param {HTMLElement} modal - The modal to open
 */
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

/**
 * Close a modal
 * @param {HTMLElement} modal - The modal to close
 */
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

/**
 * Initialize animations and interactive elements
 */
function initAnimations() {
    // Add scroll animations for sections
    const sections = document.querySelectorAll('section');
    
    // Simple animation on scroll
    window.addEventListener('scroll', function() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('animate-in');
            }
        });
    });
    
    // Animate "explore all" button
    const exploreAllBtn = document.querySelector('.explore-all');
    if (exploreAllBtn) {
        exploreAllBtn.addEventListener('mouseenter', function() {
            this.classList.add('pulse');
        });
        
        exploreAllBtn.addEventListener('mouseleave', function() {
            this.classList.remove('pulse');
        });
    }
    
    // Add fancy hover effects to robot cards
    const robotCards = document.querySelectorAll('.robot-card');
    robotCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add a subtle transform
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset transform
            this.style.transform = '';
        });
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * Perform search (placeholder function)
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        console.log(`Searching for: ${query}`);
        // This would be replaced with actual search functionality
        // For now, redirect to robots page with search query
        window.location.href = `robots/index.html?search=${encodeURIComponent(query)}`;
    }
}

/**
 * Add CSS classes for animations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to elements
    document.querySelectorAll('section').forEach((section, index) => {
        section.style.animationDelay = `${index * 0.2}s`;
        section.classList.add('fade-in');
    });
    
    // Animate hero elements
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('slide-in-left');
    }
    
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.classList.add('slide-in-right');
    }
});
