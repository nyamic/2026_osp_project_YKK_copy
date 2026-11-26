document.addEventListener("DOMContentLoaded", function () {

    // 상품 카드의 하트 상태 초기화
    window.initializeProductLikes = function () {
        const buttons = document.querySelectorAll(
            "#productResults .like-button"
        );

        buttons.forEach(async button => {
            if (button.dataset.initialized === "true") {
                return;
            }

            button.dataset.initialized = "true";
            button.disabled = true;

            const productName = button.dataset.productName;
            const icon = button.querySelector(".like-icon");

            const url = `/item_like/${encodeURIComponent(productName)}`;

            function showLikeState(liked) {
                button.dataset.liked = String(liked);

                icon.src = liked
                    ? "/static/images/heart_filled.png"
                    : "/static/images/heart_empty.png";
            }

            try {
                const response = await fetch(url);

                if (response.status === 401) {
                    showLikeState(false);
                    button.disabled = false;
                    return;
                }

                if (!response.ok) {
                    throw new Error("찜 상태를 불러오지 못했습니다.");
                }

                const data = await response.json();

                showLikeState(data.liked);
                button.disabled = false;

            } catch (error) {
                console.error(error);
                button.disabled = true;
            }
        });
    };

    // 하트 클릭 이벤트
    document.addEventListener("click", async function (event) {
        const button = event.target.closest(
            "#productResults .like-button"
        );

        if (!button || button.disabled) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const productName = button.dataset.productName;
        const nextState = button.dataset.liked !== "true";

        const url = `/item_like/${encodeURIComponent(productName)}`;

        button.disabled = true;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    liked: nextState
                })
            });

            if (response.status === 401) {
                alert("로그인 후 이용할 수 있습니다.");
                return;
            }

            if (!response.ok) {
                throw new Error("찜 상태 변경에 실패했습니다.");
            }

            // 현재 필터와 정렬을 유지하면서 목록 갱신
            if (window.loadProductResults) {
                await window.loadProductResults(
                    window.currentProductUrl || "/products"
                );
            }

        } catch (error) {
            console.error(error);
            alert(error.message);

        } finally {
            button.disabled = false;
        }
    });

    // 최초 상품 목록의 하트 상태 확인
    window.initializeProductLikes();
});