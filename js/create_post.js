document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createPostForm');
  const preview = document.getElementById('previewArea');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = document.getElementById('postText').value.trim();
    const category = document.getElementById('postCategory').value;
    const imageFile = document.getElementById('postImage').files[0];
    const pdfFile = document.getElementById('postPDF').files[0];

    const post = {
      user: 'You',
      category,
      text,
      imageData: '',
      pdfName: '',
      pdfData: ''
    };

    // Read files using FileReader
    const readerImg = new FileReader();
    const readerPDF = new FileReader();

    if (imageFile) {
      readerImg.onload = function (e) {
        post.imageData = e.target.result;
        checkPDF();
      };
      readerImg.readAsDataURL(imageFile);
    } else {
      checkPDF();
    }

    function checkPDF() {
      if (pdfFile) {
        readerPDF.onload = function (e) {
          post.pdfData = e.target.result;
          post.pdfName = pdfFile.name;
          finalize();
        };
        readerPDF.readAsDataURL(pdfFile);
      } else {
        finalize();
      }
    }

    function finalize() {
      console.log('Post created:', post);

      // For demo: show preview
      preview.innerHTML = `
        <h3>Post Preview</h3>
        <p><strong>Category:</strong> ${post.category}</p>
        <p>${post.text}</p>
        ${post.imageData ? `<img src="${post.imageData}" alt="Image Preview">` : ''}
        ${post.pdfData ? `<p>📎 ${post.pdfName}</p>` : ''}
      `;

      // Later: Save to Firebase or localStorage
      // localStorage.setItem('latestPost', JSON.stringify(post));
    }

    // Optionally reset the form
    form.reset();
  });
});
