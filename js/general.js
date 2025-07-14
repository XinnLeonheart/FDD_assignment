document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.topbar a[data-category]');
  const allPosts = document.querySelectorAll('.post-card');

  // Show all posts initially
  allPosts.forEach(post => post.style.display = 'block');

  tabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();

      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const selectedCategory = this.getAttribute('data-category');

      allPosts.forEach(post => {
        const postCategory = post.getAttribute('data-category');
        if (selectedCategory === 'all' || postCategory === selectedCategory) {
          post.style.display = 'block';
        } else {
          post.style.display = 'none';
        }
      });
    });
  });
});
