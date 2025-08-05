document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.getElementById('postFeed');
  const currentCategory = document.body.dataset.category;

  // Store current page path
  localStorage.setItem('lastVisitedPage', window.location.pathname);

  // Fetch posts from Firestore
  db.collection("posts")
    .orderBy("timestamp", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const post = doc.data();
        if (post.category === currentCategory) {
          const card = document.createElement('div');
          card.className = 'post-card';
          card.dataset.postId = doc.id; // Store post ID for interactions

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
                  <box-icon name="heart" class="like-icon" type="regular" color="#333"></box-icon>
                  <box-icon name="comment" class="comment-icon" type="regular" color="#333"></box-icon>
                  <box-icon name="share" class="share-icon" type="regular" color="#333"></box-icon>
                </div>
                <div class="comments-container">
                  ${post.comments?.map(c => `
                    <div class="comment"><strong>${c.user}</strong> ${c.text}</div>
                  `).join('') || ''}
                </div>
              </div>
            </div>
            <div class="comment-box" style="display: none;">
              <input type="text" class="comment-input" placeholder="Add a comment...">
              <button class="submit-comment" disabled>Post</button>
            </div>
          `;

          postFeed.appendChild(card);
        }
      });

      // ✅ Now that posts are rendered, attach event listeners
      enableImageModalPreview();
    })
    .catch(err => {
      console.error('Failed to load posts:', err);
      postFeed.innerHTML = '<p>Failed to load posts.</p>';
    });
});

function enableImageModalPreview() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.querySelector(".close-modal");

  // Re-select images after posts are rendered
  document.querySelectorAll(".post-img img").forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      modalImg.src = this.src;
      modal.style.display = "block"; // Show modal
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"; // Hide modal
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"; // Hide if clicking outside image
    }
  });
}

// Like functionality
document.querySelectorAll('.like-icon').forEach((icon) => {
    icon.addEventListener('click', () => {
      const isLiked = icon.getAttribute('type') === 'solid';

      if (isLiked) {
        icon.setAttribute('type', 'regular');
        icon.setAttribute('color', '#333');
      } else {
        icon.setAttribute('type', 'solid');
        icon.setAttribute('color', 'red');
      }
    });
  });

// Comment toggle

document.querySelectorAll(".comment-icon").forEach((icon) => {
  icon.addEventListener("click", () => {
    const postCard = icon.closest(".post-card");
    const commentBox = postCard.querySelector(".comment-box");
    const commentsContainer = postCard.querySelector(".comments-container");

    if (commentBox && commentsContainer) {
      const isVisible = commentBox.style.display === "block";
      commentBox.style.display = isVisible ? "none" : "block";
      commentsContainer.style.display = isVisible ? "none" : "flex";
    }
  });
});

// Share link

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

const user = {
  username: "Asia Pacific University",
  desc: "APU",
  profileImage: "image/profile.jpg",
};

window.addEventListener("DOMContentLoaded", () => {
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
});

window.addEventListener("DOMContentLoaded", enableImageModalPreview);