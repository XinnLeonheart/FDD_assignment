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
              </div>
            </div>
            <div class="comment-box" style="display: none;">
              <input type="text" class="comment-input" placeholder="Write a comment...">
              <button class="submit-comment">Post</button>
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
      bindPostInteractions();
    })
    .catch(err => {
      console.error('Failed to load posts:', err);
      postFeed.innerHTML = '<p>Failed to load posts.</p>';
    });
});

// ✅ Interaction logic for all posts
function bindPostInteractions() {
  const userId = localStorage.getItem("userId"); // 🔐 Assume you're storing logged-in user ID

  document.querySelectorAll('.like-icon').forEach((icon, index) => {
    icon.addEventListener('click', async () => {
      const postCard = icon.closest('.post-card');
      const postId = postCard.dataset.postId;

      try {
        const postRef = db.collection("posts").doc(postId);
        const doc = await postRef.get();
        let likes = doc.data().likes || [];

        const isLiked = likes.includes(userId);

        if (isLiked) {
          likes = likes.filter(uid => uid !== userId);
          icon.setAttribute('type', 'regular');
          icon.setAttribute('color', '#333');
        } else {
          likes.push(userId);
          icon.setAttribute('type', 'solid');
          icon.setAttribute('color', 'red');
        }

        await postRef.update({ likes });
      } catch (err) {
        console.error('Error updating likes:', err);
      }
    });
  });

}


  // Comment toggle
document.querySelectorAll('.comment-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const postCard = icon.closest('.post-card');
    const commentBox = postCard.querySelector('.comment-box');
    const commentsContainer = postCard.querySelector('.comments-container');

    if (commentBox && commentsContainer) {
      const isVisible = commentBox.style.display === 'block';
      commentBox.style.display = isVisible ? 'none' : 'block';
      commentsContainer.style.display = isVisible ? 'none' : 'flex';
    }
  });
});



  // Share link
document.querySelectorAll('.share-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const postCard = icon.closest('.post-card');
    const postId = postCard.dataset.postId;
    const postLink = `${window.location.origin}/post.html?id=${postId}`;

    navigator.clipboard.writeText(postLink)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => alert('Copy failed.'));
  });
});


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

document.querySelectorAll('.submit-comment').forEach((btn, index) => {
  const input = btn.previousElementSibling;

  // Enable/disable logic
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim() === '';
  });

  btn.addEventListener('click', async () => {
    const commentText = input.value.trim();
    if (!commentText) return;

    const postCard = btn.closest('.post-card');
    const postId = postCard.dataset.postId;

    const commentObj = {
      user: user.username,
      text: commentText
    };

    try {
      const postRef = db.collection("posts").doc(postId);
      await postRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion(commentObj)
      });

      // Append comment to DOM
      const commentContainer = postCard.querySelector('.comments-container');
      const newComment = document.createElement('div');
      newComment.classList.add('comment');
      newComment.innerHTML = `<strong>${commentObj.user}</strong> ${commentObj.text}`;
      commentContainer.appendChild(newComment);

      input.value = '';
      btn.disabled = true;
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  });
});

document.querySelectorAll('.comment-box').forEach(box => {
  const input = box.querySelector('.comment-input');
  const btn = box.querySelector('.submit-comment');
  const postCard = box.closest('.post-card');
  const commentsContainer = postCard.querySelector('.comments-container');

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim() === '';
  });

  btn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.innerHTML = `<strong>You</strong> ${text}`;
    commentsContainer.appendChild(comment);

    input.value = '';
    btn.disabled = true;
  });
});

