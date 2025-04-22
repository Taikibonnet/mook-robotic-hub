// Admin Robot Editor functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the editor if we're on the edit page
    if (document.getElementById('robot-edit-form')) {
        initRobotEditor();
    }
});

function initRobotEditor() {
    // Set up the image upload preview
    const imageUpload = document.getElementById('robot-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageUpload && imagePreview) {
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    
                    // Store the image data for saving
                    document.getElementById('image-data').value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Setup form submission
    const editForm = document.getElementById('robot-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRobotData();
        });
    }
    
    // Load robot data if editing existing robot
    const robotId = getUrlParameter('id');
    if (robotId) {
        loadRobotData(robotId);
    }
}

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to load robot data for editing
function loadRobotData(robotId) {
    // In a real implementation, this would fetch data from a server
    // For simplicity, we'll use localStorage in this example
    try {
        const robotsData = localStorage.getItem('mookRobotics_robots');
        if (robotsData) {
            const robots = JSON.parse(robotsData);
            const robot = robots.find(r => r.id === robotId);
            
            if (robot) {
                populateFormWithRobotData(robot);
            } else {
                showMessage('Robot not found', 'error');
            }
        } else {
            // If no robots data exists, create a new dummy entry for testing
            createDummyRobotData(robotId);
        }
    } catch (error) {
        console.error('Error loading robot data:', error);
        showMessage('Error loading robot data', 'error');
    }
}

// Function to populate the form with robot data
function populateFormWithRobotData(robot) {
    document.getElementById('robot-id').value = robot.id || '';
    document.getElementById('robot-name').value = robot.name || '';
    document.getElementById('robot-category').value = robot.category || '';
    document.getElementById('robot-year').value = robot.year || '';
    document.getElementById('robot-manufacturer').value = robot.manufacturer || '';
    document.getElementById('robot-description').value = robot.description || '';
    
    // Set the image preview if available
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview && robot.image) {
        imagePreview.src = robot.image;
        imagePreview.style.display = 'block';
        document.getElementById('image-data').value = robot.image;
    }
    
    // Handle overview, features, specifications, etc.
    if (robot.overview && Array.isArray(robot.overview)) {
        document.getElementById('robot-overview').value = robot.overview.join('\n\n');
    }
    
    if (robot.features && Array.isArray(robot.features)) {
        document.getElementById('robot-features').value = robot.features.join('\n');
    }
    
    // Handle specifications (if your form has fields for them)
    const specsContainer = document.getElementById('specifications-container');
    if (specsContainer && robot.specifications) {
        // Clear existing specs
        specsContainer.innerHTML = '';
        
        // Add each specification
        for (const [key, value] of Object.entries(robot.specifications)) {
            addSpecificationField(key, value);
        }
    }
    
    // Update form title
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = `Editing: ${robot.name}`;
    }
}

// Function to save robot data
function saveRobotData() {
    const robotData = collectFormData();
    
    if (!robotData.id || !robotData.name) {
        showMessage('Robot ID and name are required', 'error');
        return;
    }
    
    try {
        // In a real implementation, this would send data to a server
        // For simplicity, we'll use localStorage
        let robots = [];
        const robotsData = localStorage.getItem('mookRobotics_robots');
        
        if (robotsData) {
            robots = JSON.parse(robotsData);
            
            // Update or add the robot
            const existingIndex = robots.findIndex(r => r.id === robotData.id);
            if (existingIndex >= 0) {
                robots[existingIndex] = robotData;
            } else {
                robots.push(robotData);
            }
        } else {
            robots = [robotData];
        }
        
        // Save to localStorage
        localStorage.setItem('mookRobotics_robots', JSON.stringify(robots));
        
        // Create or update the robot's HTML file
        createRobotHtmlFile(robotData);
        
        showMessage('Robot saved successfully', 'success');
        
        // Redirect to the robot page
        setTimeout(() => {
            window.location.href = `../robots/${robotData.id}.html`;
        }, 1500);
        
    } catch (error) {
        console.error('Error saving robot data:', error);
        showMessage('Error saving robot data', 'error');
    }
}

// Function to collect form data
function collectFormData() {
    const robotData = {
        id: document.getElementById('robot-id').value.trim(),
        name: document.getElementById('robot-name').value.trim(),
        category: document.getElementById('robot-category').value.trim(),
        year: document.getElementById('robot-year').value.trim(),
        manufacturer: document.getElementById('robot-manufacturer').value.trim(),
        description: document.getElementById('robot-description').value.trim(),
        image: document.getElementById('image-data').value
    };
    
    // Handle overview text (split by paragraphs)
    const overviewText = document.getElementById('robot-overview').value.trim();
    if (overviewText) {
        robotData.overview = overviewText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    } else {
        robotData.overview = [];
    }
    
    // Handle features (one per line)
    const featuresText = document.getElementById('robot-features').value.trim();
    if (featuresText) {
        robotData.features = featuresText.split(/\n/).filter(f => f.trim().length > 0);
    } else {
        robotData.features = [];
    }
    
    // Handle specifications
    robotData.specifications = {};
    const specRows = document.querySelectorAll('.specification-row');
    specRows.forEach(row => {
        const keyInput = row.querySelector('.spec-key');
        const valueInput = row.querySelector('.spec-value');
        
        if (keyInput && valueInput && keyInput.value.trim()) {
            robotData.specifications[keyInput.value.trim()] = valueInput.value.trim();
        }
    });
    
    // Handle gallery (if implemented)
    robotData.gallery = [
        { url: robotData.image, alt: `${robotData.name} main view` }
    ];
    
    return robotData;
}

// Function to create a robot HTML file
function createRobotHtmlFile(robotData) {
    // In a real implementation, this would create/update an actual file on the server
    // For this demo, we'll just simulate it
    console.log(`Creating/updating HTML file for robot: ${robotData.id}`);
    
    // You could implement AJAX calls to a server endpoint here
    // that would handle the file creation
    
    // For demo purposes, let's just show a success message
    showMessage(`HTML file for ${robotData.name} would be created in a real implementation`, 'info');
}

// Helper function to add a specification field to the form
function addSpecificationField(key = '', value = '') {
    const specsContainer = document.getElementById('specifications-container');
    
    if (!specsContainer) return;
    
    const specRow = document.createElement('div');
    specRow.className = 'specification-row';
    
    specRow.innerHTML = `
        <div class="spec-inputs">
            <input type="text" class="spec-key" placeholder="Specification" value="${key}">
            <input type="text" class="spec-value" placeholder="Value" value="${value}">
        </div>
        <button type="button" class="btn-remove-spec">Remove</button>
    `;
    
    const removeButton = specRow.querySelector('.btn-remove-spec');
    removeButton.addEventListener('click', function() {
        specRow.remove();
    });
    
    specsContainer.appendChild(specRow);
}

// Setup functionality for adding specifications
document.addEventListener('DOMContentLoaded', function() {
    const addSpecButton = document.getElementById('add-specification');
    
    if (addSpecButton) {
        addSpecButton.addEventListener('click', function() {
            addSpecificationField();
        });
    }
});

// Function to create dummy robot data for testing
function createDummyRobotData(robotId) {
    const dummyRobot = {
        id: robotId,
        name: robotId.charAt(0).toUpperCase() + robotId.slice(1).replace(/-/g, ' '),
        category: 'Humanoid',
        year: '2023',
        manufacturer: 'MOOK Robotics',
        description: 'An advanced robot designed for various tasks.',
        image: '../images/robots/placeholder.jpg',
        overview: [
            'This is a placeholder description for this robot.',
            'More details about the robot would appear here in a real implementation.'
        ],
        features: [
            'Advanced AI capabilities',
            'Robust movement systems',
            'Sophisticated sensors'
        ],
        specifications: {
            'Height': '1.8 meters',
            'Weight': '80 kg',
            'Power Source': 'Rechargeable battery',
            'Battery Life': '8 hours'
        },
        gallery: [
            { url: '../images/robots/placeholder.jpg', alt: 'Robot front view' },
            { url: '../images/robots/placeholder.jpg', alt: 'Robot side view' }
        ]
    };
    
    populateFormWithRobotData(dummyRobot);
}

// Function to show messages to the user
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('message-container');
    
    if (!messageContainer) {
        // Create a message container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'message-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.padding = '10px 15px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Set background color based on message type
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#4CAF50';
            messageElement.style.color = 'white';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#F44336';
            messageElement.style.color = 'white';
            break;
        case 'warning':
            messageElement.style.backgroundColor = '#FF9800';
            messageElement.style.color = 'white';
            break;
        default:
            messageElement.style.backgroundColor = '#2196F3';
            messageElement.style.color = 'white';
    }
    
    // Add the message to the container
    document.getElementById('message-container').appendChild(messageElement);
    
    // Remove the message after a delay
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 3000);
}

// Save image to the correct location
function saveRobotImage(imageData, robotId) {
    // In a real implementation, this would save the image to a server
    // For demo purposes, we'll store it in localStorage
    
    if (!imageData) return null;
    
    try {
        // Store the image in localStorage
        localStorage.setItem(`mookRobotics_image_${robotId}`, imageData);
        
        // Return the URL that would be used to access the image
        return `../images/robots/${robotId}.jpg`;
    } catch (error) {
        console.error('Error saving image:', error);
        return null;
    }
}

// Create the admin page HTML with an image uploader
function createAdminEditPage() {
    const pageHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit Robot - Admin</title>
        <link rel="stylesheet" href="../css/style.css">
        <link rel="stylesheet" href="../css/admin.css">
        <style>
            .image-upload-container {
                margin-bottom: 20px;
            }
            
            #image-preview {
                max-width: 300px;
                max-height: 300px;
                margin-top: 10px;
                border: 1px solid #ddd;
                padding: 5px;
                background-color: #f5f5f5;
                display: none;
            }
            
            .specification-row {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: center;
            }
            
            .spec-inputs {
                display: flex;
                gap: 10px;
                flex-grow: 1;
            }
            
            .spec-inputs input {
                flex: 1;
            }
            
            #add-specification {
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <header>
            <nav class="admin-nav">
                <div class="logo">MOOK Admin</div>
                <div class="nav-links">
                    <a href="dashboard.html">Dashboard</a>
                    <a href="robots.html">Robots</a>
                    <a href="add-robot.html" class="active">Add/Edit Robot</a>
                </div>
            </nav>
        </header>
        
        <main class="admin-main">
            <div class="admin-container">
                <h1 id="form-title">Edit Robot</h1>
                
                <form id="robot-edit-form">
                    <div class="form-group">
                        <label for="robot-id">Robot ID (used in URLs, no spaces)</label>
                        <input type="text" id="robot-id" name="robot-id" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-name">Robot Name</label>
                        <input type="text" id="robot-name" name="robot-name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-category">Category</label>
                        <input type="text" id="robot-category" name="robot-category">
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-year">Year</label>
                        <input type="text" id="robot-year" name="robot-year">
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-manufacturer">Manufacturer</label>
                        <input type="text" id="robot-manufacturer" name="robot-manufacturer">
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-description">Short Description</label>
                        <input type="text" id="robot-description" name="robot-description" placeholder="Brief description shown on the overview page">
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-image">Main Robot Image</label>
                        <div class="image-upload-container">
                            <input type="file" id="robot-image" name="robot-image" accept="image/*">
                            <input type="hidden" id="image-data" name="image-data">
                            <img id="image-preview" src="" alt="Image Preview">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-overview">Overview (separate paragraphs with blank lines)</label>
                        <textarea id="robot-overview" name="robot-overview" rows="6"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="robot-features">Features (one per line)</label>
                        <textarea id="robot-features" name="robot-features" rows="6"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Specifications</label>
                        <div id="specifications-container">
                            <!-- Specification fields will be added here -->
                        </div>
                        <button type="button" id="add-specification" class="btn btn-small">Add Specification</button>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Robot</button>
                        <a href="robots.html" class="btn btn-outline">Cancel</a>
                    </div>
                </form>
            </div>
        </main>
        
        <script src="../js/admin-robot-editor.js"></script>
    </body>
    </html>
    `;
    
    // In a real implementation, this would create/update the HTML file on the server
    console.log("Admin edit page HTML template created");
    return pageHTML;
}

// Export the necessary functions
if (typeof module !== 'undefined') {
    module.exports = {
        initRobotEditor,
        saveRobotData,
        createAdminEditPage
    };
}
