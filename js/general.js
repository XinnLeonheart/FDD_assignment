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
      const card = document.createElement('div');
      card.className = 'post-card';
      card.dataset.postId = post.id;

      // Support both single and multiple media
      let mediaItems = [];
      if (post.images && Array.isArray(post.images)) {
        mediaItems = mediaItems.concat(post.images);
      } else if (post.imageURL) {
        mediaItems.push(post.imageURL);
      }
      if (post.videos && Array.isArray(post.videos)) {
        mediaItems = mediaItems.concat(post.videos);
      }

      const mediaThumbnails = mediaItems.map((media, idx) => {
        const isVideo = media.endsWith('.mp4') || media.endsWith('.webm');
        return isVideo
          ? `<video src="${media}" class="media-thumb" data-idx="${idx}" controls width="80"></video>`
          : `<img src="${media}" class="media-thumb" data-idx="${idx}" width="80" alt="Media">`;
      }).join('');

      card.innerHTML = `
        <div class="post-body">
          <div class="post-img">
            ${mediaThumbnails}
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
  setupShareButtons();

  // Logout
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

  // Upload previews from posting.html
  setupUploadPreviews();
});

// ----- Image/Video Modal -----
function enableImageModalPreview() {
  const modal = document.getElementById("imageModal");
  const mediaContainer = modal.querySelector(".modal-media-container");
  const closeBtn = modal.querySelector(".close-modal");
  const prevBtn = modal.querySelector(".modal-prev");
  const nextBtn = modal.querySelector(".modal-next");

  let currentMediaList = [];
  let currentIdx = 0;

  document.querySelectorAll(".media-thumb").forEach((thumb) => {
    thumb.style.cursor = "pointer";
    thumb.addEventListener("click", function () {
      const postBody = thumb.closest('.post-body');
      currentMediaList = Array.from(postBody.querySelectorAll('.media-thumb')).map(el => ({
        src: el.src,
        isVideo: el.tagName === 'VIDEO'
      }));
      currentIdx = parseInt(thumb.dataset.idx);
      showMedia(currentIdx);
      modal.style.display = "flex";
    });
  });

  function showMedia(idx) {
    mediaContainer.innerHTML = "";
    const media = currentMediaList[idx];
    if (media.isVideo) {
      const video = document.createElement("video");
      video.src = media.src;
      video.controls = true;
      mediaContainer.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = media.src;
      mediaContainer.appendChild(img);
    }
  }

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentMediaList.length) {
      currentIdx = (currentIdx - 1 + currentMediaList.length) % currentMediaList.length;
      showMedia(currentIdx);
    }
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentMediaList.length) {
      currentIdx = (currentIdx + 1) % currentMediaList.length;
      showMedia(currentIdx);
    }
  });

  closeBtn.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

// ----- Upload preview for posting.html -----
function setupUploadPreviews() {
  const imageInput = document.getElementById("attachImage");
  const videoInput = document.getElementById("attachVideo");
  const fileInput = document.getElementById("attachFile");

  const previewImages = document.getElementById("previewImages");
  const previewVideos = document.getElementById("previewVideos");
  const previewFiles = document.getElementById("previewFiles");

  function createPreview(file, container) {
    const url = URL.createObjectURL(file);
    let el;

    if (file.type.startsWith("image/")) {
      el = document.createElement("img");
      el.src = url;
      el.width = 80;
      el.classList.add("media-thumb");
    } else if (file.type.startsWith("video/")) {
      el = document.createElement("video");
      el.src = url;
      el.width = 80;
      el.controls = true;
      el.classList.add("media-thumb");
    } else {
      el = document.createElement("div");
      el.textContent = file.name;
      el.classList.add("file-thumb");
    }

    el.style.cursor = "pointer";
    container.appendChild(el);

    // Click to preview modal for image/video
    el.addEventListener("click", () => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        openMediaModal([file], 0);
      }
    });
  }

  imageInput?.addEventListener("change", () => {
    previewImages.innerHTML = "";
    Array.from(imageInput.files).forEach(file => createPreview(file, previewImages));
  });

  videoInput?.addEventListener("change", () => {
    previewVideos.innerHTML = "";
    Array.from(videoInput.files).forEach(file => createPreview(file, previewVideos));
  });

  fileInput?.addEventListener("change", () => {
    previewFiles.innerHTML = "";
    Array.from(fileInput.files).forEach(file => createPreview(file, previewFiles));
  });
}

// ----- Open modal for uploaded files -----
function openMediaModal(fileList, startIdx = 0) {
  const modal = document.getElementById("imageModal");
  const mediaContainer = modal.querySelector(".modal-media-container");
  const closeBtn = modal.querySelector(".close-modal");
  const prevBtn = modal.querySelector(".modal-prev");
  const nextBtn = modal.querySelector(".modal-next");

  let currentIdx = startIdx;
  const mediaFiles = fileList.map(file => ({
    url: URL.createObjectURL(file),
    isVideo: file.type.startsWith("video/")
  }));

  function showMedia(idx) {
    mediaContainer.innerHTML = "";
    const media = mediaFiles[idx];
    if (media.isVideo) {
      const video = document.createElement("video");
      video.src = media.url;
      video.controls = true;
      mediaContainer.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = media.url;
      mediaContainer.appendChild(img);
    }
  }

  showMedia(currentIdx);
  modal.style.display = "flex";

  prevBtn.onclick = (e) => {
    e.stopPropagation();
    currentIdx = (currentIdx - 1 + mediaFiles.length) % mediaFiles.length;
    showMedia(currentIdx);
  };

  nextBtn.onclick = (e) => {
    e.stopPropagation();
    currentIdx = (currentIdx + 1) % mediaFiles.length;
    showMedia(currentIdx);
  };

  closeBtn.onclick = () => modal.style.display = "none";
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}

// ----- Likes, Comments, and Share -----
function setupPostInteractions(posts, currentUser) {
  document.querySelectorAll('.like-icon').forEach((icon) => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const postCard = icon.closest('.post-card');
      const postId = postCard.dataset.postId;
      const post = posts.find(p => p.id === postId);
      post.liked = !post.liked;
      icon.setAttribute('type', post.liked ? 'solid' : 'regular');
      icon.setAttribute('color', post.liked ? 'red' : '#333');
      localStorage.setItem("allPosts", JSON.stringify(posts));
    });
  });

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
    localStorage.setItem("allPosts", JSON.stringify(posts));
  }

  commentsContainer.style.display = 'block';
  input.value = '';
  button.disabled = true;
}

function setupShareButtons() {
  document.querySelectorAll('.share-icon').forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const postCard = icon.closest(".post-card");
      const postId = postCard.dataset.postId;
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${postId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
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
        setTimeout(() => {
          tooltip.style.opacity = "0";
          setTimeout(() => tooltip.remove(), 500);
        }, 1000);
      }).catch(err => console.error("Failed to copy: ", err));
    });
  });
}
