/**
 * robots.js - Handles the display and management of robots in the encyclopedia
 */

// Function to create a standardized robot card for any robot
function createRobotCard(robot) {
  // Create the main container
  const robotCard = document.createElement('div');
  robotCard.className = 'robot-card';
  robotCard.dataset.robotId = robot.id || robot.name.toLowerCase().replace(/\s+/g, '-');
  
  // Create the HTML structure (based on Atlas format)
  robotCard.innerHTML = `
    <div class="robot-header">
      <h2 class="robot-name">${robot.name}</h2>
      <p class="robot-manufacturer">${robot.manufacturer || 'Unknown manufacturer'}</p>
    </div>
    <div class="robot-content">
      <div class="robot-image-container">
        <img src="${robot.image || 'images/placeholder-robot.jpg'}" alt="${robot.name}" class="robot-image">
      </div>
      <div class="robot-details">
        <p class="robot-description">${robot.description || 'No description available.'}</p>
        <div class="robot-specs">
          <p><strong>Height:</strong> ${robot.height || 'N/A'}</p>
          <p><strong>Weight:</strong> ${robot.weight || 'N/A'}</p>
          <p><strong>Year:</strong> ${robot.year || 'N/A'}</p>
          <p><strong>Type:</strong> ${robot.type || 'N/A'}</p>
          ${generateSpecsList(robot.specifications)}
        </div>
      </div>
    </div>
  `;
  
  return robotCard;
}

// Helper function to generate specifications list
function generateSpecsList(specs) {
  if (!specs || Object.keys(specs).length === 0) return '';
  
  let specsList = '<div class="additional-specs"><h3>Specifications</h3><ul>';
  
  for (const [key, value] of Object.entries(specs)) {
    // Format the key for display (convert camelCase to Title Case)
    const formattedKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
      
    specsList += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
  }
  
  specsList += '</ul></div>';
  return specsList;
}

// Function to display all robots in the encyclopedia
function displayRobots(containerId = 'robots-container') {
  const robotsContainer = document.getElementById(containerId);
  if (!robotsContainer) {
    console.error('Robots container not found:', containerId);
    return;
  }
  
  // Clear the container
  robotsContainer.innerHTML = '';
  
  // Get robots from storage
  const robots = getRobotsFromStorage();
  
  // Handle case with no robots
  if (robots.length === 0) {
    robotsContainer.innerHTML = '<p class="no-robots">No robots found in the encyclopedia. Add robots through the admin dashboard.</p>';
    return;
  }
  
  // Sort robots alphabetically
  robots.sort((a, b) => a.name.localeCompare(b.name));
  
  // Create and append each robot card
  robots.forEach(robot => {
    const robotCard = createRobotCard(robot);
    robotsContainer.appendChild(robotCard);
  });
}

// Function to get robots from storage
function getRobotsFromStorage() {
  try {
    const storedRobots = localStorage.getItem('mook-robots');
    return storedRobots ? JSON.parse(storedRobots) : [];
  } catch (error) {
    console.error('Error fetching robots from storage:', error);
    return [];
  }
}

// Function to save robots to storage
function saveRobotsToStorage(robots) {
  try {
    localStorage.setItem('mook-robots', JSON.stringify(robots));
    return true;
  } catch (error) {
    console.error('Error saving robots to storage:', error);
    return false;
  }
}

// Function to add a new robot
function addRobot(robot) {
  if (!robot.name) {
    console.error('Robot must have a name');
    return false;
  }
  
  // Generate ID if not provided
  if (!robot.id) {
    robot.id = Date.now().toString();
  }
  
  // Get existing robots
  const robots = getRobotsFromStorage();
  
  // Check if robot with same ID already exists
  const existingIndex = robots.findIndex(r => r.id === robot.id);
  if (existingIndex !== -1) {
    robots[existingIndex] = robot; // Update existing robot
  } else {
    robots.push(robot); // Add new robot
  }
  
  // Save updated robots
  return saveRobotsToStorage(robots);
}

// Function to delete a robot
function deleteRobot(robotId) {
  // Get existing robots
  const robots = getRobotsFromStorage();
  
  // Filter out the robot to delete
  const updatedRobots = robots.filter(robot => robot.id !== robotId);
  
  // Save updated robots
  return saveRobotsToStorage(updatedRobots);
}

// Export functions for use in other files
window.robotsModule = {
  createRobotCard,
  displayRobots,
  getRobotsFromStorage,
  saveRobotsToStorage,
  addRobot,
  deleteRobot
};

// Initialize robots display when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the encyclopedia page
  const robotsContainer = document.getElementById('robots-container');
  if (robotsContainer) {
    displayRobots('robots-container');
  }
});
