// [file name]: post.js
import {
    getDataByIndex,
    getMatchingDataByIndex,
    openDb
} from './indexedDb.js';

// DOM Elements
const postForm = document.getElementById('postForm');
const postCategory = document.getElementById('postCategory');
const postContent = document.getElementById('postContent');
const postImage = document.getElementById('postImage');
const postFile = document.getElementById('postFile');
const imageFileName = document.getElementById('imageFileName');
const fileFileName = document.getElementById('fileFileName');
const profileUsername = document.getElementById('profileUsername');

// Current user data
let currentUser = null;

// File change handlers
postImage.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        imageFileName.textContent = e.target.files[0].name;
    } else {
        imageFileName.textContent = 'No file selected';
    }
});

postFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileFileName.textContent = e.target.files[0].name;
    } else {
        fileFileName.textContent = 'No file selected';
    }
});

// Load current user
async function loadCurrentUser() {
    try {
        const currentUserData = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");

        if (currentUserData && currentUserData.length > 0) {
            const currentUsername = currentUserData[0].currentUser;

            if (currentUsername) {
                const userData = await getMatchingDataByIndex(
                    "userDB",
                    "userObjectStore",
                    "usernameIndex",
                    currentUsername
                );

                if (userData) {
                    currentUser = userData;
                    profileUsername.textContent = userData.name || currentUsername;
                }
            }
        }
    } catch (error) {
        console.error("Error loading current user:", error);
    }
}

// Create post
async function createPost(postData) {
    try {
        const db = await openDb();
        const tx = db.transaction('postObjectStore', 'readwrite');
        const store = tx.objectStore('postObjectStore');

        // Add the new post
        await store.add(postData);
        await tx.done;

        console.log('Post created successfully:', postData);
        return true;
    } catch (error) {
        console.error('Error creating post:', error);
        return false;
    }
}

// Helper: read a File as Data URL (base64)
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

// Handle form submission
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('Please log in to create a post');
        return;
    }

    // Create a post-object
    const newPost = {
        userId: currentUser.id || Date.now(), // Use existing ID or generate a new one
        username: currentUser.username,
        avatar: currentUser.avatar || "../image/default_avatar.jpg",
        content: postContent.value,
        category: postCategory.value,
        image: null,
        file: null,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        liked: false,
        bookmarked: false
    };

    // Handle image file
    if (postImage.files.length > 0) {
        const imageFile = postImage.files[0];
        try {
            newPost.image = await readFileAsDataURL(imageFile);
            newPost.imageName = imageFile.name;
            newPost.imageType = imageFile.type;
        } catch (err) {
            console.error('Failed to read image file:', err);
        }
    }

    // Handle file attachment
    if (postFile.files.length > 0) {
        const file = postFile.files[0];
        try {
            newPost.file = await readFileAsDataURL(file);
            newPost.fileName = file.name;
            newPost.fileType = file.type;
        } catch (err) {
            console.error('Failed to read attachment file:', err);
        }
    }

    // Save to IndexedDB
    const success = await createPost(newPost);

    if (success) {
        // Show a success message
        showSuccessMessage("Post created successfully!");

        // Redirect after delay
        setTimeout(() => {
            window.location.href = `${postCategory.value}.html`;
        }, 1500);
    } else {
        alert('Failed to create post. Please try again.');
    }
});

// Show a success message
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class='bx bx-check-circle'></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}


// Initialize page
async function init() {
    await loadCurrentUser();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);