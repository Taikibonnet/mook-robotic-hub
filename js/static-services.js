// Static services for MOOK Robotics Hub
// This replaces Firebase services with local storage-based alternatives

import { ROBOTS_DATA, NEWS_DATA, ASSISTANT_RESPONSES, USERS_DATA } from './data.js';

// Current user session
let currentUser = null;

// Local storage keys
const ROBOTS_STORAGE_KEY = 'mook_robots';
const NEWS_STORAGE_KEY = 'mook_news';
const USERS_STORAGE_KEY = 'mook_users';

// Retrieve data from local storage or use default data
const getLocalData = (key, defaultData) => {
    const storedData = localStorage.getItem(key);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        // Initialize with default data
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
    }
};

// Initialize data
let robots = getLocalData(ROBOTS_STORAGE_KEY, ROBOTS_DATA);
let news = getLocalData(NEWS_STORAGE_KEY, NEWS_DATA);
let users = getLocalData(USERS_STORAGE_KEY, USERS_DATA);

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
        const user = users.find(u => 
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
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            throw new Error('Email already in use');
        }
        
        // Create new user
        const newUser = {
            id: `user-${Date.now()}`,
            email,
            password, // In a real app, this would be hashed
            name,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        
        // Update local storage
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        
        // Create session (without sensitive data)
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
        return [...robots];
    },
    
    // Get featured robots
    async getFeaturedRobots(count = 3) {
        return robots
            .filter(robot => robot.featured)
            .slice(0, count);
    },
    
    // Get a robot by ID
    async getRobotById(id) {
        const robot = robots.find(r => r.id === id);
        if (!robot) {
            throw new Error('Robot not found');
        }
        return robot;
    },
    
    // Get a robot by slug
    async getRobotBySlug(slug) {
        const robot = robots.find(r => r.slug === slug);
        if (!robot) {
            throw new Error('Robot not found');
        }
        return robot;
    },
    
    // Search robots by keyword
    async searchRobots(keyword) {
        if (!keyword) {
            return [...robots];
        }
        
        const lowerKeyword = keyword.toLowerCase();
        return robots.filter(robot => 
            robot.name.toLowerCase().includes(lowerKeyword) ||
            robot.description.toLowerCase().includes(lowerKeyword) ||
            (robot.category && robot.category.toLowerCase().includes(lowerKeyword)) ||
            (robot.manufacturer && robot.manufacturer.toLowerCase().includes(lowerKeyword)) ||
            (robot.features && robot.features.some(feature => 
                feature.toLowerCase().includes(lowerKeyword)
            ))
        );
    },
    
    // Add a robot
    async addRobot(robotData) {
        // Create a new robot with ID
        const newRobot = {
            id: `robot-${Date.now()}`,
            ...robotData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to robots array
        robots.push(newRobot);
        
        // Update local storage
        localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(robots));
        
        return newRobot;
    },
    
    // Update a robot
    async updateRobot(robotId, robotData) {
        // Find robot index
        const index = robots.findIndex(r => r.id === robotId);
        if (index === -1) {
            throw new Error('Robot not found');
        }
        
        // Update robot
        robots[index] = {
            ...robots[index],
            ...robotData,
            updatedAt: new Date().toISOString()
        };
        
        // Update local storage
        localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(robots));
        
        return robots[index];
    },
    
    // Delete a robot
    async deleteRobot(robotId) {
        // Filter out the robot to delete
        robots = robots.filter(r => r.id !== robotId);
        
        // Update local storage
        localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(robots));
        
        return true;
    }
};

// News Service
export const newsService = {
    // Get all news articles
    async getAllNews() {
        // Sort by date, most recent first
        return [...news].sort((a, b) => 
            new Date(b.publishDate) - new Date(a.publishDate)
        );
    },
    
    // Get recent news
    async getRecentNews(count = 3) {
        return [...news]
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, count);
    },
    
    // Get a news article by ID
    async getNewsById(id) {
        const article = news.find(n => n.id === id);
        if (!article) {
            throw new Error('News article not found');
        }
        return article;
    },
    
    // Get a news article by slug
    async getNewsBySlug(slug) {
        const article = news.find(n => n.slug === slug);
        if (!article) {
            throw new Error('News article not found');
        }
        return article;
    },
    
    // Add a news article
    async addNews(newsData) {
        // Create slug from title
        const slug = newsData.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
        
        // Create a new news article with ID
        const newArticle = {
            id: `news-${Date.now()}`,
            slug,
            ...newsData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to news array
        news.push(newArticle);
        
        // Update local storage
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
        
        return newArticle;
    },
    
    // Update a news article
    async updateNews(newsId, newsData) {
        // Find news index
        const index = news.findIndex(n => n.id === newsId);
        if (index === -1) {
            throw new Error('News article not found');
        }
        
        // Update news article
        news[index] = {
            ...news[index],
            ...newsData,
            updatedAt: new Date().toISOString()
        };
        
        // Update local storage
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
        
        return news[index];
    },
    
    // Delete a news article
    async deleteNews(newsId) {
        // Filter out the news article to delete
        news = news.filter(n => n.id !== newsId);
        
        // Update local storage
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
        
        return true;
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