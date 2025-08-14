

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.getElementById('postFeed');
  const currentCategory = document.body.dataset.category;

  // Get current user
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = 'register_login.html'; // force login
    return;
  }


  // Save the last visited page for this user
  localStorage.setItem(`lastVisitedPage_${currentUser}`, window.location.pathname);


  // Default posts for new users
  const defaultPosts = [
    {
      id: "1",
      user: "Asia Pacific University",
      category: "news",
      text: "Welcome to the new semester!",
      imageURL: "image/sample1.jpg",
      pdfURL: "",
      pdfName: "",
      liked: false,
      comments: [
        { user: "John", text: "Excited!" },
        { user: "Mary", text: "Can't wait!" }
      ]
    },
    {
      id: "2",
      user: "Student Council",
      category: "events",
      text: "Join us for the annual sports day!",
      imageURL: "",
      pdfURL: "files/sports-day.pdf",
      pdfName: "Sports Day Info.pdf",
      liked: false,
      comments: []
    }
  ];


  // Load posts for this user
  let posts = JSON.parse(localStorage.getItem(`posts_${currentUser}`)) || defaultPosts;


  // Render-only posts in the current category
  posts.forEach(post => {
    if (post.category === currentCategory) {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.dataset.postId = post.id;

      card.innerHTML = `
        <div class="post-body">
          <div class="post-img">
            ${post.imageURL ? `<img src="${post.imageURL}" alt="Post Image">` : ''}
          </div>
          <div class="post-content">
            <h4>${post.user} ${post.user === "Asia Pacific University" ? '<span class="badge">· official</span>' : ''}</h4>
            <p>${post.text}</p>
            ${post.pdfURL ? `<a class="file-download" href="${post.pdfURL}" download="${post.pdfName}">📎 ${post.pdfName}</a>` : ''}
            <div class="post-actions">
              <box-icon name="heart" class="like-icon" type="${post.liked ? 'solid' : 'regular'}" color="${post.liked ? 'red' : '#333'}"></box-icon>
              <box-icon name="comment" class="comment-icon" type="regular" color="#333"></box-icon>
              <box-icon name="share" class="share-icon" type="regular" color="#333"></box-icon>
            </div>
            <div class="comments-container">
              ${post.comments.map(c => `<div class="comment"><strong>${c.user}</strong> ${c.text}</div>`).join('')}
            </div>
          </div>
        </div>
        <div class="comment-box" style="display: none;">
          <input type="text" class="comment-input" placeholder="Add a comment...">
          <button class="submit-comment" >Post</button>
        </div>
      `;
      postFeed.appendChild(card);
    }
  });

  enableImageModalPreview();
  setupPostInteractions(posts, currentUser);
});


// Image modal
function enableImageModalPreview() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.querySelector(".close-modal");

  document.querySelectorAll(".post-img img").forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      modalImg.src = this.src;
      modal.style.display = "block";
    });
  });

  closeBtn.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}


// Post interactions
function setupPostInteractions(posts, currentUser) {
  // Likes with persistence
  document.querySelectorAll('.like-icon').forEach((icon) => {
    icon.addEventListener('click', () => {
      const postCard = icon.closest('.post-card');
      const postId = postCard.dataset.postId;
      const post = posts.find(p => p.id === postId);

      post.liked = !post.liked; // toggle like
      icon.setAttribute('type', post.liked ? 'solid' : 'regular');
      icon.setAttribute('color', post.liked ? 'red' : '#333');

      localStorage.setItem(`posts_${currentUser}`, JSON.stringify(posts)); // save
    });
  });


  // Show the comment box
  document.querySelectorAll(".comment-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const postCard = icon.closest(".post-card");
      const commentBox = postCard.querySelector(".comment-box");
      const commentsContainer = postCard.querySelector(".comments-container");
      const isVisible = commentBox.style.display === "block";
      commentBox.style.display = isVisible ? "none" : "block";
      commentsContainer.style.display = isVisible ? "none" : "flex";
      if (!isVisible) commentBox.querySelector(".comment-input").focus();
    });
  });


  // Share
  document.querySelectorAll(".share-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const postCard = icon.closest(".post-card");
      const postId = postCard.dataset.postId;
      const postLink = `${window.location.origin}/post.html?id=${postId}`;
      navigator.clipboard
        .writeText(postLink)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Copy failed."));
    });
  });


  // Comment posting
  document.querySelectorAll('.comment-input').forEach((input) => {
    const button = input.nextElementSibling;
    input.addEventListener('input', () => {
      button.disabled = !input.value.trim();
      button.classList.toggle('active', input.value.trim() !== '');
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) postComment(input, button, posts, currentUser);
    });
    button.addEventListener('click', () => {
      if (input.value.trim()) postComment(input, button, posts, currentUser);
    });
  });
}


// Post comment
function postComment(input, button, posts, currentUser) {
  const commentText = input.value.trim();
  if (!commentText) return;

  const postCard = input.closest('.post-card');
  const postId = postCard.dataset.postId;
  const commentsContainer = postCard.querySelector('.comments-container');


  // DOM update
  commentsContainer.style.display = 'flex';
  const newComment = document.createElement('div');
  newComment.className = 'comment';
  newComment.innerHTML = `<strong>${currentUser}</strong> ${commentText}`;
  commentsContainer.appendChild(newComment);


  // Save to post data for this user
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex > -1) {
    posts[postIndex].comments.push({ user: currentUser, text: commentText });
    localStorage.setItem(`posts_${currentUser}`, JSON.stringify(posts));
  }


  // Reset input
  input.value = '';
  button.classList.remove('active');
  button.disabled = true;
  newComment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// abandoned
// Logout
// window.addEventListener("DOMContentLoaded", () => {
//   const logoutLink = document.getElementsByClassName(".logout-link");
//   if (logoutLink) {
//     logoutLink.addEventListener("click", function (e) {
//       e.preventDefault();
//       if (confirm("Are you sure you want to log out?"))
//       {
//         localStorage.setItem("isLoggedIn", "false");
//         deleteUserData("currentUserIndex").then(r => {
//             console.log(r);
//             window.location.href = "register_login.html";
//         });
//       }
//     });
//   }
// });
