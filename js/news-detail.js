/**
 * MOOK Robotics Hub - News Detail JavaScript
 * 
 * This file handles displaying the details of a specific news article.
 * It identifies the article from the URL slug and fetches data from
 * localStorage or generates content from the news-service.
 */

import { getNewsBySlug, newsHtmlExists, getNewsHtml, getAllNews } from './news-service.js';

document.addEventListener('DOMContentLoaded', function() {
    loadNewsDetails();
    loadRelatedArticles();
});

/**
 * Load news article details based on the URL
 */
function loadNewsDetails() {
    try {
        // Get the current URL
        const currentPath = window.location.pathname;
        
        // Extract slug from path (e.g., /news/article-slug.html -> article-slug)
        // Using regex to match the pattern: news/SLUG.html
        const slugMatch = currentPath.match(/news\/(.+?)\.html/);
        
        if (!slugMatch || !slugMatch[1]) {
            // If no match found, show error
            showError('Article not found. The URL appears to be invalid.');
            return;
        }
        
        const slug = slugMatch[1];
        
        // First check if this article has HTML content generated
        if (newsHtmlExists(slug)) {
            // If HTML exists, we're on a page for an article that was added by a user
            // In a real app, we would load a proper HTML file
            // For this demo, we'll render the stored HTML content
            const htmlContent = getNewsHtml(slug);
            
            if (htmlContent) {
                // In a real app, we'd redirect to the proper HTML file
                // For demo, we'll replace the current page content
                document.documentElement.innerHTML = htmlContent;
                return;
            }
        }
        
        // Otherwise, fetch the article data and render it
        const article = getNewsBySlug(slug);
        
        if (!article) {
            showError('Article not found. It may have been removed or does not exist.');
            return;
        }
        
        // Render the article details on the page
        renderNewsDetails(article);
    } catch (error) {
        console.error('Error loading news details:', error);
        showError('An error occurred while loading the article details.');
    }
}

/**
 * Load related articles
 */
function loadRelatedArticles() {
    try {
        const currentPath = window.location.pathname;
        const slugMatch = currentPath.match(/news\/(.+?)\.html/);
        
        if (!slugMatch || !slugMatch[1]) return;
        
        const currentSlug = slugMatch[1];
        const currentArticle = getNewsBySlug(currentSlug);
        
        if (!currentArticle) return;
        
        // Get all news articles
        const allNews = getAllNews();
        
        // Find related articles based on category
        let relatedArticles = allNews.filter(article => 
            article.slug !== currentSlug && 
            article.category === currentArticle.category
        );
        
        // If not enough articles in same category, add some recent ones
        if (relatedArticles.length < 3) {
            const recentArticles = allNews
                .filter(article => 
                    article.slug !== currentSlug && 
                    !relatedArticles.some(related => related.slug === article.slug)
                )
                .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            
            relatedArticles = [...relatedArticles, ...recentArticles.slice(0, 3 - relatedArticles.length)];
        }
        
        // Limited to 3 related articles
        relatedArticles = relatedArticles.slice(0, 3);
        
        // Render related articles
        renderRelatedArticles(relatedArticles);
    } catch (error) {
        console.error('Error loading related articles:', error);
    }
}

/**
 * Render news article details on the page
 * @param {Object} article - News article data object
 */
function renderNewsDetails(article) {
    // Update the page title
    document.title = `${article.title} - MOOK Robotics Hub`;
    
    // Update breadcrumb
    const breadcrumbTitle = document.querySelector('.breadcrumb-container span');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = article.title;
    }
    
    // Update article header
    document.querySelector('.article-header h1').textContent = article.title;
    
    // Format and update the date
    const publishDate = new Date(article.publishDate);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.querySelector('.article-date').innerHTML = `
        <i class="fas fa-calendar-alt"></i> ${formattedDate}
    `;
    
    // Update author
    document.querySelector('.article-author').innerHTML = `
        <i class="fas fa-user"></i> ${article.author || 'MOOK Editorial Team'}
    `;
    
    // Update category
    document.querySelector('.article-category').innerHTML = `
        <i class="fas fa-folder"></i> ${article.category || 'General'}
    `;
    
    // Update featured image
    const featuredImg = document.querySelector('.article-featured-image img');
    if (featuredImg) {
        featuredImg.src = article.image || '../images/news/placeholder.jpg';
        featuredImg.alt = article.title;
        // Add error handler for image
        featuredImg.onerror = function() {
            this.src = '../images/news/placeholder.jpg';
        };
    }
    
    // Update content
    const contentElement = document.querySelector('.article-content');
    if (contentElement) {
        contentElement.innerHTML = article.content || article.summary || 'No content available.';
    }
    
    // Update tags
    const tagsContainer = document.querySelector('.article-tags');
    if (tagsContainer) {
        // Clear any existing tags
        tagsContainer.innerHTML = '';
        
        // Add new tags
        if (article.tags && article.tags.length > 0) {
            const tagElements = typeof article.tags === 'string' ?
                article.tags.split(',').map(tag => `<a href="../news.html?tag=${tag.trim()}" class="tag">${tag.trim()}</a>`) :
                article.tags.map(tag => `<a href="../news.html?tag=${tag}" class="tag">${tag}</a>`);
                
            tagsContainer.innerHTML = tagElements.join('');
        }
    }
}

/**
 * Render related articles
 * @param {Array} articles - Array of related article objects
 */
function renderRelatedArticles(articles) {
    const container = document.getElementById('related-articles-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // If no related articles, show message
    if (articles.length === 0) {
        container.innerHTML = '<p>No related articles found.</p>';
        return;
    }
    
    // Create related article elements
    articles.forEach(article => {
        // Format date
        const publishDate = new Date(article.publishDate);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create article card
        const articleCard = document.createElement('div');
        articleCard.className = 'news-card';
        
        articleCard.innerHTML = `
            <div class="news-card-image">
                <img src="${article.image || '../images/news/placeholder.jpg'}" alt="${article.title}" onerror="this.src='../images/news/placeholder.jpg'">
            </div>
            <div class="news-card-content">
                <div class="news-card-category">${article.category || 'Uncategorized'}</div>
                <h3 class="news-card-title">${article.title}</h3>
                <p class="news-card-date">${formattedDate}</p>
                <p class="news-card-summary">${article.summary || (article.content ? extractExcerpt(article.content, 100) : 'No description available.')}</p>
                <div class="news-card-footer">
                    <span class="news-card-author">${article.author || 'MOOK Editorial Team'}</span>
                    <a href="${article.slug}.html" class="btn btn-outline btn-sm">Read More</a>
                </div>
            </div>
        `;
        
        container.appendChild(articleCard);
    });
}

/**
 * Extract a text excerpt from HTML content
 * @param {string} html - HTML content
 * @param {number} length - Maximum length
 * @returns {string} Text excerpt
 */
function extractExcerpt(html, length = 150) {
    // Create a temporary div
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get the text content
    const text = temp.textContent || temp.innerText || '';
    
    // Trim and limit length
    return text.trim().substring(0, length) + (text.length > length ? '...' : '');
}

/**
 * Show error message on the page
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Find the main content area
    const mainElement = document.querySelector('main');
    
    if (mainElement) {
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-container';
        
        errorElement.innerHTML = `
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error</h2>
            <p>${message}</p>
            <a href="../news.html" class="btn btn-primary">Return to News</a>
        `;
        
        // Replace main content with error
        mainElement.innerHTML = '';
        mainElement.appendChild(errorElement);
    } else {
        // If main element not found, alert
        alert(`Error: ${message}`);
    }
}
