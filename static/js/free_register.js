const imageInput = document.getElementById("free-image");
const imagePreview = document.getElementById("free-image-preview");
const imageCount = document.getElementById("image-count");
const prevButton = document.getElementById("image-prev");
const nextButton = document.getElementById("image-next");

let selectedFiles = [];
let currentIndex = 0;

function updatePreview() {
  if (selectedFiles.length === 0) {
    imagePreview.removeAttribute("src");
    imagePreview.style.display = "none";
    imageCount.textContent = "0 / 0";
    return;
  }

  imagePreview.src = URL.createObjectURL(selectedFiles[currentIndex]);
  imagePreview.style.display = "block";

  imageCount.textContent = `${currentIndex + 1} / ${selectedFiles.length}`;
}

imageInput.addEventListener("change", function () {
  const newFiles = Array.from(this.files);
  const validFiles = newFiles.filter((file) => file.type.startsWith("image/"));

  if (validFiles.length !== newFiles.length) {
    alert("이미지 파일만 선택해 주세요.");
  }

  if (validFiles.length === 0) return;

  const previousLength = selectedFiles.length;
  selectedFiles = [...selectedFiles, ...validFiles];

  const dataTransfer = new DataTransfer();

  selectedFiles.forEach((file) => {
    dataTransfer.items.add(file);
  });

  imageInput.files = dataTransfer.files;

  currentIndex = previousLength;
  updatePreview();
});

prevButton.addEventListener("click", function () {
  if (selectedFiles.length === 0) return;

  currentIndex =
    (currentIndex - 1 + selectedFiles.length) % selectedFiles.length;

  updatePreview();
});

nextButton.addEventListener("click", function () {
  if (selectedFiles.length === 0) return;

  currentIndex = (currentIndex + 1) % selectedFiles.length;

  updatePreview();
});
