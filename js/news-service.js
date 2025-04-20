/**
 * MOOK Robotics Hub - News Service
 * 
 * This file contains functions for managing news data,
 * including creating, updating, and retrieving news articles.
 * It uses localStorage for data persistence in this static implementation.
 */

import { NEWS_DATA } from './data.js';

/**
 * Get all news articles from storage
 * @returns {Array} Array of news article objects
 */
function getAllNews() {
    // Try to get news from localStorage first
    const storedNews = localStorage.getItem('mookRoboticsNews');
    
    if (storedNews) {
        // Combine stored news with the default ones
        const parsedStoredNews = JSON.parse(storedNews);
        
        // Create a map of default news by ID for quick lookup
        const defaultNewsMap = {};
        NEWS_DATA.forEach(news => {
            defaultNewsMap[news.id] = true;
        });
        
        // Filter out stored news that would duplicate default ones
        const uniqueStoredNews = parsedStoredNews.filter(news => !defaultNewsMap[news.id]);
        
        // Return combined list
        return [...NEWS_DATA, ...uniqueStoredNews];
    }
    
    // If no stored news, return just the default ones
    return [...NEWS_DATA];
}

/**
 * Get a news article by ID
 * @param {string} id - News article ID
 * @returns {Object|null} News article object or null if not found
 */
function getNewsById(id) {
    const news = getAllNews();
    return news.find(article => article.id === id) || null;
}

/**
 * Get a news article by slug
 * @param {string} slug - News article slug (URL-friendly title)
 * @returns {Object|null} News article object or null if not found
 */
function getNewsBySlug(slug) {
    const news = getAllNews();
    return news.find(article => article.slug === slug) || null;
}

/**
 * Create a new news article
 * @param {Object} newsData - News article data object
 * @returns {Object} Created news article with ID
 */
function createNews(newsData) {
    // Get existing news
    const news = getAllNews();
    
    // Generate ID and slug if not provided
    const newArticle = {
        ...newsData,
        id: newsData.id || `news-${Date.now()}`,
        slug: newsData.slug || createSlug(newsData.title),
        publishDate: newsData.publishDate || new Date().toISOString()
    };
    
    // Add to array
    news.push(newArticle);
    
    // Save to localStorage (excluding default news)
    saveNewsToStorage(news);
    
    // Generate HTML file for the news article
    generateNewsHtml(newArticle);
    
    return newArticle;
}

/**
 * Update an existing news article
 * @param {string} id - News article ID
 * @param {Object} newsData - Updated news article data
 * @returns {Object|null} Updated news article or null if not found
 */
function updateNews(id, newsData) {
    const news = getAllNews();
    const index = news.findIndex(article => article.id === id);
    
    if (index === -1) {
        return null;
    }
    
    // Update news article data
    news[index] = {
        ...news[index],
        ...newsData,
        // Ensure ID and slug remain the same
        id: news[index].id,
        slug: newsData.slug || news[index].slug
    };
    
    // Save to localStorage
    saveNewsToStorage(news);
    
    // Update HTML file
    generateNewsHtml(news[index]);
    
    return news[index];
}

/**
 * Delete a news article
 * @param {string} id - News article ID
 * @returns {boolean} Success status
 */
function deleteNews(id) {
    const news = getAllNews();
    const index = news.findIndex(article => article.id === id);
    
    if (index === -1) {
        return false;
    }
    
    // Get the news article to be deleted
    const deletedArticle = news[index];
    
    // Remove from array
    news.splice(index, 1);
    
    // Save to localStorage
    saveNewsToStorage(news);
    
    // Here we would ideally delete the HTML file, but we can't do that in a static site
    // We would need to mark it as deleted in some way
    
    return true;
}

/**
 * Get most recent news articles
 * @param {number} count - Number of articles to return
 * @returns {Array} Array of recent news articles
 */
function getRecentNews(count = 3) {
    const news = getAllNews();
    
    // Sort by publish date (newest first)
    const sortedNews = [...news].sort((a, b) => {
        const dateA = new Date(a.publishDate);
        const dateB = new Date(b.publishDate);
        return dateB - dateA;
    });
    
    // Return the specified number of articles
    return sortedNews.slice(0, count);
}

/**
 * Save news articles to localStorage (excluding default news)
 * @param {Array} news - Full array of news articles
 */
function saveNewsToStorage(news) {
    // Create a map of default news by ID for quick lookup
    const defaultNewsMap = {};
    NEWS_DATA.forEach(article => {
        defaultNewsMap[article.id] = true;
    });
    
    // Filter out default news
    const customNews = news.filter(article => !defaultNewsMap[article.id]);
    
    // Save to localStorage
    localStorage.setItem('mookRoboticsNews', JSON.stringify(customNews));
}

/**
 * Create a URL-friendly slug from a title
 * @param {string} title - News article title
 * @returns {string} Slug
 */
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens with a single one
        .trim(); // Trim extra spaces
}

/**
 * Generate HTML file for a news article
 * @param {Object} article - News article data
 * @returns {boolean} Success status
 */
function generateNewsHtml(article) {
    // In a real backend system, this would create an actual file
    // For now, we'll store the HTML content in localStorage
    // When the page is loaded, we'll check if there's HTML content for the requested article
    
    // Create a basic HTML template using the article's data
    const html = generateNewsHtmlContent(article);
    
    // Store in localStorage
    localStorage.setItem(`mookRoboticsNewsHtml_${article.slug}`, html);
    
    return true;
}

/**
 * Generate HTML content for a news article
 * @param {Object} article - News article data
 * @returns {string} HTML content
 */
function generateNewsHtmlContent(article) {
    // This is a simplified template - in a real implementation, this would be more comprehensive
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - MOOK Robotics Hub</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/theme.css">
    <link rel="stylesheet" href="../css/news.css">
</head>
<body>
    <header>
        <nav class="main-nav">
            <div class="logo">
                <svg width="50" height="50" viewBox="0 0 50 50" class="logo-svg">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary-color)" stroke-width="2" />
                    <circle cx="25" cy="25" r="5" fill="var(--primary-color)" />
                    <path d="M25 10 L25 5" stroke="var(--primary-color)" stroke-width="2" />
                    <path d="M25 45 L25 40" stroke="var(--primary-color)" stroke-width="2" />
                    <path d="M10 25 L5 25" stroke="var(--primary-color)" stroke-width="2" />
                    <path d="M45 25 L40 25" stroke="var(--primary-color)" stroke-width="2" />
                </svg>
                <span>MOOK Robotics Hub</span>
            </div>
            <div class="nav-links">
                <a href="../index.html">Home</a>
                <a href="../robots/index.html">Encyclopedia</a>
                <a href="../news.html" class="active">News</a>
                <a href="../about.html">About</a>
            </div>
            <div class="nav-auth">
                <button id="login-btn" class="btn btn-primary">Login</button>
                <button id="signup-btn" class="btn btn-outline">Sign Up</button>
            </div>
        </nav>
    </header>

    <main>
        <div class="news-breadcrumb">
            <div class="breadcrumb-container">
                <a href="../index.html">Home</a>
                <i class="fas fa-chevron-right"></i>
                <a href="../news.html">News</a>
                <i class="fas fa-chevron-right"></i>
                <span>${article.title}</span>
            </div>
        </div>

        <article class="news-article">
            <div class="article-header">
                <h1>${article.title}</h1>
                <div class="article-meta">
                    <span class="article-date">${formatDate(article.publishDate)}</span>
                    <span class="article-author">By ${article.author}</span>
                    <span class="article-category">${article.category}</span>
                </div>
            </div>
            
            <div class="article-image">
                <img src="../${article.image}" alt="${article.title}" onerror="this.src='../images/news/placeholder.jpg'">
            </div>
            
            <div class="article-content">
                ${article.content}
            </div>
            
            <div class="article-footer">
                <div class="article-tags">
                    ${article.tags ? article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="article-share">
                    <span>Share:</span>
                    <a href="#" class="share-link"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="share-link"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="share-link"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
        </article>
        
        <section class="related-news">
            <h2>Related Articles</h2>
            <div class="related-news-container">
                <!-- This would be dynamically populated in a real implementation -->
                <div class="news-card">
                    <div class="news-card-image">
                        <img src="../images/news/placeholder.jpg" alt="Related article">
                    </div>
                    <div class="news-card-content">
                        <h3 class="news-card-title">Related Article Title</h3>
                        <p class="news-card-excerpt">Brief excerpt from the related article...</p>
                        <a href="#" class="read-more">Read More</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>MOOK Robotics Hub</h3>
                <p>Your interactive guide to the world of robotics</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Navigation</h3>
                <ul>
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../robots/index.html">Encyclopedia</a></li>
                    <li><a href="../news.html">News</a></li>
                    <li><a href="../about.html">About</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <ul>
                    <li><a href="mailto:info@mookrobotics.com">info@mookrobotics.com</a></li>
                    <li><a href="../contact.html">Contact Form</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Account</h3>
                <ul>
                    <li><a href="#login">Login</a></li>
                    <li><a href="#signup">Sign Up</a></li>
                    <li><a href="../my-account.html">My Account</a></li>
                    <li><a href="../admin/dashboard.html">Admin</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 MOOK Robotics Hub. All rights reserved.</p>
        </div>
    </footer>

    <script src="../js/main.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/news-detail.js"></script>
</body>
</html>`;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Export functions
export {
    getAllNews,
    getNewsById,
    getNewsBySlug,
    createNews,
    updateNews,
    deleteNews,
    getRecentNews
};
