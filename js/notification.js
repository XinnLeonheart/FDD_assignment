document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "register_login.html";
    return;
  }

  const notificationsContainer = document.querySelector(".notifications-section");

  // Same default posts you use in post.js
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

  // Load posts (with localStorage first, fallback to default)
  const posts = JSON.parse(localStorage.getItem(`posts_${currentUser}`)) || defaultPosts;

  // Generate notifications dynamically
  posts.forEach(post => {
    // Like notifications
    if (post.liked) {
      const notif = document.createElement("a");
      notif.href = `general.html?id=${post.id}&type=like`;
      notif.className = "notification-item like";
      notif.innerHTML = `
        <i class='bx bxs-heart'></i>
        <div>
          <strong>${currentUser}</strong> liked your post.
          <span class="time">just now</span>
        </div>
      `;
      notificationsContainer.appendChild(notif);
    }

    // Comment notifications
    post.comments.forEach(c => {
      const notif = document.createElement("a");
      notif.href = `general.html?id=${post.id}&type=comment`;
      notif.className = "notification-item comment";
      notif.innerHTML = `
        <i class='bx bxs-comment-detail'></i>
        <div>
          <strong>${c.user}</strong> commented: “${c.text}”
          <span class="time">just now</span>
        </div>
      `;
      notificationsContainer.appendChild(notif);
    });
  });

  // Example static follow notification
  const followNotif = document.createElement("div");
  followNotif.className = "notification-item follow";
  followNotif.innerHTML = `
    <i class='bx bxs-user-plus'></i>
    <div>
      <strong>Michael Lee</strong> started following you.
      <span class="time">30 mins ago</span>
    </div>
  `;
  notificationsContainer.appendChild(followNotif);
});
