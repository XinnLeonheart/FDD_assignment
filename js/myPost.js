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
            <button class="edit-btn"><box-icon name='edit'></box-icon> Edit</button>
            <button class="delete-btn"><box-icon name='message-square-x'></box-icon> Delete</button>
          </div>
        </div>
      </div>
    `;

    const editBtn = postCard.querySelector(".edit-btn");
    const deleteBtn = postCard.querySelector(".delete-btn");

    // --- EDIT ---
    editBtn.addEventListener("click", () => {
      const textEl = postCard.querySelector(".post-text");

      if (editBtn.dataset.mode !== "save") {
        // Expand post card width
        postCard.style.width = "700px"; // adjust as needed

        const textarea = document.createElement("textarea");
        textarea.value = post.text;
        textarea.className = "edit-area";
        textEl.replaceWith(textarea);

        const cancelBtn = document.createElement("button");
        cancelBtn.innerHTML = "<box-icon name='x'></box-icon> Cancel";
        cancelBtn.className = "cancel-btn";
        postCard.querySelector(".post-actions").insertBefore(cancelBtn, deleteBtn);

        cancelBtn.addEventListener("click", () => {
          const newTextEl = document.createElement("p");
          newTextEl.className = "post-text";
          newTextEl.textContent = post.text;
          textarea.replaceWith(newTextEl);

          // Reset post card width
          postCard.style.width = "";

          editBtn.dataset.mode = "";
          editBtn.innerHTML = "<box-icon name='edit'></box-icon> Edit";
          cancelBtn.remove();
        });

        editBtn.dataset.mode = "save";
        editBtn.innerHTML = "<box-icon name='check'></box-icon> Save";
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

          // Reset post card width
          postCard.style.width = "";

          editBtn.dataset.mode = "";
          editBtn.innerHTML = "<box-icon name='edit'></box-icon> Edit";
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
