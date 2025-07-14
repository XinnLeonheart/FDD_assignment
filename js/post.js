document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.getElementById('postFeed');
  const currentCategory = document.body.dataset.category;

  // Track last visited page for redirect
  localStorage.setItem('lastVisitedPage', window.location.pathname);

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
            <div class="post-content">
              <h4>${post.user}</h4>
              <p>${post.text}</p>
              ${post.imageURL ? `<img src="${post.imageURL}" alt="Post Image">` : ''}
              ${post.pdfURL ? `<a class="file-download" href="${post.pdfURL}" download="${post.pdfName}">📎 ${post.pdfName}</a>` : ''}
              <div class="post-actions">
                <span>💬</span>
                <span>🤍</span>
                <span>🔗</span>
              </div>
            </div>
          `;
          postFeed.appendChild(card);
        }
      });
    })
    .catch(err => {
      console.error('Failed to load posts:', err);
      postFeed.innerHTML = '<p>Failed to load posts.</p>';
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.getElementById('postFeed');
  const currentCategory = document.body.dataset.category; // set in <body data-category="general">

  // Store last visited page (used for redirect after post)
  localStorage.setItem('lastVisitedPage', window.location.pathname);

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
            <div class="post-content">
              <h4>${post.user}</h4>
              <p>${post.text}</p>
              ${post.imageURL ? `<img src="${post.imageURL}">` : ''}
              ${post.pdfURL ? `<a href="${post.pdfURL}" target="_blank">📎 ${post.pdfName}</a>` : ''}
              <div class="post-actions">
                <span>💬</span>
                <span>🤍</span>
                <span>🔗</span>
              </div>
            </div>
          `;
          postFeed.appendChild(card);
        }
      });
    });
});

