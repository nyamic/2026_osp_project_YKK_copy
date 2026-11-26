/*
document.querySelectorAll(".like-button").forEach(button => {
//const button = document.getElementById("like-button");
//const icon = document.getElementById("like-icon");
//const message = document.getElementById("like-message");

    const productName = button.dataset.productName;
    const icon = button.querySelector(".like-icon");
    const message = button.closest(".product-card").querySelector(".like-message");

    let liked = false;

    // 좋아요 이미지 변경
    function showLikeState(value) {
        liked = value;

        icon.src = liked
            ? "/static/images/heart_filled.png"
            : "/static/images/heart_empty.png";
    }

    // 기존 좋아요 상태 불러오기
    async function loadLikeState() {
        try {
            const response = await fetch(
                "/item_like/${encodeURIComponent(productName)"
            );

            if (response.status === 401) {
                throw new Error("Please log in to use likes.");
            }

            if (!response.ok) {
                throw new Error("Failed to load like state.");
            }

            const data = await response.json();

            showLikeState(data.liked);

            button.disabled = false;

        } catch (error) {
            button.disabled = true;
            message.textContent = error.message;
        }
    }

    // 좋아요 버튼 클릭
    button.addEventListener("click", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        const nextState = !liked;

        message.textContent = "";

        try {
            const response = await fetch(
                "/item_like/${encodeURIComponent(productName)",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({liked: nextState})
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update like.");
            }

            const data = await response.json();

            showLikeState(data.liked);

        } catch (error) {
            message.textContent = error.message;
        }
    });
    // 페이지 로드 시 좋아요 상태 확인
    loadLikeState();
});
*/

document.querySelectorAll(".like-button").forEach(button => {
    const icon = button.querySelector(".like-icon");

    let liked = false;

    button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();

        liked = !liked;

        if (liked) {
            icon.src = "/static/images/heart_filled.png";
        } else {
            icon.src = "/static/images/heart_empty.png";
        }
    });
});