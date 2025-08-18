import {
    deleteUserData
} from './indexedDb.js';

// DOM Elements
const postFeed = document.getElementById('postFeed');
const profileUsername = document.getElementById('profileUsername');
const suggestedUsers = document.getElementById('suggestedUsers');

// Sample posts data
const posts = [
    {
        id: 1,
        userId: 1,
        username: "APU_Official",
        avatar: "../image/AsiaPacificUniversityOfTechnologyInnovation.webp",
        content: "The Government had earlier this week issued announcements regarding the new academic calendar. Please check your student portal for updates.",
        image: "../image/announcement.jpeg",
        file: "announcement.pdf",
        timestamp: "2 hours ago",
        likes: 42,
        comments: [
            { userId: 2, username: "JohnDoe", comment: "Thanks for sharing!" },
            { userId: 3, username: "JaneSmith", comment: "Very helpful information!" }
        ],
        liked: false,
        bookmarked: false
    },
    {
        id: 2,
        userId: 4,
        username: "CampusEvents",
        avatar: "../image/event_avatar.jpg",
        content: "Join us for the annual tech fest starting next Monday! Workshops, competitions, and networking opportunities await.",
        image: "../image/tech_fest.jpg",
        timestamp: "5 hours ago",
        likes: 87,
        comments: [
            { userId: 5, username: "TechEnthusiast", comment: "Can't wait for the AI workshop!" }
        ],
        liked: true,
        bookmarked: false
    }
];

// Sample user data
const users = [
    { id: 1, username: "APU_Official", name: "APU Admin", email: "admin@apu.edu.my" },
    { id: 2, username: "JohnDoe", name: "John Doe", email: "john@student.apu.edu.my" },
    { id: 3, username: "JaneSmith", name: "Jane Smith", email: "jane@student.apu.edu.my" },
    { id: 4, username: "CampusEvents", name: "Events Team", email: "events@apu.edu.my" },
    { id: 5, username: "TechEnthusiast", name: "Alex Chen", email: "alex@student.apu.edu.my" }
];

// Render posts
function renderPosts() {
    postFeed.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.dataset.postId = post.id;

        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.username}" class="post-avatar">
                <div>
                    <span class="post-user">${post.username}</span>
                    <span class="post-time">${post.timestamp}</span>
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
                <a href="#" class="file-download">${post.file}</a>
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

// Render suggested users
export function renderSuggestedUsers() {
    suggestedUsers.innerHTML = '';

    // Get 3 random users (excluding current user)
    const suggested = users
        .filter(user => user.username !== profileUsername.textContent)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    suggested.forEach(user => {
        const userElement = document.createElement('li');
        userElement.innerHTML = `
            ${user.username} 
            <button class="follow-btn">Follow</button>
        `;

        suggestedUsers.appendChild(userElement);
    });

    // Add follow button event listeners
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent === 'Follow') {
                this.textContent = 'Following';
                this.classList.add('following');
            } else {
                this.textContent = 'Follow';
                this.classList.remove('following');
            }
        });
    });
}

// Toggle like on post
export function toggleLike(e) {
    const btn = e.currentTarget;
    const postId = parseInt(btn.dataset.postId);
    const post = posts.find(p => p.id === postId);

    if (post) {
        post.liked = !post.liked;
        post.likes = post.liked ? post.likes + 1 : post.likes - 1;

        const icon = btn.querySelector('i');
        const count = btn.querySelector('span');

        icon.className = post.liked ? 'bx bxs-heart' : 'bx bx-heart';
        count.textContent = post.likes;

        btn.classList.toggle('liked', post.liked);
    }
}

// Toggle bookmark on the post
function toggleBookmark(e) {
    const btn = e.currentTarget;
    const postId = parseInt(btn.dataset.postId);
    const post = posts.find(p => p.id === postId);

    if (post) {
        post.bookmarked = !post.bookmarked;
        post.bookmarks = post.bookmarked ? post.bookmarks + 1 : post.bookmarks - 1;

        const icon = btn.querySelector('i');

        icon.className = post.bookmarked ? 'bx bxs-bookmark' : 'bx bx-bookmark';

        btn.classList.toggle('bookmarked', post.bookmarked);
    }
}

// Add comment to post
export function addComment(e) {
    const btn = e.currentTarget;
    const commentBox = btn.previousElementSibling;
    const commentText = commentBox.value.trim();

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
            <img src="../image/default_avatar.jpg" alt="${newComment.username}" class="comment-avatar">
            <div class="comment-content">
                <span class="comment-user">${newComment.username}</span>
                <p class="comment-text">${newComment.comment}</p>
            </div>
        `;

        commentsContainer.appendChild(commentElement);

        // Update comment count
        const commentBtn = postCard.querySelector('.comment-btn');
        const count = commentBtn.querySelector('span');
        count.textContent = post.comments.length;

        // Clear input
        commentBox.value = '';
    }
}

// Logout function
async function logout() {
    if (confirm("Are you sure you want to log out?")) {
        try {
            // Clear the current user in IndexedDB
            await deleteUserData('currentUserIndex');

            // Clear local storage
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("currentUser");

            // Redirect to login page
            window.location.href = "register_login.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout. Please try again.");
        }
    }
}

// Initialize page
async function init() {
    await loadCurrentUser();
    renderPosts();
    renderSuggestedUsers();

    // Make logout function available globally
    window.logout = logout;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Load current user
export async function loadCurrentUser() {
    try {
        const profileUsername = document.querySelector('#profileUsername');
        const profileEmail = document.querySelector('#profileEmail');
        const currentUserData = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");

        if (currentUserData && currentUserData.length > 0) {
            const currentUser = currentUserData[0].currentUser;

            if (currentUser) {
                const userData = await getMatchingDataByIndex(
                    "userDB",
                    "userObjectStore",
                    "usernameIndex",
                    currentUser
                );

                if (userData) {
                    profileUsername.textContent = userData.name || currentUser;
                    profileEmail.textContent = userData.email;
                }
            }
        }
    } catch (error) {
        console.error("Error loading current user:", error);
    }
}