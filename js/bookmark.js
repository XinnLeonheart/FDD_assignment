import {addComment, loadCurrentUser, renderSuggestedUsers, toggleLike} from "./general.js";

// DOM Elements
const bookmarksFeed = document.getElementById('bookmarksFeed');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
document.getElementById('suggestedUsers');
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
        bookmarked: true
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
        bookmarked: true
    },
    {
        id: 3,
        userId: 3,
        username: "JaneSmith",
        avatar: "../image/default_avatar.jpg",
        content: "Looking for study partners for Advanced Algorithms course. We meet every Wednesday at the library.",
        timestamp: "1 day ago",
        likes: 24,
        comments: [
            { userId: 2, username: "JohnDoe", comment: "I'm interested!" },
            { userId: 5, username: "TechEnthusiast", comment: "Count me in!" }
        ],
        liked: false,
        bookmarked: true
    }
];

// Render bookmarked posts
function renderBookmarks() {
    bookmarksFeed.innerHTML = '';

    // Filter bookmarked posts
    const bookmarkedPosts = posts.filter(post => post.bookmarked);

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

    bookmarkedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.dataset.postId = post.id;

        postElement.innerHTML = `
            <div class="bookmark-badge active" data-post-id="${post.id}">
                <i class='bx bxs-bookmark'></i>
            </div>
            
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
}

// Render suggested users
// function renderSuggestedUsers() {
//     suggestedUsers.innerHTML = '';
//
//     // Get 3 random users (excluding current user)
//     const suggested = users
//         .filter(user => user.username !== profileUsername.textContent)
//         .sort(() => 0.5 - Math.random())
//         .slice(0, 3);
//
//     suggested.forEach(user => {
//         const userElement = document.createElement('li');
//         userElement.innerHTML = `
//             ${user.username}
//             <button class="follow-btn">Follow</button>
//         `;
//
//         suggestedUsers.appendChild(userElement);
//     });
//
//     // Add follow button event listeners
//     document.querySelectorAll('.follow-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//             if (this.textContent === 'Follow') {
//                 this.textContent = 'Following';
//                 this.classList.add('following');
//             } else {
//                 this.textContent = 'Follow';
//                 this.classList.remove('following');
//             }
//         });
//     });
// }

// Toggle bookmark
function toggleBookmark(e) {
    const badge = e.currentTarget;
    const postId = parseInt(badge.dataset.postId);
    const post = posts.find(p => p.id === postId);

    if (post) {
        post.bookmarked = !post.bookmarked;

        if (!post.bookmarked) {
            // Remove from bookmarks view
            const postElement = badge.closest('.post-card');
            postElement.remove();

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
    }
}

// Initialize page
async function init() {
    await loadCurrentUser();
    renderBookmarks();
    renderSuggestedUsers();

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);