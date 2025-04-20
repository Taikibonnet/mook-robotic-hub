/**
 * MOOK Robotics Hub - Admin News Page JavaScript
 * 
 * This file contains functionality for the news management page,
 * including listing, filtering, and performing actions on news articles.
 */

import { getAllNews, deleteNews, updateNews } from '../../js/news-service.js';
import { logActivity } from './dashboard.js';

// Constants
const NEWS_PER_PAGE = 10;

// State
let allNews = [];
let filteredNews = [];
let currentPage = 1;
let selectedNews = new Set();

// Document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load news
    loadNews();
    
    // Initialize filters
    initFilters();
    
    // Initialize search
    initSearch();
    
    // Initialize pagination
    initPagination();
    
    // Initialize selection controls
    initSelectionControls();
    
    // Initialize action buttons
    initActionButtons();
    
    // Initialize modals
    initModals();
});

/**
 * Load all news articles from the service
 */
async function loadNews() {
    try {
        // Get all news
        allNews = getAllNews();
        
        // Apply initial filters and render
        filterNews();
        renderNewsPage(1);
        
        // Update filter dropdowns with available options
        updateFilterOptions();
    } catch (error) {
        console.error('Error loading news articles:', error);
        showError('Failed to load news articles. Please try again later.');
    }
}

/**
 * Initialize filter panel and controls
 */
function initFilters() {
    // Filter button toggle
    const filterBtn = document.getElementById('news-filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    
    if (filterBtn && filterPanel) {
        filterBtn.addEventListener('click', function() {
            filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterNews();
            renderNewsPage(1);
            
            // Hide the filter panel
            if (filterPanel) {
                filterPanel.style.display = 'none';
            }
        });
    }
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset filter dropdowns
            document.getElementById('filter-category').value = '';
            document.getElementById('filter-author').value = '';
            document.getElementById('filter-date-from').value = '';
            document.getElementById('filter-date-to').value = '';
            
            // Reset search
            document.getElementById('news-search-input').value = '';
            
            // Reset filters and render
            filterNews();
            renderNewsPage(1);
            
            // Hide the filter panel
            if (filterPanel) {
                filterPanel.style.display = 'none';
            }
        });
    }
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('news-search-input');
    const searchBtn = document.getElementById('news-search-btn');
    
    if (searchInput && searchBtn) {
        // Search button click
        searchBtn.addEventListener('click', function() {
            filterNews();
            renderNewsPage(1);
        });
        
        // Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterNews();
                renderNewsPage(1);
            }
        });
    }
}

/**
 * Initialize pagination controls
 */
function initPagination() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                renderNewsPage(currentPage - 1);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE);
            if (currentPage < totalPages) {
                renderNewsPage(currentPage + 1);
            }
        });
    }
}

/**
 * Initialize selection controls (checkboxes)
 */
function initSelectionControls() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // Get all news checkboxes on the current page
            const checkboxes = document.querySelectorAll('#news-list .news-checkbox');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                
                // Update selected news set
                const newsId = checkbox.value;
                if (isChecked) {
                    selectedNews.add(newsId);
                } else {
                    selectedNews.delete(newsId);
                }
            });
            
            // Update bulk action buttons
            updateBulkActionButtons();
        });
    }
}

/**
 * Initialize action buttons (edit, delete, etc.)
 */
function initActionButtons() {
    // Get the bulk delete button
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function() {
            if (selectedNews.size > 0) {
                openDeleteConfirmation([...selectedNews]);
            }
        });
    }
    
    // Modal action buttons for delete confirmation
    const cancelActionBtn = document.getElementById('cancel-action');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const closeModalBtn = document.querySelector('#news-action-modal .close-modal');
    const actionModal = document.getElementById('news-action-modal');
    
    if (cancelActionBtn && actionModal) {
        cancelActionBtn.addEventListener('click', function() {
            actionModal.style.display = 'none';
        });
    }
    
    if (closeModalBtn && actionModal) {
        closeModalBtn.addEventListener('click', function() {
            actionModal.style.display = 'none';
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            // Get the news IDs from the data attribute
            const newsIds = this.dataset.newsIds.split(',');
            
            // Delete the news articles
            deleteNewsArticles(newsIds);
            
            // Close the modal
            if (actionModal) {
                actionModal.style.display = 'none';
            }
        });
    }
}

/**
 * Initialize editor modal functionality
 */
function initModals() {
    // Get modal elements
    const editorModal = document.getElementById('article-editor-modal');
    const closeModalBtn = document.querySelector('#article-editor-modal .close-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveEditBtn = document.getElementById('save-edit');
    
    // Close button functionality
    if (closeModalBtn && editorModal) {
        closeModalBtn.addEventListener('click', function() {
            editorModal.style.display = 'none';
        });
    }
    
    // Cancel button functionality
    if (cancelEditBtn && editorModal) {
        cancelEditBtn.addEventListener('click', function() {
            editorModal.style.display = 'none';
        });
    }
    
    // Save button functionality
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', function() {
            // Get article ID
            const articleId = document.getElementById('edit-article-id').value;
            
            // Get form data
            const articleData = {
                title: document.getElementById('edit-title').value,
                category: document.getElementById('edit-category').value,
                author: document.getElementById('edit-author').value,
                publishDate: document.getElementById('edit-publish-date').value,
                content: document.getElementById('edit-content').value
            };
            
            // Save changes
            saveArticleChanges(articleId, articleData);
            
            // Close the modal
            if (editorModal) {
                editorModal.style.display = 'none';
            }
        });
    }
}

/**
 * Filter news based on search and filter criteria
 */
function filterNews() {
    // Get filter values
    const categoryFilter = document.getElementById('filter-category').value;
    const authorFilter = document.getElementById('filter-author').value;
    const dateFromFilter = document.getElementById('filter-date-from').value;
    const dateToFilter = document.getElementById('filter-date-to').value;
    
    // Get search value
    const searchInput = document.getElementById('news-search-input');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // Parse dates for comparison
    const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
    const toDate = dateToFilter ? new Date(dateToFilter) : null;
    
    // Apply filters
    filteredNews = allNews.filter(article => {
        // Category filter
        if (categoryFilter && article.category !== categoryFilter) {
            return false;
        }
        
        // Author filter
        if (authorFilter && article.author !== authorFilter) {
            return false;
        }
        
        // Date range filter
        const publishDate = new Date(article.publishDate);
        
        if (fromDate && publishDate < fromDate) {
            return false;
        }
        
        if (toDate) {
            // Set toDate to end of day for inclusive comparison
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            if (publishDate > endOfDay) {
                return false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const searchFields = [
                article.title,
                article.author,
                article.content
            ].filter(Boolean).map(field => field.toLowerCase());
            
            return searchFields.some(field => field.includes(searchTerm));
        }
        
        return true;
    });
    
    // Sort by publish date (newest first)
    filteredNews.sort((a, b) => {
        const dateA = new Date(a.publishDate);
        const dateB = new Date(b.publishDate);
        return dateB - dateA;
    });
    
    // Update pagination
    updatePagination();
    
    // Reset selected news
    selectedNews.clear();
    updateBulkActionButtons();
}

/**
 * Update filter dropdowns with available options from news data
 */
function updateFilterOptions() {
    // Get unique authors
    const authors = [...new Set(allNews
        .map(article => article.author)
        .filter(Boolean))];
    
    // Sort alphabetically
    authors.sort();
    
    // Get the author dropdown
    const authorSelect = document.getElementById('filter-author');
    
    if (authorSelect) {
        // Clear existing options (except the first one)
        while (authorSelect.options.length > 1) {
            authorSelect.remove(1);
        }
        
        // Add author options
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorSelect.appendChild(option);
        });
    }
}

/**
 * Update pagination controls based on filtered news
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE);
    
    // Update page numbers
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    
    if (currentPageElement) {
        currentPageElement.textContent = currentPage.toString();
    }
    
    if (totalPagesElement) {
        totalPagesElement.textContent = totalPages.toString();
    }
    
    // Update button states
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
}

/**
 * Render a page of news articles
 * @param {number} page - Page number
 */
function renderNewsPage(page) {
    // Update current page
    currentPage = page;
    
    // Update pagination controls
    updatePagination();
    
    // Calculate start and end indices
    const startIndex = (page - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    
    // Get news for this page
    const pageNews = filteredNews.slice(startIndex, endIndex);
    
    // Get the news list element
    const newsList = document.getElementById('news-list');
    
    if (!newsList) return;
    
    // Clear existing rows
    newsList.innerHTML = '';
    
    // If no news, show message
    if (pageNews.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="no-results">
                <p>No news articles found</p>
                <button id="reset-filter-btn" class="btn">Reset Filters</button>
            </td>
        `;
        newsList.appendChild(row);
        
        // Add event listener to reset button
        const resetBtn = newsList.querySelector('#reset-filter-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                // Reset filter dropdowns
                document.getElementById('filter-category').value = '';
                document.getElementById('filter-author').value = '';
                document.getElementById('filter-date-from').value = '';
                document.getElementById('filter-date-to').value = '';
                
                // Reset search
                document.getElementById('news-search-input').value = '';
                
                // Reset filters and render
                filterNews();
                renderNewsPage(1);
            });
        }
        
        return;
    }
    
    // Add rows for each news article
    pageNews.forEach(article => {
        const row = document.createElement('tr');
        row.dataset.newsId = article.id;
        
        // Format date for display
        const publishDate = new Date(article.publishDate);
        const formattedDate = publishDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Create table cells
        row.innerHTML = `
            <td>
                <input type="checkbox" class="news-checkbox" value="${article.id}" ${selectedNews.has(article.id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="news-list-item">
                    <span class="news-title">${article.title}</span>
                </div>
            </td>
            <td>${article.category || 'Uncategorized'}</td>
            <td>${article.author || 'Unknown'}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="table-actions">
                    <button class="table-action edit" title="Quick Edit" data-id="${article.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <a href="edit-news.html?id=${article.id}" class="table-action advanced-edit" title="Advanced Edit">
                        <i class="fas fa-pencil-alt"></i>
                    </a>
                    <button class="table-action view" title="View" data-id="${article.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action delete" title="Delete" data-id="${article.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        newsList.appendChild(row);
        
        // Add event listeners to the new checkboxes
        const checkbox = row.querySelector('.news-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const newsId = this.value;
                
                if (this.checked) {
                    selectedNews.add(newsId);
                } else {
                    selectedNews.delete(newsId);
                }
                
                updateBulkActionButtons();
            });
        }
        
        // Add event listeners to action buttons
        const editBtn = row.querySelector('.table-action.edit');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const newsId = this.dataset.id;
                openEditor(newsId);
            });
        }
        
        const viewBtn = row.querySelector('.table-action.view');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const newsId = this.dataset.id;
                viewArticle(newsId);
            });
        }
        
        const deleteBtn = row.querySelector('.table-action.delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const newsId = this.dataset.id;
                openDeleteConfirmation([newsId]);
            });
        }
    });
    
    // Reset the "select all" checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
}

/**
 * Update bulk action buttons based on selection
 */
function updateBulkActionButtons() {
    const bulkDeleteBtn = document.getElementById('bulk-delete');
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = selectedNews.size === 0;
    }
}

/**
 * Open the editor modal for a news article
 * @param {string} newsId - News article ID
 */
function openEditor(newsId) {
    // Get the article
    const article = allNews.find(a => a.id === newsId);
    
    if (!article) return;
    
    // Get modal elements
    const editorModal = document.getElementById('article-editor-modal');
    const titleInput = document.getElementById('edit-title');
    const categorySelect = document.getElementById('edit-category');
    const authorInput = document.getElementById('edit-author');
    const publishDateInput = document.getElementById('edit-publish-date');
    const contentInput = document.getElementById('edit-content');
    const idInput = document.getElementById('edit-article-id');
    
    if (!editorModal || !titleInput || !categorySelect || !authorInput || !publishDateInput || !contentInput || !idInput) {
        return;
    }
    
    // Format date for datetime-local input
    const publishDate = new Date(article.publishDate);
    const formattedDate = publishDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    
    // Set form values
    titleInput.value = article.title;
    categorySelect.value = article.category || '';
    authorInput.value = article.author || '';
    publishDateInput.value = formattedDate;
    contentInput.value = stripHtmlTags(article.content);
    idInput.value = article.id;
    
    // Show the modal
    editorModal.style.display = 'block';
}

/**
 * Save changes to a news article
 * @param {string} newsId - News article ID
 * @param {Object} articleData - Updated article data
 */
function saveArticleChanges(newsId, articleData) {
    try {
        // Find the article in our data
        const articleIndex = allNews.findIndex(article => article.id === newsId);
        
        if (articleIndex === -1) {
            showError('Article not found.');
            return;
        }
        
        // Format content as HTML
        const formattedContent = formatContentAsHtml(articleData.content);
        
        // Update the article in our data
        const updatedArticle = {
            ...allNews[articleIndex],
            title: articleData.title,
            category: articleData.category,
            author: articleData.author,
            publishDate: new Date(articleData.publishDate).toISOString(),
            content: formattedContent
        };
        
        // Update the article in the database
        updateNews(newsId, updatedArticle);
        
        // Update our data
        allNews[articleIndex] = updatedArticle;
        
        // Re-filter and render
        filterNews();
        renderNewsPage(currentPage);
        
        // Log the activity
        logActivity('edit', `News article "${updatedArticle.title}" was updated`);
        
        // Show success message
        showSuccess('News article updated successfully');
    } catch (error) {
        console.error('Error saving article changes:', error);
        showError('Failed to update news article. Please try again.');
    }
}

/**
 * Open the delete confirmation modal
 * @param {string[]} newsIds - Array of news article IDs to delete
 */
function openDeleteConfirmation(newsIds) {
    const modal = document.getElementById('news-action-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const previewTitle = document.getElementById('preview-title');
    const previewAuthor = document.getElementById('preview-author');
    const previewDate = document.getElementById('preview-date');
    const previewImg = document.getElementById('preview-img');
    
    if (!modal || !modalTitle || !modalBody || !confirmDeleteBtn) return;
    
    // Clear existing content
    modalBody.innerHTML = '';
    
    // Set the title based on the number of articles
    if (newsIds.length === 1) {
        // Single article deletion
        const newsId = newsIds[0];
        const article = allNews.find(a => a.id === newsId);
        
        if (!article) return;
        
        // Format date for display
        const publishDate = new Date(article.publishDate);
        const formattedDate = publishDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        modalTitle.textContent = 'Delete News Article';
        modalBody.innerHTML = `
            <p>Are you sure you want to delete this news article? This action cannot be undone.</p>
            <div class="news-preview" id="news-preview">
                <div class="news-preview-img">
                    <img src="../${article.image}" alt="${article.title}" onerror="this.src='../images/news/placeholder.jpg'">
                </div>
                <div class="news-preview-info">
                    <h4>${article.title}</h4>
                    <p class="news-preview-meta">
                        <span>${article.author || 'Unknown'}</span> | 
                        <span>${formattedDate}</span>
                    </p>
                </div>
            </div>
        `;
    } else {
        // Multiple articles deletion
        modalTitle.textContent = 'Delete Multiple News Articles';
        
        let articlesList = '';
        newsIds.forEach(id => {
            const article = allNews.find(a => a.id === id);
            if (article) {
                articlesList += `<li>${article.title}</li>`;
            }
        });
        
        modalBody.innerHTML = `
            <p>Are you sure you want to delete the following news articles? This action cannot be undone.</p>
            <ul class="delete-list">
                ${articlesList}
            </ul>
        `;
    }
    
    // Set the news IDs for the confirm button
    confirmDeleteBtn.dataset.newsIds = newsIds.join(',');
    
    // Show the modal
    modal.style.display = 'block';
}

/**
 * Delete one or more news articles
 * @param {string[]} newsIds - Array of news article IDs to delete
 */
function deleteNewsArticles(newsIds) {
    try {
        // Get the titles of the articles being deleted (for logging)
        const articleTitles = newsIds.map(id => {
            const article = allNews.find(a => a.id === id);
            return article ? article.title : 'Unknown Article';
        });
        
        // Delete each article
        newsIds.forEach(id => {
            deleteNews(id);
            
            // Remove from selectedNews set
            selectedNews.delete(id);
        });
        
        // Update bulk action buttons
        updateBulkActionButtons();
        
        // Refresh the news list
        allNews = allNews.filter(article => !newsIds.includes(article.id));
        filterNews();
        renderNewsPage(1);
        
        // Log the activity
        let activityText;
        if (newsIds.length === 1) {
            activityText = `News article "${articleTitles[0]}" deleted`;
        } else {
            activityText = `${newsIds.length} news articles deleted`;
        }
        
        logActivity('delete', activityText);
        
        // Show success message
        showSuccess(`${newsIds.length} news article(s) deleted successfully`);
    } catch (error) {
        console.error('Error deleting news articles:', error);
        showError('Failed to delete news article(s). Please try again.');
    }
}

/**
 * View a news article (opens article page in a new tab)
 * @param {string} newsId - News article ID
 */
function viewArticle(newsId) {
    const article = allNews.find(a => a.id === newsId);
    
    if (article) {
        window.open(`../news/${article.slug}.html`, '_blank');
    }
}

/**
 * Strip HTML tags from a string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
function stripHtmlTags(html) {
    if (!html) return '';
    
    // Create a temporary div
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get text content
    return temp.textContent || temp.innerText || '';
}

/**
 * Format content as HTML
 * @param {string} content - Plain text content
 * @returns {string} Formatted HTML
 */
function formatContentAsHtml(content) {
    if (!content) return '';
    
    // Split by double newlines to create paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    // Process each paragraph
    const htmlParagraphs = paragraphs.map(paragraph => {
        // Replace single newlines with <br>
        const withLineBreaks = paragraph.replace(/\n/g, '<br>');
        
        return `<p>${withLineBreaks}</p>`;
    });
    
    return htmlParagraphs.join('\n');
}

/**
 * Show a success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    // Create a success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>${message}</p>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to the page
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.close-notification');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * Show an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Create an error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to the page
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.close-notification');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
