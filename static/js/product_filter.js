document.addEventListener("DOMContentLoaded", function () {
    const openButton = document.getElementById("filterOpenButton");
    const detail = document.getElementById("filterDetail");

    const sortFilter = document.getElementById("sortFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    const minPrice = document.getElementById("minPrice");
    const maxPrice = document.getElementById("maxPrice");

    const resetButton = document.getElementById("filterResetButton");
    const applyButton = document.getElementById("filterApplyButton");

    const selectedFilters = document.getElementById("selectedFilters");

    const conditionCheckboxes = [
        ...document.querySelectorAll(".condition-checkbox")
    ];

    const locationCheckboxes = [
        ...document.querySelectorAll(".location-checkbox")
    ];

    // 상세 필터 열기 / 닫기
    openButton.addEventListener("click", function () {
        detail.hidden = !detail.hidden;
    });

    // 필터 적용
    applyButton.addEventListener("click", function () {
        const min = Number(minPrice.value);
        const max = maxPrice.value === ""? null: Number(maxPrice.value);

        // 가격 유효성 검사
        if (minPrice.value === "" || min < 0) {
            alert("최저 가격은 0원 이상이어야 합니다.");
            minPrice.focus();
            return;
        }

        if (max !== null && (max < 0 || min > max)) {
            alert("최저 가격은 최고 가격보다 클 수 없습니다.");
            maxPrice.focus();
            return;
        }

        const conditions = Array.from(
            document.querySelectorAll(".condition-checkbox:checked")
        ).map(checkbox => checkbox.value);

        const locations = Array.from(
            document.querySelectorAll(".location-checkbox:checked")
        ).map(checkbox => checkbox.value);

        const filters = [];

        filters.push(
            "가격: " + min + "원 ~ " +
            (max === null ? "제한 없음" : max + "원")
        );

        filters.push(
            "제품 상태: " +
            (conditions.length === 0
            ? "선택 없음"
            : conditions.join(", "))
        );

        filters.push(
            "거래 위치: " +
            (locations.length === 0
                ? "선택 없음"
                : locations.join(", "))
        );

        selectedFilters.innerHTML = "";

        filters.forEach(filter => {
            const tag = document.createElement("span");
            tag.className = "selected-filter-tag";
            tag.textContent = filter;
            selectedFilters.appendChild(tag);
        });

        detail.hidden = true;

        alert("필터 선택이 적용되었습니다.");
    });

    // 초기화
    resetButton.addEventListener("click", function () {
        sortFilter.value = "default";
        categoryFilter.value = "all";

        minPrice.value = 0;
        maxPrice.value = "";

        conditionCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        locationCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        selectedFilters.innerHTML = "";
    });
});