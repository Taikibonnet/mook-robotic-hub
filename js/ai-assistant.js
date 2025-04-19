/**
 * MOOK Robotics Hub - AI Assistant
 * 
 * This file contains the functionality for the AI assistant chatbot
 * that helps users navigate the robotics encyclopedia.
 */

document.addEventListener('DOMContentLoaded', function() {
    initAIAssistant();
});

/**
 * Initialize the AI assistant functionality
 */
function initAIAssistant() {
    const assistantInput = document.getElementById('assistant-input');
    const sendMessageBtn = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    
    if (assistantInput && sendMessageBtn && chatMessages) {
        // Send message on button click
        sendMessageBtn.addEventListener('click', function() {
            sendMessage();
        });
        
        // Send message on Enter key
        assistantInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

/**
 * Send a message to the AI assistant
 */
function sendMessage() {
    const assistantInput = document.getElementById('assistant-input');
    const chatMessages = document.getElementById('chat-messages');
    
    const message = assistantInput.value.trim();
    
    if (message) {
        // Add user message to chat
        appendMessage('user', message);
        
        // Clear input field
        assistantInput.value = '';
        
        // Process message and generate response
        processMessage(message);
    }
}

/**
 * Add a message to the chat window
 * @param {string} sender - 'user' or 'assistant'
 * @param {string} message - The message text
 */
function appendMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    
    messageElement.appendChild(paragraph);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Process the user message and generate a response
 * @param {string} message - The user's message
 */
function processMessage(message) {
    // In a production environment, this would likely make an API call to a real AI service
    // For demo purposes, we'll use a simple rule-based system
    
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Add typing indicator
    showTypingIndicator();
    
    // Simulate AI processing delay
    setTimeout(() => {
        let response;
        
        // Generate response based on keywords
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello! I'm MOOK, your robotics guide. How can I help you today?";
        }
        else if (lowerMessage.includes('what is') || lowerMessage.includes("what's")) {
            if (lowerMessage.includes('robot')) {
                response = "A robot is a machine capable of carrying out a complex series of actions automatically, especially one programmable by a computer.";
            } else if (lowerMessage.includes('robotics')) {
                response = "Robotics is an interdisciplinary branch of engineering and science that includes mechanical engineering, electronic engineering, computer science, and others. It deals with the design, construction, operation, and use of robots.";
            } else {
                response = "I'd be happy to explain that for you. Could you provide more details about what you're looking for?";
            }
        }
        else if (lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('assist')) {
            response = "I can help you explore our robotics encyclopedia, find information about specific robots, or learn about robotics technologies. What are you interested in?";
        }
        else if (lowerMessage.includes('popular') || lowerMessage.includes('famous') || lowerMessage.includes('best')) {
            response = "Some popular robots include Boston Dynamics' Spot and Atlas, Honda's ASIMO, NASA's Perseverance rover, and SoftBank's Pepper. Would you like more information about any of these?";
        }
        else if (lowerMessage.includes('category') || lowerMessage.includes('type')) {
            response = "Robots can be categorized in many ways, including by application (industrial, service, medical), by movement method (wheeled, legged, flying), or by level of autonomy. What type of robots are you interested in?";
        }
        else if (lowerMessage.includes('future') || lowerMessage.includes('upcoming')) {
            response = "The future of robotics is exciting! Trends include advanced AI integration, soft robotics, human-robot collaboration, and robots becoming more accessible. Is there a specific future technology you'd like to know more about?";
        }
        else if (lowerMessage.includes('thank')) {
            response = "You're welcome! If you have any other questions about robotics, feel free to ask anytime.";
        }
        else {
            // If no keyword matches, use a default response
            response = "That's an interesting question about robotics. I'd recommend exploring our encyclopedia for more detailed information. Is there a specific topic you'd like to know more about?";
        }
        
        // Remove typing indicator
        hideTypingIndicator();
        
        // Add assistant response to chat
        appendMessage('assistant', response);
    }, 1000); // Simulate 1-second response delay
}

/**
 * Show a typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    
    // Create typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'assistant', 'typing-indicator');
    
    const dots = document.createElement('div');
    dots.classList.add('typing-dots');
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    typingIndicator.appendChild(dots);
    chatMessages.appendChild(typingIndicator);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Hide the typing indicator
 */
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Add animation for the assistant avatar 
 */
document.addEventListener('DOMContentLoaded', function() {
    const avatarCircle = document.querySelector('.avatar-circle');
    
    if (avatarCircle) {
        // Add pulse animation when hovering over avatar
        avatarCircle.addEventListener('mouseenter', function() {
            this.classList.add('pulse');
        });
        
        avatarCircle.addEventListener('mouseleave', function() {
            this.classList.remove('pulse');
        });
    }
});
