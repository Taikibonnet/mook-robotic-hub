/**
 * MOOK Robotics Hub - Robot Detail Page JavaScript
 * 
 * This file handles the functionality specific to robot detail pages,
 * including image gallery, videos, and page navigation.
 */

document.addEventListener('DOMContentLoaded', function() {
    initRobotDetailPage();
    initComments();
});

/**
 * Initialize robot detail page functionality
 */
function initRobotDetailPage() {
    // Smooth scroll for page navigation
    const pageNavLinks = document.querySelectorAll('.page-nav a');
    
    pageNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Offset for fixed header
                    behavior: 'smooth'
                });
                
                // Update active link
                pageNavLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Update active navigation link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.robot-section');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        if (currentSection) {
            pageNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSection) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Video placeholders click to play
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            // In a real implementation, this would load the actual video
            // For demo purposes, we'll just show an alert
            const videoTitle = this.querySelector('.video-title').textContent;
            alert(`Video would play: ${videoTitle}`);
        });
    });
    
    // Gallery image click for lightbox
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // In a real implementation, this would open a lightbox
            // For demo purposes, we'll just show an alert
            alert('Image lightbox would open');
        });
    });
}

/**
 * Initialize comments functionality
 */
function initComments() {
    const commentForm = document.getElementById('add-comment-form');
    const commentLikeButtons = document.querySelectorAll('.comment-like');
    const commentReplyButtons = document.querySelectorAll('.comment-reply');
    
    // Comment form submission
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentText = document.getElementById('comment-text').value.trim();
            
            if (commentText) {
                // Check if user is logged in
                const user = JSON.parse(localStorage.getItem('mookRoboticsUser') || '{}');
                
                if (user.email) {
                    // In a real app, this would send the comment to a server
                    alert('Comment submitted successfully!');
                    commentForm.reset();
                } else {
                    // Prompt user to log in
                    alert('Please log in to post a comment.');
                    
                    // Open login modal
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) {
                        loginModal.classList.add('active');
                    }
                }
            } else {
                alert('Please enter a comment.');
            }
        });
    }
    
    // Comment like functionality
    commentLikeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const likeCount = this.querySelector('span');
            const currentLikes = parseInt(likeCount.textContent);
            
            // Toggle like (in a real app, this would be persistent)
            if (this.classList.contains('liked')) {
                likeCount.textContent = currentLikes - 1;
                this.classList.remove('liked');
                this.querySelector('i').className = 'far fa-thumbs-up';
            } else {
                likeCount.textContent = currentLikes + 1;
                this.classList.add('liked');
                this.querySelector('i').className = 'fas fa-thumbs-up';
            }
        });
    });
    
    // Comment reply functionality
    commentReplyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentText = document.getElementById('comment-text');
            const commentAuthor = this.closest('.comment').querySelector('.comment-author').textContent;
            
            // Set focus to comment textarea and add @mention
            if (commentText) {
                commentText.value = `@${commentAuthor} `;
                commentText.focus();
                
                // Scroll to comment form
                const commentForm = document.querySelector('.comment-form');
                if (commentForm) {
                    commentForm.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}
