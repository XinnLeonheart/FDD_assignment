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
    const text = postForm.querySelector('textarea').value;
    if (!text.trim()) {
      alert('Please write something before posting.');
      return;
    }
    alert('Your post has been submitted!');
    postForm.reset();
    previewImages.innerHTML = '';
    previewVideos.innerHTML = '';
    previewFiles.innerHTML = '';

    // Reset labels
    document.querySelector("#imageLabel .label-text").textContent = "Add image";
    document.querySelector("#videoLabel .label-text").textContent = "Add video";
    document.querySelector("#fileLabel .label-text").textContent = "Add file";
  });
});
