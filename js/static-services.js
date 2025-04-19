// Static services for MOOK Robotics Hub
// This replaces Firebase services with local storage-based alternatives

import { ROBOTS_DATA, NEWS_DATA, ASSISTANT_RESPONSES, USERS_DATA } from './data.js';

// Current user session
let currentUser = null;

// Check for existing session
const initializeSession = () => {
  const storedUser = localStorage.getItem('mook_current_user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    
    // Dispatch event for components to react
    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: currentUser }));
    
    return currentUser;
  }
  return null;
};

// Authentication Service
export const authService = {
  // Initialize auth
  init() {
    return initializeSession();
  },
  
  // Get current user
  getCurrentUser() {
    return currentUser;
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return currentUser !== null;
  },
  
  // Check if user is admin
  isAdmin() {
    return currentUser !== null && currentUser.role === 'admin';
  },
  
  // Login with email and password
  async login(email, password) {
    // Find user with matching credentials
    const user = USERS_DATA.find(u => 
      u.email === email && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create session (without sensitive data)
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    // Store in localStorage
    localStorage.setItem('mook_current_user', JSON.stringify(session));
    currentUser = session;
    
    // Dispatch event for components to react
    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: session }));
    
    return session;
  },
  
  // Register new user
  async register(name, email, password) {
    // Check if email already exists
    const existingUser = USERS_DATA.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // In a real app, this would add to the database
    // For demo, we'll create a temporary user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    // Create session
    const session = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
    
    // Store in localStorage
    localStorage.setItem('mook_current_user', JSON.stringify(session));
    currentUser = session;
    
    // Dispatch event for components to react
    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: session }));
    
    return session;
  },
  
  // Logout
  async logout() {
    localStorage.removeItem('mook_current_user');
    currentUser = null;
    
    // Dispatch event for components to react
    document.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    return true;
  }
};

// Robot Service
export const robotService = {
  // Get all robots
  async getAllRobots() {
    return [...ROBOTS_DATA];
  },
  
  // Get featured robots
  async getFeaturedRobots(count = 3) {
    return ROBOTS_DATA
      .filter(robot => robot.featured)
      .slice(0, count);
  },
  
  // Get a robot by ID
  async getRobotById(id) {
    const robot = ROBOTS_DATA.find(r => r.id === id);
    if (!robot) {
      throw new Error('Robot not found');
    }
    return robot;
  },
  
  // Get a robot by slug
  async getRobotBySlug(slug) {
    const robot = ROBOTS_DATA.find(r => r.slug === slug);
    if (!robot) {
      throw new Error('Robot not found');
    }
    return robot;
  },
  
  // Search robots by keyword
  async searchRobots(keyword) {
    if (!keyword) {
      return [...ROBOTS_DATA];
    }
    
    const lowerKeyword = keyword.toLowerCase();
    return ROBOTS_DATA.filter(robot => 
      robot.name.toLowerCase().includes(lowerKeyword) ||
      robot.description.toLowerCase().includes(lowerKeyword) ||
      (robot.category && robot.category.toLowerCase().includes(lowerKeyword)) ||
      (robot.manufacturer && robot.manufacturer.toLowerCase().includes(lowerKeyword)) ||
      (robot.features && robot.features.some(feature => 
        feature.toLowerCase().includes(lowerKeyword)
      ))
    );
  }
};

// News Service
export const newsService = {
  // Get all news articles
  async getAllNews() {
    // Sort by date, most recent first
    return [...NEWS_DATA].sort((a, b) => 
      new Date(b.publishDate) - new Date(a.publishDate)
    );
  },
  
  // Get recent news
  async getRecentNews(count = 3) {
    return [...NEWS_DATA]
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, count);
  },
  
  // Get a news article by ID
  async getNewsById(id) {
    const news = NEWS_DATA.find(n => n.id === id);
    if (!news) {
      throw new Error('News article not found');
    }
    return news;
  },
  
  // Get a news article by slug
  async getNewsBySlug(slug) {
    const news = NEWS_DATA.find(n => n.slug === slug);
    if (!news) {
      throw new Error('News article not found');
    }
    return news;
  }
};

// AI Assistant Service
export const assistantService = {
  // Get all predefined responses
  async getResponses() {
    return [...ASSISTANT_RESPONSES];
  },
  
  // Get response for a question
  async getResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Find matching responses
    for (const item of ASSISTANT_RESPONSES) {
      if (lowerQuestion.includes(item.keyword.toLowerCase())) {
        return item.response;
      }
    }
    
    // Default response if no match found
    return "I'm sorry, I don't have information about that yet. Can I help you with something else?";
  },
  
  // Log user questions (for demo purposes)
  async logQuestion(question, response) {
    // In a static version, we just console log
    console.log(`Q: ${question}`);
    console.log(`A: ${response}`);
    return true;
  }
};

// Initialize auth on load
document.addEventListener('DOMContentLoaded', initializeSession);