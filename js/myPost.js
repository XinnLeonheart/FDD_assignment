document.addEventListener("DOMContentLoaded", () => {
  renderPosts();
});

function renderPosts() {
  const postsContainer = document.getElementById("my-posts");
  postsContainer.innerHTML = "";

  let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];
  const currentUser = localStorage.getItem("currentUser");

  // Filter only current user's posts
  const myPosts = allPosts.filter(post => post.owner === currentUser);

  if (myPosts.length === 0) {
    postsContainer.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  myPosts.forEach(post => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.dataset.postId = post.id;

    postCard.innerHTML = `
      <div class="post-body">
        ${post.imageURL ? `<div class="post-img"><img src="${post.imageURL}" alt="post image"></div>` : ""}
        <div class="post-content">
          <h4>${post.owner} <span class="badge">· you</span></h4>
          <p class="post-text">${post.text}</p>
          ${post.pdfName ? `<a class="file-download" href="${post.pdfURL}" download="${post.pdfName}">${post.pdfName}</a>` : ""}
          <div class="post-actions">
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;

    // --- Buttons ---
    const editBtn = postCard.querySelector(".edit-btn");
    const deleteBtn = postCard.querySelector(".delete-btn");

    // --- EDIT ---
    editBtn.addEventListener("click", () => {
      const textEl = postCard.querySelector(".post-text");

      if (editBtn.textContent === "✏️ Edit") {
        const textarea = document.createElement("textarea");
        textarea.value = post.text;
        textarea.className = "edit-area";
        textEl.replaceWith(textarea);

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "❌ Cancel";
        cancelBtn.className = "cancel-btn";
        postCard.querySelector(".post-actions").insertBefore(cancelBtn, deleteBtn);

        cancelBtn.addEventListener("click", () => {
          const newTextEl = document.createElement("p");
          newTextEl.className = "post-text";
          newTextEl.textContent = post.text;
          textarea.replaceWith(newTextEl);

          editBtn.textContent = "✏️ Edit";
          cancelBtn.remove();
        });

        editBtn.textContent = "💾 Save";
      } else {
        const textarea = postCard.querySelector(".edit-area");
        const updatedText = textarea.value.trim();

        if (updatedText) {
          post.text = updatedText;
          allPosts = allPosts.map(p => (p.id === post.id ? post : p));
          localStorage.setItem("allPosts", JSON.stringify(allPosts));

          const newTextEl = document.createElement("p");
          newTextEl.className = "post-text";
          newTextEl.textContent = updatedText;
          textarea.replaceWith(newTextEl);

          editBtn.textContent = "✏️ Edit";
          const cancelBtn = postCard.querySelector(".cancel-btn");
          if (cancelBtn) cancelBtn.remove();
        }
      }
    });

    // --- DELETE ---
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this post?")) {
        allPosts = allPosts.filter(p => p.id !== post.id);
        localStorage.setItem("allPosts", JSON.stringify(allPosts));
        renderPosts();
      }
    });

    postsContainer.appendChild(postCard);
  });
}
