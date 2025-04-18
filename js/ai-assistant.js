// AI Assistant JavaScript for MOOK Robotics Hub
// This file handles the AI assistant functionality

import { assistantService } from './database.js';

// DOM Elements
const activateAssistantBtn = document.getElementById('activate-assistant');
const assistantModal = document.getElementById('assistant-modal');
const closeAssistantBtn = assistantModal ? assistantModal.querySelector('.close-modal') : null;
const chatMessages = document.getElementById('chat-messages');
const assistantInput = document.getElementById('assistant-input');
const sendMessageBtn = document.getElementById('send-message');

// Predefined responses
let assistantResponses = [];

// Initialize assistant
async function initializeAssistant() {
    try {
        // Load predefined responses from the database
        assistantResponses = await assistantService.getResponses();
        console.log("Assistant initialized with responses:", assistantResponses.length);
    } catch (error) {
        console.error("Error initializing assistant:", error);
        // Fallback to local responses if database fails
        assistantResponses = [
            {
                keyword: "about",
                response: "MOOK Robotics Hub is an interactive encyclopedia dedicated to all things robotics. We provide information on various robots, from industrial to humanoid, with detailed specifications, features, and media content."
            },
            {
                keyword: "navigation",
                response: "You can navigate our site using the main menu at the top. The 'Encyclopedia' section contains all our robot entries, or you can use the search bar to find specific robots or topics."
            },
            {
                keyword: "account",
                response: "Creating an account allows you to save your favorite robots, receive updates on new entries, and customize your experience. Simply click the 'Sign Up' button in the top right corner."
            },
            {
                keyword: "contact",
                response: "You can contact us through the 'Contact' link in the footer, or email us directly at info@mookrobotics.com."
            }
        ];
    }
}

// Show/Hide assistant modal
function showAssistantModal() {
    if (assistantModal) {
        assistantModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function hideAssistantModal() {
    if (assistantModal) {
        assistantModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Add a message to the chat
function addMessage(text, isUser = false) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user' : 'assistant');
    
    const messagePara = document.createElement('p');
    messagePara.textContent = text;
    
    messageDiv.appendChild(messagePara);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Log user questions for improvement
    if (isUser) {
        // We'll get the response in the processUserInput function
    }
}

// Process user input and generate response
async function processUserInput(userText) {
    // Trim whitespace
    const text = userText.trim();
    
    if (!text) return;
    
    // Add user message to chat
    addMessage(text, true);
    
    // Generate response
    let response = "I'm sorry, I don't have information about that yet. Can I help you with something else?";
    let matched = false;
    
    // Match against predefined responses
    for (const item of assistantResponses) {
        if (text.toLowerCase().includes(item.keyword.toLowerCase())) {
            response = item.response;
            matched = true;
            break;
        }
    }
    
    // If no match found, try to give a helpful general response
    if (!matched) {
        if (text.toLowerCase().includes('robot')) {
            response = "You can find detailed information about various robots in our encyclopedia section. Would you like me to help you navigate there?";
        } else if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign')) {
            response = "You can login or sign up by clicking the respective buttons in the top right corner of the page.";
        } else if (text.toLowerCase().includes('search')) {
            response = "You can use the search bar at the top of the page to find specific robots or topics.";
        }
    }
    
    // Simulate typing delay
    setTimeout(() => {
        addMessage(response);
        
        // Log the conversation
        try {
            assistantService.logQuestion(text, response);
        } catch (error) {
            console.error("Error logging conversation:", error);
        }
    }, 1000);
    
    return response;
}

// Event Listeners
if (activateAssistantBtn) {
    activateAssistantBtn.addEventListener('click', () => {
        showAssistantModal();
        initializeAssistant();
    });
}

if (closeAssistantBtn) {
    closeAssistantBtn.addEventListener('click', hideAssistantModal);
}

// Close modal when clicking outside
if (assistantModal) {
    assistantModal.addEventListener('click', (e) => {
        if (e.target === assistantModal) {
            hideAssistantModal();
        }
    });
}

// Handle send message button
if (sendMessageBtn && assistantInput) {
    sendMessageBtn.addEventListener('click', () => {
        const userText = assistantInput.value;
        if (userText.trim()) {
            processUserInput(userText);
            assistantInput.value = ''; // Clear input
        }
    });
}

// Handle enter key in input
if (assistantInput) {
    assistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const userText = assistantInput.value;
            if (userText.trim()) {
                processUserInput(userText);
                assistantInput.value = ''; // Clear input
            }
        }
    });
}

// Initialize the assistant when the page loads
document.addEventListener('DOMContentLoaded', initializeAssistant);

// Export for use in other modules
export { processUserInput };