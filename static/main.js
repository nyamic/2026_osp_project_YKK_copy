document.addEventListener("DOMContentLoaded", function () {

    const images = [
        "/static/images/product1.jpg",
        "/static/images/product2.png",
        "/static/images/product3.jpg"
    ];

    const mainImage = document.getElementById("productMainImage");
    const imageCount = document.getElementById("imageCount");

    const prevButton = document.querySelector(".image-prev");
    const nextButton = document.querySelector(".image-next");

    if (!mainImage || !imageCount || !prevButton || !nextButton) {
        return;
    }

    let currentIndex = 0;

    // 이미지와 개수 표시 변경
    function updateImage() {
        mainImage.src = images[currentIndex];
        imageCount.textContent =
            `${currentIndex + 1}/${images.length}`;
    }

    // 이전 이미지
    prevButton.addEventListener("click", function () {
        currentIndex =
            (currentIndex - 1 + images.length) % images.length;

        updateImage();
    });

    // 다음 이미지
    nextButton.addEventListener("click", function () {
        currentIndex =
            (currentIndex + 1) % images.length;

        updateImage();
    });

});