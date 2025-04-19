/**
 * MOOK Robotics Hub - Admin Panel JavaScript
 * 
 * This file contains functionality for the admin dashboard and other admin pages.
 */

document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    setupFileUploads();
    setupDynamicInputs();
});

/**
 * Initialize admin panel functionality
 */
function initAdminPanel() {
    // Toggle sidebar
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const adminSidebar = document.querySelector('.admin-sidebar');
    const adminMain = document.querySelector('.admin-main');
    
    if (toggleSidebarBtn && adminSidebar && adminMain) {
        toggleSidebarBtn.addEventListener('click', function() {
            adminSidebar.classList.toggle('collapsed');
            adminMain.classList.toggle('expanded');
        });
    }
    
    // Admin logout
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to log out?')) {
                // Clear admin session
                localStorage.removeItem('mookRoboticsUser');
                
                // Redirect to home page
                window.location.href = '../index.html';
            }
        });
    }
    
    // Check if user is logged in as admin
    checkAdminAuth();
    
    // Add any animations or special effects
    addAdminUIEffects();
}

/**
 * Check if user is authenticated as admin
 */
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('mookRoboticsUser') || '{}');
    
    // If not logged in or not an admin, redirect
    if (!user.email || user.isAdmin !== true) {
        alert('You must be logged in as an administrator to access this page.');
        window.location.href = '../index.html';
    }
}

/**
 * Add UI animations and effects for admin panel
 */
function addAdminUIEffects() {
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.stat-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.stat-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
    
    // Add subtle animation to table rows
    const tableRows = document.querySelectorAll('.admin-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/**
 * Set up file upload functionality
 */
function setupFileUploads() {
    // File upload zones
    const fileUploads = document.querySelectorAll('.file-upload');
    
    fileUploads.forEach(upload => {
        // Highlight drop zone on drag over
        upload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('file-upload-active');
        });
        
        upload.addEventListener('dragleave', function() {
            this.classList.remove('file-upload-active');
        });
        
        // Handle file drop
        upload.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('file-upload-active');
            
            // Find the associated file input
            const fileInput = this.querySelector('input[type="file"]');
            if (fileInput && e.dataTransfer.files.length > 0) {
                // Check if multiple files are allowed
                if (fileInput.multiple) {
                    fileInput.files = e.dataTransfer.files;
                } else {
                    // Only take the first file if multiple aren't allowed
                    const tempFileList = new DataTransfer();
                    tempFileList.items.add(e.dataTransfer.files[0]);
                    fileInput.files = tempFileList.files;
                }
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        });
    });
    
    // Additional images handling
    const additionalImagesInput = document.getElementById('additional-images-input');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    if (additionalImagesInput && additionalImagesPreview) {
        additionalImagesInput.addEventListener('change', function() {
            additionalImagesPreview.innerHTML = ''; // Clear existing previews
            
            if (this.files) {
                const maxFiles = 5;
                const filesCount = Math.min(this.files.length, maxFiles);
                
                for (let i = 0; i < filesCount; i++) {
                    const file = this.files[i];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const previewContainer = document.createElement('div');
                        previewContainer.className = 'gallery-item';
                        
                        const previewImg = document.createElement('img');
                        previewImg.src = e.target.result;
                        previewImg.alt = 'Preview';
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-gallery-item';
                        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                        removeBtn.addEventListener('click', function() {
                            previewContainer.remove();
                            // Note: This doesn't actually remove the file from the FileList
                            // In a real app, you'd need to use DataTransfer to create a new FileList
                        });
                        
                        previewContainer.appendChild(previewImg);
                        previewContainer.appendChild(removeBtn);
                        additionalImagesPreview.appendChild(previewContainer);
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                document.getElementById('additional-images-upload').style.display = 'none';
                additionalImagesPreview.style.display = 'flex';
            }
        });
    }
}

/**
 * Set up dynamic input fields (for references, video URLs, etc.)
 */
function setupDynamicInputs() {
    // Video URL inputs
    setupDynamicInputField('video-urls', 'add-video-btn', 'video-url-input');
    
    // References
    setupDynamicInputField('references', 'add-reference-btn', 'reference-input');
}

/**
 * Create functionality for dynamic input fields
 * @param {string} containerId - The ID of the container element
 * @param {string} addBtnClass - The class name of the add button
 * @param {string} inputClass - The class name of the input wrapper
 */
function setupDynamicInputField(containerId, addBtnClass, inputClass) {
    const container = document.getElementById(containerId);
    
    if (container) {
        // Add new input field
        container.addEventListener('click', function(e) {
            if (e.target.classList.contains(addBtnClass) || e.target.parentElement.classList.contains(addBtnClass)) {
                const btn = e.target.classList.contains(addBtnClass) ? e.target : e.target.parentElement;
                const inputWrapper = btn.closest('.' + inputClass);
                
                // Clone the input wrapper
                const newInputWrapper = inputWrapper.cloneNode(true);
                
                // Clear the input value
                const input = newInputWrapper.querySelector('input');
                if (input) {
                    input.value = '';
                }
                
                // Change the add button to remove button for the original input
                btn.innerHTML = '<i class="fas fa-minus"></i>';
                btn.classList.remove(addBtnClass);
                btn.classList.add('remove-input-btn');
                
                // Add the new input wrapper
                container.appendChild(newInputWrapper);
            }
            
            // Remove input field
            if (e.target.classList.contains('remove-input-btn') || e.target.parentElement.classList.contains('remove-input-btn')) {
                const btn = e.target.classList.contains('remove-input-btn') ? e.target : e.target.parentElement;
                const inputWrapper = btn.closest('.' + inputClass);
                
                inputWrapper.remove();
            }
        });
    }
}

/**
 * Validates form data before submission
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} Whether the form is valid
 */
function validateForm(form) {
    let isValid = true;
    
    // Get all required fields
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            
            // Add error styling
            field.classList.add('input-error');
            
            // Find or create error message
            let errorMsg = field.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                field.parentNode.insertBefore(errorMsg, field.nextSibling);
            }
            
            errorMsg.textContent = 'This field is required';
        } else {
            // Remove error styling if field is valid
            field.classList.remove('input-error');
            
            // Remove error message if it exists
            const errorMsg = field.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.remove();
            }
        }
    });
    
    return isValid;
}
