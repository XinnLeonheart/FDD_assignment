document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('attachImage');
  const videoInput = document.getElementById('attachVideo');
  const fileInput = document.getElementById('attachFile');

  const previewImages = document.getElementById('previewImages');
  const previewVideos = document.getElementById('previewVideos');
  const previewFiles = document.getElementById('previewFiles');

  function createPreviewItem(type, file) {
    const wrapper = document.createElement("div");
    wrapper.className = "file-item";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-file";
    removeBtn.innerHTML = "&times;";
    removeBtn.onclick = () => wrapper.remove();

    if (type === "image") {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      wrapper.appendChild(img);
    } else if (type === "video") {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.controls = true;
      wrapper.appendChild(video);
    } else {
      const fileInfo = document.createElement("span");
      fileInfo.innerHTML = `<i class='bx bxs-file'></i><span class="file-name">${file.name}</span>`;
      wrapper.appendChild(fileInfo);
    }

    wrapper.appendChild(removeBtn);
    return wrapper;
  }

  function handleFiles(input, type, container, maxCount) {
    const currentCount = container.children.length;
    const newFiles = Array.from(input.files);

    // Check if adding the new files exceeds the limit
    if (currentCount + newFiles.length > maxCount) {
      alert(`You can only upload up to ${maxCount} ${type}${maxCount > 1 ? 's' : ''}.`);
      input.value = ''; // Clear selection
      return;
    }

    newFiles.forEach((file) => {
      container.appendChild(createPreviewItem(type, file));
    });

    input.value = '';

    // Update label text
    if (type === "image") {
      document.querySelector("#imageLabel .label-text").textContent = "Add more image";
    } else if (type === "video") {
      document.querySelector("#videoLabel .label-text").textContent = "Add more video";
    } else if (type === "file") {
      document.querySelector("#fileLabel .label-text").textContent = "Add more file";
    }
  }

  imageInput.addEventListener('change', () => handleFiles(imageInput, 'image', previewImages, 10));
  videoInput.addEventListener('change', () => handleFiles(videoInput, 'video', previewVideos, 10));
  fileInput.addEventListener('change', () => handleFiles(fileInput, 'file', previewFiles, 5));

  const postForm = document.querySelector('.post-form');
  postForm.addEventListener('submit', e => {
    e.preventDefault();

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      alert('You must be logged in to post.');
      window.location.href = "register_login.html";
      return;
    }

    const text = postForm.querySelector('textarea').value.trim();
    if (!text) {
      alert('Please write something before posting.');
      return;
    }

    // Prepare new post object
    const newPost = {
      id: Date.now().toString(), // unique ID
      user: currentUser,
      owner: currentUser,
      category: "general",  // since posting.html is for general
      text: text,
      imageURL: previewImages.querySelector("img") ? previewImages.querySelector("img").src : "",
      pdfURL: "",   // for now only file attachments
      pdfName: "",
      liked: false,
      comments: []
    };

    // Handle file (if attached)
    const filePreview = previewFiles.querySelector(".file-name");
    if (filePreview) {
      newPost.pdfName = filePreview.textContent;
      newPost.pdfURL = "#"; // or store as blob if you want real download
    }

    // Save to localStorage
    let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];
    allPosts.push(newPost);
    localStorage.setItem("allPosts", JSON.stringify(allPosts));

    // Redirect to general.html
    window.location.href = "general.html";
  });

});