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

          card.innerHTML = `
            <div class="post-img">
              ${post.imageURL ? `<img src="${post.imageURL}" alt="Post Image">` : ''}
            </div>
            <div class="post-content">
              <h4>${post.user} ${post.user === "Asia Pacific University" ? '<span class="badge">· official</span>' : ''}</h4>
              <p>${post.text}</p>
              ${post.pdfURL ? `<a class="file-download" href="${post.pdfURL}" download="${post.pdfName}">📎 ${post.pdfName}</a>` : ''}
              <div class="post-actions">
                <box-icon name="heart" class="like-icon" type="regular"></box-icon>
                <box-icon name="comment" class="comment-icon" type="regular"></box-icon>
                <box-icon name="share" class="share-icon" type="regular"></box-icon>
              </div>
              <div class="comment-box" style="display: none;">
                <input type="text" class="comment-input" placeholder="Write a comment...">
              </div>
            </div>
          `;
          postFeed.appendChild(card);
        }
      });

      // 🔗 Attach interactions AFTER posts are loaded
      bindPostInteractions();
    })
    .catch(err => {
      console.error('Failed to load posts:', err);
      postFeed.innerHTML = '<p>Failed to load posts.</p>';
    });
});

// ✅ Bind event listeners to icons
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

          card.innerHTML = `
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
              <div class="comment-box" style="display: none;">
                <input type="text" class="comment-input" placeholder="Write a comment...">
              </div>
            </div>
          `;

          postFeed.appendChild(card);
        }
      });

      // ✅ Now that posts are rendered, attach event listeners
      bindPostInteractions();
    })
    .catch(err => {
      console.error('Failed to load posts:', err);
      postFeed.innerHTML = '<p>Failed to load posts.</p>';
    });
});

// ✅ Interaction logic for all posts
function bindPostInteractions() {
  // Like button
  document.querySelectorAll('.like-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const isLiked = icon.getAttribute('type') === 'solid';
      icon.setAttribute('type', isLiked ? 'regular' : 'solid');
      icon.setAttribute('color', isLiked ? '#333' : 'red');
    });
  });

  // Comment toggle
  document.querySelectorAll('.comment-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const commentBox = icon.closest('.post-content').querySelector('.comment-box');
      if (commentBox) {
        commentBox.style.display = commentBox.style.display === 'none' ? 'block' : 'none';
      }
    });
  });

  // Share link
  document.querySelectorAll('.share-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Post link copied!'))
        .catch(() => alert('Copy failed.'));
    });
  });
}

const user = {
  username: "Asia Pacific University",
  desc: "APU",
  profileImage: "image/profile.jpg"
};

window.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.querySelector('.logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        localStorage.setItem('isLoggedIn', 'false'); // <-- Add this line
        window.location.href = 'register_login.html';
      }
    });
  }
});

// Image modal logic
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.post-img img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      const modal = document.getElementById('imageModal');
      const modalImg = document.getElementById('modalImg');
      modalImg.src = this.src;
      modal.classList.add('show');
    });
  });

  document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('imageModal').classList.remove('show');
  });

  document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('show');
    }
  });
});