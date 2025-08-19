document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.getElementById('postFeed');
  const currentCategory = document.body.dataset.category;
  const currentUser = localStorage.getItem('currentUser');

  if (!currentUser) {
    window.location.href = 'register_login.html';
    return;
  }

  localStorage.setItem(`lastVisitedPage_${currentUser}`, window.location.pathname);

  const defaultPosts = [
    {
      id: "1",
      user: "Asia Pacific University",
      category: "general",
      text: "Welcome to the new semester!",
      imageURL: "image/sample1.jpg",
      pdfURL: "",
      pdfName: "announcement.pdf",
      liked: false,
      comments: [
        { user: "John", text: "Excited!" },
        { user: "Mary", text: "Can't wait!" }
      ]
    },
    {
      id: "2",
      user: "Student Council",
      category: "general",
      text: "Join us for the annual sports day!",
      imageURL: "",
      pdfURL: "files/sports-day.pdf",
      pdfName: "Sports Day Info.pdf",
      liked: false,
      comments: []
    }
  ];

  let posts = JSON.parse(localStorage.getItem("allPosts")) || defaultPosts;


  posts.forEach(post => {
    if (post.category === currentCategory) {
      // Post card
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
            <div class="comments-container" style="display:none;">
              ${post.comments.map(c => `<div class="comment"><strong>${c.user}</strong> ${c.text}</div>`).join('')}
            </div>
          </div>
        </div>
      `;

      // Comment box outside post card
      const commentBox = document.createElement('div');
      commentBox.className = 'comment-box';
      commentBox.style.display = 'none';
      commentBox.dataset.postId = post.id;
      commentBox.innerHTML = `
        <input type="text" class="comment-input" placeholder="Add a comment...">
        <button class="submit-comment" disabled>Post</button>
      `;

      postFeed.appendChild(card);
      postFeed.appendChild(commentBox);
    }
  });

  enableImageModalPreview();
  setupPostInteractions(posts, currentUser);

  const logoutLink = document.querySelector(".logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        localStorage.setItem("isLoggedIn", "false");
        window.location.href = "register_login.html";
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".post-card") && !e.target.closest(".comment-box")) {
      document.querySelectorAll(".comment-box").forEach(box => box.style.display = "none");
      document.querySelectorAll(".comments-container").forEach(c => c.style.display = "none");
    }
  });
});

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

function setupPostInteractions(posts, currentUser) {
  // Likes
  document.querySelectorAll('.like-icon').forEach((icon) => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const postCard = icon.closest('.post-card');
      const postId = postCard.dataset.postId;
      const post = posts.find(p => p.id === postId);

      post.liked = !post.liked;
      icon.setAttribute('type', post.liked ? 'solid' : 'regular');
      icon.setAttribute('color', post.liked ? 'red' : '#333');

      localStorage.setItem(`posts_${currentUser}`, JSON.stringify(posts));
    });
  });

  // Comment toggle
  document.querySelectorAll(".comment-icon").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const postCard = icon.closest(".post-card");
      const commentsContainer = postCard.querySelector(".comments-container");
      const commentBox = postCard.nextElementSibling;

      document.querySelectorAll(".comment-box").forEach(box => box.style.display = "none");
      document.querySelectorAll(".comments-container").forEach(c => c.style.display = "none");

      commentsContainer.style.display = "block";
      commentBox.style.display = "flex";
      commentBox.querySelector(".comment-input").focus();
    });
  });

  // Comment post
  document.querySelectorAll('.comment-input').forEach((input) => {
    const button = input.nextElementSibling;
    input.addEventListener('input', () => button.disabled = !input.value.trim());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) postComment(input, button, posts, currentUser);
    });
    button.addEventListener('click', () => {
      if (input.value.trim()) postComment(input, button, posts, currentUser);
    });
  });
}

function postComment(input, button, posts, currentUser) {
  const commentText = input.value.trim();
  if (!commentText) return;

  const commentBox = input.closest('.comment-box');
  const postId = commentBox.dataset.postId;
  const postCard = commentBox.previousElementSibling;
  const commentsContainer = postCard.querySelector('.comments-container');

  const newComment = document.createElement('div');
  newComment.className = 'comment';
  newComment.innerHTML = `<strong>${currentUser}</strong> ${commentText}`;
  commentsContainer.appendChild(newComment);

  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex > -1) {
    posts[postIndex].comments.push({ user: currentUser, text: commentText });
    localStorage.setItem(`posts_${currentUser}`, JSON.stringify(posts));
  }

  commentsContainer.style.display = 'block';
  input.value = '';
  button.disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  const type = urlParams.get("type"); // like or comment

  // Inject comments for hard-coded posts if any
  posts.forEach((post) => {
    const hardcodedCard = document.querySelector(
      `.post-card[data-post-id="${post.id}"]`
    );
    if (hardcodedCard) {
      const commentsContainer = hardcodedCard.querySelector(
        ".comments-container"
      );
      if (commentsContainer && post.comments.length > 0) {
        commentsContainer.innerHTML = post.comments
          .map(
            (c) =>
              `<div class="comment"><strong>${c.user}</strong> ${c.text}</div>`
          )
          .join("");
      }
    }
  });

  if (postId) {
    const targetPost = document.querySelector(
      `.post-card[data-post-id="${postId}"]`
    );
    if (targetPost) {
      // Scroll to post
      targetPost.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight post briefly
      targetPost.style.boxShadow = "0 0 15px rgba(0, 162, 200, 0.8)";
      setTimeout(() => {
        targetPost.style.boxShadow = "";
      }, 3000);

      // If it's a comment notification, auto-open the comment box
      if (type === "comment") {
        const commentBox = targetPost.nextElementSibling;
        const commentsContainer = targetPost.querySelector(
          ".comments-container"
        );

        if (commentBox && commentsContainer) {
          commentBox.style.display = "flex";
          commentsContainer.style.display = "block";
          const input = commentBox.querySelector(".comment-input");
          if (input) input.focus(); // auto-focus the input
        }
      }
    }
  }
});

// Share button (copy link with tooltip)
document.querySelectorAll('.share-icon').forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    const postCard = icon.closest(".post-card");
    const postId = postCard.dataset.postId;

    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${postId}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      // Create tooltip
      const tooltip = document.createElement("span");
      tooltip.innerText = "Copied!";
      tooltip.style.position = "absolute";
      tooltip.style.background = "#333";
      tooltip.style.color = "#fff";
      tooltip.style.padding = "4px 8px";
      tooltip.style.borderRadius = "6px";
      tooltip.style.fontSize = "12px";
      tooltip.style.top = `${icon.getBoundingClientRect().top - 30 + window.scrollY}px`;
      tooltip.style.left = `${icon.getBoundingClientRect().left + window.scrollX}px`;
      tooltip.style.zIndex = "9999";
      tooltip.style.transition = "opacity 0.5s ease";
      document.body.appendChild(tooltip);

      // Fade out and remove tooltip
      setTimeout(() => {
        tooltip.style.opacity = "0";
        setTimeout(() => tooltip.remove(), 500);
      }, 1000);
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  });
});
