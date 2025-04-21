/**
 * MOOK Robotics Hub - Settings Page JavaScript
 * 
 * This file contains functionality for the admin settings page,
 * including general settings, appearance, content, notifications,
 * and backup/export features.
 */

import { USERS_DATA } from '../../js/data.js';
import { getAllRobots } from '../../js/robot-service.js';
import { getAllNews } from '../../js/news-service.js';
import { logActivity } from './dashboard.js';

// Default settings values
const DEFAULT_SETTINGS = {
    general: {
        siteTitle: 'MOOK Robotics Hub',
        siteTagline: 'Your Ultimate Resource for Robotics',
        siteDescription: 'A comprehensive resource for robotics enthusiasts, featuring the latest robots, AI assistants, and news from the world of robotics and automation.',
        contactEmail: 'contact@mookrobotics.com',
        contactPhone: '+1 (123) 456-7890',
        contactAddress: '123 Robot Street, Tech City, AI 98765',
        socialFacebook: 'https://facebook.com/mookrobotics',
        socialTwitter: 'https://twitter.com/mookrobotics',
        socialInstagram: 'https://instagram.com/mookrobotics',
        socialLinkedin: 'https://linkedin.com/company/mookrobotics'
    },
    appearance: {
        primaryColor: '#00b4d8',
        secondaryColor: '#5e60ce',
        accentColor: '#7209b7',
        backgroundColor: '#0d1117',
        darkMode: true,
        headingFont: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        bodyFont: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        baseFontSize: '16px',
        layoutWidth: '1200px',
        borderRadius: '8px'
    },
    content: {
        featuredRobotsCount: 6,
        newsCount: 6,
        showHero: true,
        showAssistant: true,
        enableComments: true,
        moderateComments: true,
        allowUserRegistration: true,
        metaKeywords: 'robotics, AI, automation, technology, robots, artificial intelligence',
        googleAnalytics: 'UA-XXXXXXXX-X',
        allowRobotsIndexing: true
    },
    notifications: {
        userRegistrationEmail: true,
        commentEmail: true,
        contactFormEmail: true,
        browserNotifications: true,
        adminEmail: 'admin@mookrobotics.com'
    }
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings
    initSettings();
    
    // Set up tabs
    setupTabs();
    
    // Set up event listeners for all settings forms
    setupEventListeners();
    
    // Set up color pickers
    setupColorPickers();
    
    // Setup file upload for import
    setupFileUpload();
});

/**
 * Initialize settings by loading from localStorage or using defaults
 */
function initSettings() {
    // Get settings from localStorage or use defaults
    const settings = getSettings();
    
    // Populate all forms with settings values
    populateGeneralSettings(settings.general);
    populateAppearanceSettings(settings.appearance);
    populateContentSettings(settings.content);
    populateNotificationSettings(settings.notifications);
}

/**
 * Set up the tabs system
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            settingsPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the target panel
            const targetId = this.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            
            // Activate the target panel
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/**
 * Set up event listeners for all forms and buttons
 */
function setupEventListeners() {
    // General Settings Form
    const saveGeneralBtn = document.getElementById('save-general-settings');
    const resetGeneralBtn = document.getElementById('reset-general-settings');
    
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener('click', saveGeneralSettings);
    }
    
    if (resetGeneralBtn) {
        resetGeneralBtn.addEventListener('click', resetGeneralSettings);
    }
    
    // Appearance Settings Form
    const saveAppearanceBtn = document.getElementById('save-appearance-settings');
    const resetAppearanceBtn = document.getElementById('reset-appearance-settings');
    const previewAppearanceBtn = document.getElementById('preview-appearance');
    
    if (saveAppearanceBtn) {
        saveAppearanceBtn.addEventListener('click', saveAppearanceSettings);
    }
    
    if (resetAppearanceBtn) {
        resetAppearanceBtn.addEventListener('click', resetAppearanceSettings);
    }
    
    if (previewAppearanceBtn) {
        previewAppearanceBtn.addEventListener('click', previewAppearanceChanges);
    }
    
    // Content Settings Form
    const saveContentBtn = document.getElementById('save-content-settings');
    const resetContentBtn = document.getElementById('reset-content-settings');
    
    if (saveContentBtn) {
        saveContentBtn.addEventListener('click', saveContentSettings);
    }
    
    if (resetContentBtn) {
        resetContentBtn.addEventListener('click', resetContentSettings);
    }
    
    // Notification Settings Form
    const saveNotificationBtn = document.getElementById('save-notification-settings');
    const resetNotificationBtn = document.getElementById('reset-notification-settings');
    
    if (saveNotificationBtn) {
        saveNotificationBtn.addEventListener('click', saveNotificationSettings);
    }
    
    if (resetNotificationBtn) {
        resetNotificationBtn.addEventListener('click', resetNotificationSettings);
    }
    
    // Backup & Export Buttons
    const createBackupBtn = document.getElementById('create-backup');
    const exportRobotsBtn = document.getElementById('export-robots');
    const exportUsersBtn = document.getElementById('export-users');
    const exportNewsBtn = document.getElementById('export-news');
    const exportSettingsBtn = document.getElementById('export-settings');
    const importDataBtn = document.getElementById('import-data');
    const resetAllDataBtn = document.getElementById('reset-all-data');
    
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', createBackup);
    }
    
    if (exportRobotsBtn) {
        exportRobotsBtn.addEventListener('click', () => exportData('robots'));
    }
    
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => exportData('users'));
    }
    
    if (exportNewsBtn) {
        exportNewsBtn.addEventListener('click', () => exportData('news'));
    }
    
    if (exportSettingsBtn) {
        exportSettingsBtn.addEventListener('click', () => exportData('settings'));
    }
    
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importData);
    }
    
    if (resetAllDataBtn) {
        resetAllDataBtn.addEventListener('click', openResetDataModal);
    }
    
    // Reset Data Modal
    const closeResetModal = document.getElementById('close-reset-modal');
    const cancelReset = document.getElementById('cancel-reset');
    const confirmReset = document.getElementById('confirm-reset');
    const resetConfirmation = document.getElementById('reset-confirmation');
    
    if (closeResetModal) {
        closeResetModal.addEventListener('click', closeResetDataModal);
    }
    
    if (cancelReset) {
        cancelReset.addEventListener('click', closeResetDataModal);
    }
    
    if (confirmReset) {
        confirmReset.addEventListener('click', resetAllData);
    }
    
    if (resetConfirmation) {
        resetConfirmation.addEventListener('input', function() {
            // Enable confirm button only if user types RESET
            confirmReset.disabled = this.value !== 'RESET';
        });
    }
    
    // Notification close button
    const closeNotification = document.getElementById('close-notification');
    
    if (closeNotification) {
        closeNotification.addEventListener('click', function() {
            document.getElementById('saved-notification').style.display = 'none';
        });
    }
}

/**
 * Set up color pickers with text input sync
 */
function setupColorPickers() {
    const colorPickers = document.querySelectorAll('.color-input');
    
    colorPickers.forEach(picker => {
        const textInput = document.getElementById(`${picker.id}-text`);
        
        if (textInput) {
            // Update text when color is changed
            picker.addEventListener('input', function() {
                textInput.value = this.value;
            });
            
            // Update picker when text is changed
            textInput.addEventListener('input', function() {
                // Ensure the text is a valid hex color
                if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                    picker.value = this.value;
                }
            });
        }
    });
}

/**
 * Set up file upload for importing data
 */
function setupFileUpload() {
    const importFile = document.getElementById('import-file');
    const importFileUpload = document.getElementById('import-file-upload');
    const fileSelected = document.getElementById('file-selected');
    const selectedFileName = document.getElementById('selected-file-name');
    
    if (importFile && importFileUpload && fileSelected && selectedFileName) {
        // Handle file selection
        importFile.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                selectedFileName.textContent = file.name;
                importFileUpload.style.display = 'none';
                fileSelected.style.display = 'flex';
            }
        });
        
        // Handle drag and drop
        importFileUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('file-upload-active');
        });
        
        importFileUpload.addEventListener('dragleave', function() {
            this.classList.remove('file-upload-active');
        });
        
        importFileUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('file-upload-active');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                importFile.files = e.dataTransfer.files;
                const file = e.dataTransfer.files[0];
                selectedFileName.textContent = file.name;
                importFileUpload.style.display = 'none';
                fileSelected.style.display = 'flex';
            }
        });
        
        // Handle click to select file
        importFileUpload.addEventListener('click', function() {
            importFile.click();
        });
    }
}

/**
 * Populate general settings form with values
 * @param {object} generalSettings - General settings object
 */
function populateGeneralSettings(generalSettings) {
    // Site Information
    document.getElementById('site-title').value = generalSettings.siteTitle;
    document.getElementById('site-tagline').value = generalSettings.siteTagline;
    document.getElementById('site-description').value = generalSettings.siteDescription;
    
    // Contact Information
    document.getElementById('contact-email').value = generalSettings.contactEmail;
    document.getElementById('contact-phone').value = generalSettings.contactPhone;
    document.getElementById('contact-address').value = generalSettings.contactAddress;
    
    // Social Media Links
    document.getElementById('social-facebook').value = generalSettings.socialFacebook;
    document.getElementById('social-twitter').value = generalSettings.socialTwitter;
    document.getElementById('social-instagram').value = generalSettings.socialInstagram;
    document.getElementById('social-linkedin').value = generalSettings.socialLinkedin;
}

/**
 * Populate appearance settings form with values
 * @param {object} appearanceSettings - Appearance settings object
 */
function populateAppearanceSettings(appearanceSettings) {
    // Theme Colors
    document.getElementById('primary-color').value = appearanceSettings.primaryColor;
    document.getElementById('primary-color-text').value = appearanceSettings.primaryColor;
    document.getElementById('secondary-color').value = appearanceSettings.secondaryColor;
    document.getElementById('secondary-color-text').value = appearanceSettings.secondaryColor;
    document.getElementById('accent-color').value = appearanceSettings.accentColor;
    document.getElementById('accent-color-text').value = appearanceSettings.accentColor;
    document.getElementById('background-color').value = appearanceSettings.backgroundColor;
    document.getElementById('background-color-text').value = appearanceSettings.backgroundColor;
    
    // Theme Mode
    document.getElementById('dark-mode-toggle').checked = appearanceSettings.darkMode;
    
    // Font Settings
    document.getElementById('heading-font').value = appearanceSettings.headingFont;
    document.getElementById('body-font').value = appearanceSettings.bodyFont;
    document.getElementById('base-font-size').value = appearanceSettings.baseFontSize;
    
    // Layout Options
    document.getElementById('layout-width').value = appearanceSettings.layoutWidth;
    document.getElementById('border-radius').value = appearanceSettings.borderRadius;
}

/**
 * Populate content settings form with values
 * @param {object} contentSettings - Content settings object
 */
function populateContentSettings(contentSettings) {
    // Homepage Display
    document.getElementById('featured-robots-count').value = contentSettings.featuredRobotsCount;
    document.getElementById('news-count').value = contentSettings.newsCount;
    document.getElementById('show-hero-toggle').checked = contentSettings.showHero;
    document.getElementById('show-assistant-toggle').checked = contentSettings.showAssistant;
    
    // Content Moderation
    document.getElementById('comments-toggle').checked = contentSettings.enableComments;
    document.getElementById('moderate-comments-toggle').checked = contentSettings.moderateComments;
    document.getElementById('user-signup-toggle').checked = contentSettings.allowUserRegistration;
    
    // SEO Settings
    document.getElementById('meta-keywords').value = contentSettings.metaKeywords;
    document.getElementById('google-analytics').value = contentSettings.googleAnalytics;
    document.getElementById('robots-indexing-toggle').checked = contentSettings.allowRobotsIndexing;
}

/**
 * Populate notification settings form with values
 * @param {object} notificationSettings - Notification settings object
 */
function populateNotificationSettings(notificationSettings) {
    // Email Notifications
    document.getElementById('user-registration-email-toggle').checked = notificationSettings.userRegistrationEmail;
    document.getElementById('comment-email-toggle').checked = notificationSettings.commentEmail;
    document.getElementById('contact-form-email-toggle').checked = notificationSettings.contactFormEmail;
    
    // Admin Notifications
    document.getElementById('browser-notifications-toggle').checked = notificationSettings.browserNotifications;
    document.getElementById('admin-email-notifications').value = notificationSettings.adminEmail;
}

/**
 * Get settings from localStorage or use defaults
 * @returns {object} Settings object
 */
function getSettings() {
    // Try to get settings from localStorage
    const storedSettings = localStorage.getItem('mookRoboticsSettings');
    
    if (storedSettings) {
        try {
            const settings = JSON.parse(storedSettings);
            
            // Ensure all required properties exist
            return {
                general: { ...DEFAULT_SETTINGS.general, ...settings.general },
                appearance: { ...DEFAULT_SETTINGS.appearance, ...settings.appearance },
                content: { ...DEFAULT_SETTINGS.content, ...settings.content },
                notifications: { ...DEFAULT_SETTINGS.notifications, ...settings.notifications }
            };
        } catch (error) {
            console.error('Error parsing settings from localStorage:', error);
        }
    }
    
    // Return default settings if localStorage settings don't exist or are invalid
    return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 * @param {object} settings - Settings object to save
 */
function saveSettings(settings) {
    localStorage.setItem('mookRoboticsSettings', JSON.stringify(settings));
}

/**
 * Get users data (combined default and custom users)
 * @returns {Array} Array of user objects
 */
function getUsers() {
    // Get custom users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mookRoboticsUsers') || '[]');
    
    // Combine with default users
    return [...USERS_DATA, ...storedUsers];
}

/**
 * Get activity logs from localStorage
 * @returns {Array} Array of activity log objects
 */
function getActivities() {
    return JSON.parse(localStorage.getItem('mookRoboticsActivities') || '[]');
}

/**
 * Show saved notification
 */
function showSavedNotification() {
    const notification = document.getElementById('saved-notification');
    
    if (notification) {
        notification.style.display = 'flex';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

/**
 * Download object as JSON file
 * @param {object} data - Data to download
 * @param {string} filename - Name of the file
 */
function downloadJSON(data, filename) {
    // Convert to pretty JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a Blob with the data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(link.href);
}

/**
 * Open the reset data confirmation modal
 */
function openResetDataModal() {
    const modal = document.getElementById('reset-data-modal');
    
    if (modal) {
        modal.classList.add('active');
        
        // Clear the confirmation field
        document.getElementById('reset-confirmation').value = '';
        
        // Disable the confirm button
        document.getElementById('confirm-reset').disabled = true;
    }
}

/**
 * Close the reset data confirmation modal
 */
function closeResetDataModal() {
    const modal = document.getElementById('reset-data-modal');
    
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Reset all data to default values
 */
function resetAllData() {
    // Clear localStorage
    localStorage.removeItem('mookRoboticsRobots');
    localStorage.removeItem('mookRoboticsUsers');
    localStorage.removeItem('mookRoboticsNews');
    localStorage.removeItem('mookRoboticsSettings');
    localStorage.removeItem('mookRoboticsActivities');
    localStorage.removeItem('mookRoboticsDeletedUsers');
    
    // Reload settings
    initSettings();
    
    // Apply default appearance
    applyAppearanceChanges(DEFAULT_SETTINGS.appearance);
    
    // Close the modal
    closeResetDataModal();
    
    // Show success message
    alert('All data has been reset to default values');
    
    // Log reset activity (this will be the first activity in the new log)
    logActivity('system', 'All data was reset to default values');
}

/**
 * Import data from a file
 */
function importData() {
    const importFile = document.getElementById('import-file');
    
    if (!importFile || !importFile.files || importFile.files.length === 0) {
        alert('Please select a file to import');
        return;
    }
    
    const file = importFile.files[0];
    
    // Read the file
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Determine what kind of data it is
            let type = 'unknown';
            
            if (data.robots) {
                type = 'backup';
            } else if (Array.isArray(data) && data.length > 0 && data[0].name && data[0].description) {
                type = 'robots';
            } else if (Array.isArray(data) && data.length > 0 && data[0].email) {
                type = 'users';
            } else if (Array.isArray(data) && data.length > 0 && data[0].title && data[0].content) {
                type = 'news';
            } else if (data.general && data.appearance) {
                type = 'settings';
            }
            
            // Import the data based on type
            switch (type) {
                case 'backup':
                    // Ask for confirmation
                    if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                        // Import everything
                        if (data.robots) {
                            localStorage.setItem('mookRoboticsRobots', JSON.stringify(data.robots));
                        }
                        if (data.users) {
                            localStorage.setItem('mookRoboticsUsers', JSON.stringify(data.users));
                        }
                        if (data.news) {
                            localStorage.setItem('mookRoboticsNews', JSON.stringify(data.news));
                        }
                        if (data.settings) {
                            localStorage.setItem('mookRoboticsSettings', JSON.stringify(data.settings));
                        }
                        if (data.activities) {
                            localStorage.setItem('mookRoboticsActivities', JSON.stringify(data.activities));
                        }
                        
                        // Reload settings
                        initSettings();
                        
                        // Apply appearance settings
                        const settings = getSettings();
                        applyAppearanceChanges(settings.appearance);
                        
                        // Show success message
                        alert('Backup imported successfully');
                        
                        // Log activity
                        logActivity('import', 'Full backup was imported');
                    }
                    break;
                    
                case 'robots':
                    // Ask for confirmation
                    if (confirm('This will replace all your current robots. Are you sure you want to continue?')) {
                        localStorage.setItem('mookRoboticsRobots', JSON.stringify(data));
                        alert('Robots imported successfully');
                        logActivity('import', 'Robots data was imported');
                    }
                    break;
                    
                case 'users':
                    // Ask for confirmation
                    if (confirm('This will replace all your current custom users. Are you sure you want to continue?')) {
                        localStorage.setItem('mookRoboticsUsers', JSON.stringify(data));
                        alert('Users imported successfully');
                        logActivity('import', 'Users data was imported');
                    }
                    break;
                    
                case 'news':
                    // Ask for confirmation
                    if (confirm('This will replace all your current news. Are you sure you want to continue?')) {
                        localStorage.setItem('mookRoboticsNews', JSON.stringify(data));
                        alert('News imported successfully');
                        logActivity('import', 'News data was imported');
                    }
                    break;
                    
                case 'settings':
                    // Ask for confirmation
                    if (confirm('This will replace all your current settings. Are you sure you want to continue?')) {
                        localStorage.setItem('mookRoboticsSettings', JSON.stringify(data));
                        
                        // Reload settings
                        initSettings();
                        
                        // Apply appearance settings
                        applyAppearanceChanges(data.appearance);
                        
                        alert('Settings imported successfully');
                        logActivity('import', 'Settings data was imported');
                    }
                    break;
                    
                default:
                    alert('Invalid file format');
                    break;
            }
            
            // Reset file input and UI
            document.getElementById('import-file-upload').style.display = 'block';
            document.getElementById('file-selected').style.display = 'none';
            importFile.value = '';
            
        } catch (error) {
            console.error('Error parsing import file:', error);
            alert('Error parsing file. Please make sure it is a valid JSON file.');
        }
    };
    
    reader.readAsText(file);
}

/**
 * Save general settings from the form
 */
function saveGeneralSettings() {
    // Get current settings
    const settings = getSettings();
    
    // Update general settings
    settings.general = {
        siteTitle: document.getElementById('site-title').value,
        siteTagline: document.getElementById('site-tagline').value,
        siteDescription: document.getElementById('site-description').value,
        contactEmail: document.getElementById('contact-email').value,
        contactPhone: document.getElementById('contact-phone').value,
        contactAddress: document.getElementById('contact-address').value,
        socialFacebook: document.getElementById('social-facebook').value,
        socialTwitter: document.getElementById('social-twitter').value,
        socialInstagram: document.getElementById('social-instagram').value,
        socialLinkedin: document.getElementById('social-linkedin').value
    };
    
    // Save updated settings
    saveSettings(settings);
    
    // Show saved notification
    showSavedNotification();
    
    // Log activity
    logActivity('edit', 'General settings were updated');
}

/**
 * Save appearance settings from the form
 */
function saveAppearanceSettings() {
    // Get current settings
    const settings = getSettings();
    
    // Update appearance settings
    settings.appearance = {
        primaryColor: document.getElementById('primary-color').value,
        secondaryColor: document.getElementById('secondary-color').value,
        accentColor: document.getElementById('accent-color').value,
        backgroundColor: document.getElementById('background-color').value,
        darkMode: document.getElementById('dark-mode-toggle').checked,
        headingFont: document.getElementById('heading-font').value,
        bodyFont: document.getElementById('body-font').value,
        baseFontSize: document.getElementById('base-font-size').value,
        layoutWidth: document.getElementById('layout-width').value,
        borderRadius: document.getElementById('border-radius').value
    };
    
    // Save updated settings
    saveSettings(settings);
    
    // Show saved notification
    showSavedNotification();
    
    // Apply appearance changes
    applyAppearanceChanges(settings.appearance);
    
    // Log activity
    logActivity('edit', 'Appearance settings were updated');
}

/**
 * Save content settings from the form
 */
function saveContentSettings() {
    // Get current settings
    const settings = getSettings();
    
    // Update content settings
    settings.content = {
        featuredRobotsCount: parseInt(document.getElementById('featured-robots-count').value),
        newsCount: parseInt(document.getElementById('news-count').value),
        showHero: document.getElementById('show-hero-toggle').checked,
        showAssistant: document.getElementById('show-assistant-toggle').checked,
        enableComments: document.getElementById('comments-toggle').checked,
        moderateComments: document.getElementById('moderate-comments-toggle').checked,
        allowUserRegistration: document.getElementById('user-signup-toggle').checked,
        metaKeywords: document.getElementById('meta-keywords').value,
        googleAnalytics: document.getElementById('google-analytics').value,
        allowRobotsIndexing: document.getElementById('robots-indexing-toggle').checked
    };
    
    // Save updated settings
    saveSettings(settings);
    
    // Show saved notification
    showSavedNotification();
    
    // Log activity
    logActivity('edit', 'Content settings were updated');
}

/**
 * Save notification settings from the form
 */
function saveNotificationSettings() {
    // Get current settings
    const settings = getSettings();
    
    // Update notification settings
    settings.notifications = {
        userRegistrationEmail: document.getElementById('user-registration-email-toggle').checked,
        commentEmail: document.getElementById('comment-email-toggle').checked,
        contactFormEmail: document.getElementById('contact-form-email-toggle').checked,
        browserNotifications: document.getElementById('browser-notifications-toggle').checked,
        adminEmail: document.getElementById('admin-email-notifications').value
    };
    
    // Save updated settings
    saveSettings(settings);
    
    // Show saved notification
    showSavedNotification();
    
    // Log activity
    logActivity('edit', 'Notification settings were updated');
}
