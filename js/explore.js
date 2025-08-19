import {
    addComment,
    loadCurrentUser,
    renderSuggestedUsers,
    toggleLike
} from "./general.js";
import { openDb } from "./indexedDb.js";

// DOM Elements
const exploreFeed = document.getElementById('exploreFeed');
const refreshButton = document.getElementById('refreshButton');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const suggestedUsers = document.getElementById('suggestedUsers');

// Global posts array
let allPosts = [];

// Fetch all posts from IndexedDB
async function fetchAllPostsFromDB() {
    try {
        const db = await openDb();
        const tx = db.transaction('postObjectStore', 'readonly');
        const store = tx.objectStore('postObjectStore');

        // Get all posts
        return await store.getAll();
    } catch (error) {
        console.error('Error fetching posts from DB:', error);
        return [];
    }
}

// Get random posts (max 3)
function getRandomPosts(posts, count = 3) {
    if (posts.length <= count) return [...posts];

    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

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

// Render random posts
async function renderRandomPosts() {
    // Show loading spinner
    exploreFeed.innerHTML = `
        <div class="loading-spinner">
            <i class='bx bx-loader-circle bx-spin'></i>
            <p>Loading posts...</p>
        </div>
    `;

    // Get random posts
    const randomPosts = getRandomPosts(allPosts, 3);

    // Clear loading spinner
    exploreFeed.innerHTML = '';

    if (randomPosts.length === 0) {
        exploreFeed.innerHTML = `
            <div class="no-posts">
                <i class='bx bx-message-rounded'></i>
                <h3>No posts available</h3>
                <p>Be the first to create a post in any category</p>
                <a href="../html/post.html" class="btn" style="margin-top: 1rem;">Create a post</a>
            </div>
        `;
        return;
    }

    randomPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.dataset.postId = post.id;

        // Ensure post has required properties
        post.liked = post.liked || false;
        post.bookmarked = post.bookmarked || false;
        post.likes = post.likes || 0;
        post.comments = post.comments || [];

        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar || '../image/default_avatar.jpg'}" alt="${post.username}" class="post-avatar">
                <div>
                    <span class="post-user">@${post.username}</span>
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

        exploreFeed.appendChild(postElement);
    });

    // Add event listeners
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', toggleLike);
    });

    document.querySelectorAll('.submit-comment').forEach(btn => {
        btn.addEventListener('click', addComment);
    });

    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', toggleBookmark);
    });
}

// Toggle bookmark on the post
function toggleBookmark(e) {
    const btn = e.currentTarget;
    const postId = parseInt(btn.dataset.postId);
    const post = allPosts.find(p => p.id === postId);

    if (post) {
        post.bookmarked = !post.bookmarked;
        post.bookmarks = post.bookmarked ? (post.bookmarks || 0) + 1 : (post.bookmarks || 1) - 1;

        const icon = btn.querySelector('i');
        icon.className = post.bookmarked ? 'bx bxs-bookmark' : 'bx bx-bookmark';

        btn.classList.toggle('bookmarked', post.bookmarked);

        // Update in IndexedDB
        updatePostInDB(post);
    }
}

// Update post in IndexedDB
async function updatePostInDB(updatedPost) {
    try {
        const db = await openDb();
        const tx = db.transaction('postObjectStore', 'readwrite');
        const store = tx.objectStore('postObjectStore');

        await store.put(updatedPost);
        await tx.done;

        console.log('Post updated in DB');
    } catch (error) {
        console.error('Error updating post in DB:', error);
    }
}

// Initialize page
async function init() {
    await loadCurrentUser();

    // Load all posts from IndexedDB
    allPosts = await fetchAllPostsFromDB();

    // Render initial random posts
    await renderRandomPosts();

    // Render suggested users
    await renderSuggestedUsers();

    // Add event listener for refresh button
    refreshButton.addEventListener('click', renderRandomPosts);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);