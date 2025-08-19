import {fetchPostsFromDB, loadCurrentUser, renderSuggestedUsers, toggleLike} from "./general.js";
import {openDb, updateBookmark, updateComment} from "./indexedDb.js";

// DOM Elements
const bookmarksFeed = document.getElementById('bookmarksFeed');
const onlineUsers = document.getElementById('onlineUsers');
const totalPosts = document.getElementById('totalPosts');
const totalMembers = document.getElementById('totalMembers');

// Global bookmarked posts array
let bookmarkedPosts = [];

// Format timestamp to relative time
function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = now - postTime;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Fetch bookmarked posts from IndexedDB
async function fetchBookmarkedPosts() {
    try {
        const db = await openDb();
        const tx = db.transaction('postObjectStore', 'readonly');
        const store = tx.objectStore('postObjectStore');

        // Get all posts
        const allPosts = await store.getAll();

        // Filter bookmarked posts
        return allPosts.filter(post => post.bookmarked === true);
    } catch (error) {
        console.error('Error fetching bookmarked posts from DB:', error);
        return [];
    }
}

// Render bookmarked posts
async function renderBookmarks() {
    // Show loading spinner
    const bookmarksFeed = document.getElementById('bookmarksFeed');
    bookmarksFeed.innerHTML = `
        <div class="loading-spinner">
            <i class='bx bx-loader-circle bx-spin'></i>
            <p>Loading bookmarks...</p>
        </div>
    `;

    // Get bookmarked posts from IndexedDB
    bookmarkedPosts = await fetchBookmarkedPosts();

    // Clear loading spinner
    bookmarksFeed.innerHTML = '';

    if (bookmarkedPosts.length === 0) {
        bookmarksFeed.innerHTML = `
            <div class="no-bookmarks">
                <i class='bx bx-bookmark'></i>
                <h3>No bookmarks yet</h3>
                <p>Save interesting posts to see them here</p>
            </div>
        `;
        return;
    }

    // Update post count
    totalPosts.textContent = bookmarkedPosts.length.toString();

    bookmarkedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.dataset.postId = post.id;

        // Ensure post has required properties
        post.liked = post.liked || false;
        post.bookmarked = post.bookmarked || false;
        post.likes = post.likes || 0;
        post.comments = post.comments || [];

        postElement.innerHTML = `
            <div class="bookmark-badge active" data-post-id="${post.id}">
                <i class='bx bxs-bookmark'></i>
            </div>
            
            <div class="post-header">
                <img src="${post.avatar || '../image/default_avatar.jpg'}" alt="${post.username}" class="post-avatar">
                <div>
                    <span class="post-user">${post.username}</span>
                    <span class="post-time">${formatTime(post.timestamp)}</span>
                </div>
                <span class="post-category">#${post.category || 'General'}</span>
            </div>
            
            <div class="post-content">
                <p class="post-text">${post.content}</p>
                
                ${post.image ? `
                <div class="post-img">
                    <img src="${post.image}" alt="Post image">
                </div>
                ` : ''}
                
                ${post.file ? `
                <a href="${post.file}" class="file-download" download>
                    <i class='bx bx-file'></i> ${post.fileName || 'Download file'}
                </a>
                ` : ''}
            </div>
            
            <div class="post-actions">
                <div class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                    <i class='bx ${post.liked ? 'bxs-heart' : 'bx-heart'}'></i>
                    <span>${post.likes}</span>
                </div>
                <div class="action-btn comment-btn">
                    <i class='bx bx-comment'></i>
                    <span>${post.comments.length}</span>
                </div>
                <div class="action-btn bookmark-btn ${post.bookmarked ? 'bookmarked' : ''}" data-post-id="${post.id}">
                    <i class='bx ${post.bookmarked ? 'bxs-bookmark' : 'bx-bookmark'}'></i>
                    <span></span>
                </div>
            </div>
            
            <div class="comments-container">
                ${post.comments.map(comment => `
                <div class="comment">
                    <img src="../image/default_avatar.jpg" alt="${post.username}" class="comment-avatar">
                    <div class="comment-content">
                        <span class="comment-user">${post.username}</span>
                        <p class="comment-text">${comment}</p>
                    </div>
                </div>
                `).join('')}
            </div>
            
            <div class="comment-box">
                <input type="text" class="comment-input" placeholder="Add a comment...">
                <button class="submit-comment">Post</button>
            </div>
        `;

        bookmarksFeed.appendChild(postElement);
    });

    // Add event listeners
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', toggleLike);
    });

    document.querySelectorAll('.submit-comment').forEach(btn => {
        btn.addEventListener('click', addComment);
    });

    document.querySelectorAll('.bookmark-badge').forEach(badge => {
        badge.addEventListener('click', toggleBookmark);
    });

    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', toggleBookmark);
    });
}

// Add comment to post
async function addComment(e) {
    const btn = e.currentTarget;
    const commentBox = btn.previousElementSibling;
    const commentText = commentBox.value.trim();
    const posts = await fetchPostsFromDB();
    const profileUsername = document.getElementById('profileUsername');

    if (!commentText) return;

    const postCard = btn.closest('.post-card');
    const postId = parseInt(postCard.dataset.postId);
    const post = posts.find(p => p.id === postId);

    if (post) {
        // Add new comment
        const newComment = {
            userId: 0, // Current user
            username: profileUsername.textContent,
            comment: commentText
        };

        post.comments.push(newComment);

        // Update comments container
        const commentsContainer = postCard.querySelector('.comments-container');
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <img src="../image/default_avatar.jpg" alt="${post.username}" class="comment-avatar">
            <div class="comment-content">
                <span class="comment-user">${post.username}</span>
                <p class="comment-text">${commentText}</p>
            </div>
        `;

        commentsContainer.appendChild(commentElement);

        // Update comment count
        const commentBtn = postCard.querySelector('.comment-btn');
        const count = commentBtn.querySelector('span');
        count.textContent = post.comments.length;

        // Clear input
        commentBox.value = '';

        updateComment(postId, commentText);
    }
}


// Toggle bookmark
export async function toggleBookmark(e) {
    const btn = e.currentTarget;
    const postId = parseInt(btn.dataset.postId);
    const post = bookmarkedPosts.find(p => p.id === postId);

    if (post) {
        post.bookmarked = !post.bookmarked;

        // Update UI
        if (post.bookmarked) {
            if (btn.classList.contains('bookmark-badge')) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="bx bxs-bookmark"></i>';
            } else {
                btn.classList.add('bookmarked');
                const icon = btn.querySelector('i');
                icon.className = 'bx bxs-bookmark';
            }
        } else {
            // Remove from bookmarks view
            const postElement = btn.closest('.post-card');
            if (postElement) {
                postElement.remove();
            }

            // Update UI for bookmark button
            if (btn.classList.contains('bookmark-badge')) {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="bx bx-bookmark"></i>';
            } else {
                btn.classList.remove('bookmarked');
                const icon = btn.querySelector('i');
                icon.className = 'bx bx-bookmark';
            }

            // Show no bookmarks message if empty
            if (document.querySelectorAll('.post-card').length === 0) {
                bookmarksFeed.innerHTML = `
                    <div class="no-bookmarks">
                        <i class='bx bx-bookmark'></i>
                        <h3>No bookmarks yet</h3>
                        <p>Save interesting posts to see them here</p>
                    </div>
                `;
            }
        }

        // Update in IndexedDB
        await updateBookmark(postId, post.bookmarked);
    }
}

// Initialize page
async function init() {
    await loadCurrentUser();
    await renderBookmarks();
    await renderSuggestedUsers();

    // Simulate updating online users
    setInterval(() => {
        const randomChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const current = parseInt(onlineUsers.textContent);
        onlineUsers.textContent = Math.max(1, current + randomChange).toString();
    }, 10000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);