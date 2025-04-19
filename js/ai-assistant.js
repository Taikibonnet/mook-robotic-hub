// AI Assistant JavaScript for MOOK Robotics Hub
// This file handles the AI assistant functionality

import { assistantService } from './static-services.js';

// DOM Elements
const activateAssistantBtn = document.getElementById('activate-assistant');
const assistantModal = document.getElementById('assistant-modal');
const closeAssistantBtn = assistantModal ? assistantModal.querySelector('.close-modal') : null;
const chatMessages = document.getElementById('chat-messages');
const assistantInput = document.getElementById('assistant-input');
const sendMessageBtn = document.getElementById('send-message');

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
}

// Process user input and generate response
async function processUserInput(userText) {
    // Trim whitespace
    const text = userText.trim();
    
    if (!text) return;
    
    // Add user message to chat
    addMessage(text, true);
    
    try {
        // Get response from assistant service
        const response = await assistantService.getResponse(text);
        
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
    } catch (error) {
        console.error("Error processing assistant response:", error);
        setTimeout(() => {
            addMessage("I'm sorry, I'm having trouble responding right now. Please try again later.");
        }, 1000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Activate assistant button
    if (activateAssistantBtn) {
        activateAssistantBtn.addEventListener('click', showAssistantModal);
    }
    
    // Close assistant modal
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
});

// Export for use in other modules
export { processUserInput, showAssistantModal, hideAssistantModal };