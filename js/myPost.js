document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser"); 
  const postFeed = document.getElementById("my-posts");

  if (!currentUser) {
    postFeed.innerHTML = "<p>You must be logged in to see your posts.</p>";
    return;
  }

  let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];

  // Filter only the posts by this user
  let myPosts = allPosts.filter(p => p.owner === currentUser);

  if (myPosts.length === 0) {
    postFeed.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  myPosts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.dataset.postId = post.id;

    card.innerHTML = `
      <div class="post-body">
        ${post.imageURL ? `<img src="${post.imageURL}" alt="Post Image"/>` : ""}
        <p>${post.text}</p>
        ${post.pdfURL ? `<a href="${post.pdfURL}" download>${post.pdfName}</a>` : ""}
        <div class="post-actions">
          <button class="delete-btn">🗑️ Delete</button>
        </div>
      </div>
    `;

    postFeed.appendChild(card);

    // Delete button
    card.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("Delete this post?")) {
        allPosts = allPosts.filter(p => p.id !== post.id);
        localStorage.setItem("allPosts", JSON.stringify(allPosts));
        card.remove();
      }
    });
  });
});
