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

// After Firebase config loaded

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = document.getElementById('postText').value.trim();
  const category = document.getElementById('postCategory').value;
  const imageFile = document.getElementById('postImage').files[0];
  const pdfFile = document.getElementById('postPDF').files[0];

  const postData = {
    user: 'You',
    category,
    text,
    imageURL: '',
    pdfURL: '',
    pdfName: '',
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Upload image if exists
  if (imageFile) {
    const imgRef = storage.ref(`images/${Date.now()}_${imageFile.name}`);
    await imgRef.put(imageFile);
    postData.imageURL = await imgRef.getDownloadURL();
  }

  // Upload PDF if exists
  if (pdfFile) {
    const pdfRef = storage.ref(`pdfs/${Date.now()}_${pdfFile.name}`);
    await pdfRef.put(pdfFile);
    postData.pdfURL = await pdfRef.getDownloadURL();
    postData.pdfName = pdfFile.name;
  }

  // Save post to Firestore
  await db.collection("posts").add(postData);

  // Redirect to previous feed page
  const lastPage = localStorage.getItem('lastVisitedPage') || 'general.html';
  window.location.href = lastPage;
});
