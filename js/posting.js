document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('attachImage');
  const videoInput = document.getElementById('attachVideo');
  const fileInput = document.getElementById('attachFile');

  const previewImages = document.getElementById('previewImages');
  const previewVideos = document.getElementById('previewVideos');
  const previewFiles = document.getElementById('previewFiles');

  // Category selection
  let selectedCategory = "general"; // default category
  const categoryButtons = document.querySelectorAll(".category-btn");
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
    });
  });

  // ---------- File Preview ----------
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

    if (currentCount + newFiles.length > maxCount) {
      alert(`You can only upload up to ${maxCount} ${type}${maxCount > 1 ? 's' : ''}.`);
      input.value = '';
      return;
    }

    newFiles.forEach((file) => {
      container.appendChild(createPreviewItem(type, file));
    });

    input.value = '';

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

  // ---------- Handle Post Submission ----------
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

    // New post object with category
    const newPost = {
      id: Date.now().toString(),
      user: currentUser,
      owner: currentUser,
      category: selectedCategory,
      text: text,
      images: [],     
      videos: [],     
      files: [],
      liked: false,
      comments: []
    };

    // Images
    previewImages.querySelectorAll("img").forEach(img => {
      newPost.images.push(img.src);
    });

    // Fixed Videos (convert to base64 before saving)
    const videoFiles = videoInput.files;
    if (videoFiles.length > 0) {
      let processed = 0;
      Array.from(videoFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPost.videos.push(reader.result); // Save as base64 string
          processed++;
          if (processed === videoFiles.length) {
            savePost(newPost);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      previewVideos.querySelectorAll("video").forEach(video => {
        newPost.videos.push(video.src);
      });
      savePost(newPost);
    }

    // Files
    previewFiles.querySelectorAll(".file-name").forEach(fileSpan => {
      newPost.files.push({
        name: fileSpan.textContent,
        url: "#"
      });
    });

    const filePreview = previewFiles.querySelector(".file-name");
    if (filePreview) {
      newPost.pdfName = filePreview.textContent;
      newPost.pdfURL = "#";
    }
  });

  function savePost(newPost) {
    let allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];
    allPosts.push(newPost);
    localStorage.setItem("allPosts", JSON.stringify(allPosts));
    window.location.href = "general.html";
  }
});

