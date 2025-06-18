document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.topbar a[data-category]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      // Hide all sections
      document.querySelectorAll('.category-section').forEach(sec => sec.style.display = 'none');
      // Show the selected section
      const cat = this.getAttribute('data-category');
      document.getElementById(cat).style.display = 'block';
    });
  });
});

