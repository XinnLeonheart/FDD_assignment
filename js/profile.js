// profile.js
import {
    loadCurrentUser,
    renderSuggestedUsers,
    toggleLike,
    addComment,
    toggleBookmark
} from "./general.js";
import {
    openDb,
    getMatchingDataByIndex,
    getDataByIndex,
    updateUserPrivateData
} from "./indexedDb.js";

// DOM Elements
const profileDisplayName = document.getElementById('profileDisplayName');
const profileDisplayUsername = document.getElementById('profileDisplayUsername');
const profileBio = document.getElementById('profileBio');
const postCount = document.getElementById('postCount');
const followerCount = document.getElementById('followerCount');
const followingCount = document.getElementById('followingCount');
const aboutEmail = document.getElementById('aboutEmail');
const joinDate = document.getElementById('joinDate');
const locationItem = document.getElementById('locationItem');
const locationText = document.getElementById('locationText');
const websiteItem = document.getElementById('websiteItem');
const websiteLink = document.getElementById('websiteLink');
const userPosts = document.getElementById('userPosts');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeModal = document.getElementById('closeModal');
const cancelEdit = document.getElementById('cancelEdit');
const editProfileForm = document.getElementById('editProfileForm');
const editName = document.getElementById('editName');
const editUsername = document.getElementById('editUsername');
const editBio = document.getElementById('editBio');
const editLocation = document.getElementById('editLocation');
const editWebsite = document.getElementById('editWebsite');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Global variables
let currentUser = null;
let userPostsData = [];

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

// Format date for join date
function formatJoinDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Load user profile data
async function loadUserProfile() {
    try {
        // Get current username
        const currentUserData = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");

        if (currentUserData && currentUserData.length > 0) {
            const username = currentUserData[0].currentUser;

            if (username) {
                // Get user data from IndexedDB
                const userData = await getMatchingDataByIndex(
                    "userDB",
                    "userObjectStore",
                    "usernameIndex",
                    username
                );

                if (userData) {
                    currentUser = userData;

                    // Update profile display
                    profileDisplayName.textContent = userData.name || userData.username;
                    profileDisplayUsername.textContent = `@${userData.username}`;
                    profileBio.textContent = userData.bio || "This user hasn't added a bio yet.";

                    // Update about section
                    aboutEmail.textContent = userData.email;
                    joinDate.textContent = formatJoinDate(userData.time || Date.now());

                    if (userData.location) {
                        locationItem.style.display = 'flex';
                        locationText.textContent = userData.location;
                    }

                    if (userData.website) {
                        websiteItem.style.display = 'flex';
                        websiteLink.href = userData.website;
                        websiteLink.textContent = userData.website;
                    }

                    // Load user's posts
                    await loadUserPosts(userData.username);
                }
            }
        }
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

// Load user's posts from IndexedDB
async function loadUserPosts(username) {
    try {
        const db = await openDb();
        const tx = db.transaction('postObjectStore', 'readonly');
        const store = tx.objectStore('postObjectStore');
        const allPosts = await store.getAll();

        // Filter posts by username
        userPostsData = allPosts.filter(post => post.username === username);

        // Update post count
        postCount.textContent = userPostsData.length.toString();

        // Render posts
        renderUserPosts();
    } catch (error) {
        console.error("Error loading user posts:", error);
    }
}

// Render user's posts
function renderUserPosts() {
    if (userPostsData.length === 0) {
        userPosts.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-message-rounded'></i>
                <h3>No posts yet</h3>
                <p>This user hasn't posted anything yet</p>
            </div>
        `;
        return;
    }

    userPosts.innerHTML = '';

    userPostsData.forEach(post => {
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

        userPosts.appendChild(postElement);
    });

    // Add event listeners to interactive elements
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

// Open edit profile modal
function openEditProfileModal() {
    if (currentUser) {
        editName.value = currentUser.name || '';
        editUsername.value = currentUser.username;
        editBio.value = currentUser.bio || '';
        editLocation.value = currentUser.location || '';
        editWebsite.value = currentUser.website || '';

        editProfileModal.style.display = 'flex';
    }
}

// Close edit profile modal
function closeEditProfileModal() {
    editProfileModal.style.display = 'none';
}

// Save profile changes
async function saveProfileChanges(e) {
    e.preventDefault();

    try {
        const updatedData = {
            name: editName.value.trim(),
            bio: editBio.value.trim(),
            location: editLocation.value.trim(),
            website: editWebsite.value.trim()
        };

        // Update user data in IndexedDB
        await updateUserPrivateData(
            currentUser.username,
            updatedData.name,
            currentUser.gender || '',
            currentUser.email,
            currentUser.address || '',
            currentUser.phone || '',
            currentUser.major || '',
            currentUser.enrollment || '',
            updatedData.bio,
            updatedData.website
        );

        // Update current user object
        currentUser = { ...currentUser, ...updatedData };

        // Update UI
        profileDisplayName.textContent = updatedData.name || currentUser.username;
        profileBio.textContent = updatedData.bio || "This user hasn't added a bio yet.";

        if (updatedData.location) {
            locationItem.style.display = 'flex';
            locationText.textContent = updatedData.location;
        } else {
            locationItem.style.display = 'none';
        }

        if (updatedData.website) {
            websiteItem.style.display = 'flex';
            websiteLink.href = updatedData.website;
            websiteLink.textContent = updatedData.website;
        } else {
            websiteItem.style.display = 'none';
        }

        // Close modal
        closeEditProfileModal();

        alert('Profile updated successfully!');
    } catch (error) {
        console.error("Error updating profile:", error);
        alert('Failed to update profile. Please try again.');
    }
}

// Switch tabs
function switchTab(e) {
    const tabId = e.target.dataset.tab;

    // Update active tab
    tabBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // Show corresponding content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}Tab`) {
            content.classList.add('active');
        }
    });
}

// Initialize page
async function init() {
    await loadCurrentUser();
    await loadUserProfile();
    await renderSuggestedUsers();

    // Add event listeners
    editProfileBtn.addEventListener('click', openEditProfileModal);
    closeModal.addEventListener('click', closeEditProfileModal);
    cancelEdit.addEventListener('click', closeEditProfileModal);
    editProfileForm.addEventListener('submit', saveProfileChanges);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Close modal when clicking outside
    editProfileModal.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            closeEditProfileModal();
        }
    });

    // Simulate updating online users
    const onlineUsersEl = document.getElementById('onlineUsers');
    setInterval(() => {
        const randomChange = Math.floor(Math.random() * 3) - 1;
        const current = parseInt(onlineUsersEl.textContent);
        onlineUsersEl.textContent = Math.max(1, current + randomChange).toString();
    }, 10000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);