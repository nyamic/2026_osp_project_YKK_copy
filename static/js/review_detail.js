document.addEventListener("DOMContentLoaded", function () {

    const box = document.querySelector(".review-detail-image");
    const mainImage = document.getElementById("productMainImage");
    const imageCount = document.getElementById("imageCount");

    const prevButton = document.querySelector(".image-prev");
    const nextButton = document.querySelector(".image-next");

    if (!box || !mainImage || !imageCount || !prevButton || !nextButton) {
        return;
    }

    // HTML이 넘겨준 사진 목록 읽기
    const base = box.dataset.base;
    const images = JSON.parse(box.dataset.images).map(name => base + name);

    // 사진이 1장일 경우 버튼 숨기기
    if (images.length <= 1) {
        prevButton.style.display = "none";
        nextButton.style.display = "none";
        return;
    }

    let currentIndex = 0;

    function updateImage() {
        mainImage.src = images[currentIndex];
        imageCount.textContent = `${currentIndex + 1}/${images.length}`;
    }

    prevButton.addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    });

    nextButton.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    });

});
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("helpfulButton");
    if (!btn) return;

    const countEl = btn.querySelector(".helpful-count");
    let busy = false;

    btn.addEventListener("click", async function () {
        if (busy) return;
        busy = true;

        try {
            const res = await fetch(btn.dataset.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add" })
            });
            if (!res.ok) throw new Error("fail");

            const data = await res.json();
            countEl.textContent = data.helpful_count;
        } catch (e) {
            alert("잠시 후 다시 시도해 주세요.");
        }

        busy = false;
    });
});