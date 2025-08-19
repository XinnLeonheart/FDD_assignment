// sport.js
import {
    addComment,
    loadCurrentUser,
    renderSuggestedUsers,
    toggleLike
} from "./general.js";
import { openDb } from "./indexedDb.js";

// DOM Elements
const onlineUsers = document.getElementById('onlineUsers');
const totalPosts = document.getElementById('totalPosts');
const totalMembers = document.getElementById('totalMembers');

// Global posts array
let posts = [];

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

// Fetch posts from IndexedDB for Art category
async function fetchPostsFromDB() {
    try {
        const db = await openDb();
        const tx = db.transaction('postObjectStore', 'readonly');
        const store = tx.objectStore('postObjectStore');
        const categoryIndex = store.index('categoryIndex');

        // Get posts for the art category
        return await categoryIndex.getAll('culture');
    } catch (error) {
        console.error('Error fetching posts from DB:', error);
        return [];
    }
}

// Sort posts based on selected option
function sortPosts(posts, sortBy) {
    const safePosts = Array.isArray(posts) ? [...posts] : [];
    const parseTime = (t) => {
        const d = new Date(t);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    const likeCount = (p) => {
        if (p == null) return 0;
        const l = p.likes;
        if (Array.isArray(l)) return l.length;
        if (typeof l === 'number') return l;
        const lc = p.likesCount;
        return typeof lc === 'number' ? lc : 0;
    };
    switch (sortBy) {
        case 'newest':
            return safePosts.sort((a, b) => parseTime(b.timestamp) - parseTime(a.timestamp));
        case 'oldest':
            return safePosts.sort((a, b) => parseTime(a.timestamp) - parseTime(b.timestamp));
        case 'most-liked':
            return safePosts.sort((a, b) => likeCount(b) - likeCount(a));
        default:
            return safePosts;
    }
}

// Render posts from IndexedDB
async function renderPosts() {
    // Show loading spinner
    const loadingSpinner = document.querySelector('.loading-spinner');
    const postFeed = document.getElementById('postFeed');
    if (loadingSpinner) loadingSpinner.style.display = 'block';

    // Clear previous posts (keep spinner if present)
    const emptyStateEl = postFeed.querySelector('.empty-state');
    if (emptyStateEl) emptyStateEl.remove();
    postFeed.querySelectorAll('.post-card').forEach(el => el.remove());

    // Get posts from IndexedDB
    posts = await fetchPostsFromDB();

    // Sort posts
    const sortOption = document.getElementById('sortOption');
    const sortedPosts = sortPosts(posts, sortOption.value);

    // Hide loading spinner
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    if (sortedPosts.length === 0) {
        postFeed.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-palette'></i>
                <h3>No art posts yet</h3>
                <p>Be the first to share something in the Culture category</p>
                <a href="../html/post.html" class="btn" style="margin-top: 1rem;">Create a post</a>
            </div>
        `;
        return;
    }

    // Update post count
    totalPosts.textContent = sortedPosts.length;

    sortedPosts.forEach(post => {
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
                    <span class="post-user">${post.username}</span>
                    <span class="post-time">${formatTime(post.timestamp)}</span>
                </div>
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
                    <img src="../image/default_avatar.jpg" alt="${comment.username}" class="comment-avatar">
                    <div class="comment-content">
                        <span class="comment-user">${comment.username}</span>
                        <p class="comment-text">${comment.comment}</p>
                    </div>
                </div>
                `).join('')}
            </div>
            
            <div class="comment-box">
                <input type="text" class="comment-input" placeholder="Add a comment...">
                <button class="submit-comment">Post</button>
            </div>
        `;

        postFeed.appendChild(postElement);
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
    const post = posts.find(p => p.id === postId);

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
    const sortOption = document.getElementById('sortOption');

    await loadCurrentUser();
    await renderPosts();
    await renderSuggestedUsers();

    // Add event listener for sort option change
    sortOption.addEventListener('change', () => {
        renderPosts();
    });

    // Simulate updating online users (would come from server in real app)
    setInterval(() => {
        const randomChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const current = parseInt(onlineUsers.textContent);
        onlineUsers.textContent = Math.max(1, current + randomChange).toString();
    }, 10000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);