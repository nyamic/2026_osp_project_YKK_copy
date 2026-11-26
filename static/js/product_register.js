const imageInput = document.getElementById("product-image");
const imagePreview = document.getElementById("product-image-preview");

imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";
    } else {
        imagePreview.src = "";
        imagePreview.style.display = "none";
    }
});