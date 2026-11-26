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

    // 현재 상품 목록에 적용된 요청 URL
    let currentProductUrl = "/products";

    // URL의 필터 조건을 입력창에 반영
    function restoreFilters(url) {
        const params = new URL(url, window.location.origin).searchParams;

        sortFilter.value = params.get("sort") || "default";
        categoryFilter.value = params.get("category") || "all";

        minPrice.value = params.get("min_price") ?? "0";
        maxPrice.value = params.get("max_price") || "";

        if (params.has("condition")) {
            const conditions = params.getAll("condition");

            conditionCheckboxes.forEach(checkbox => {
                checkbox.checked = conditions.includes(checkbox.value);
            });
        } else {
            conditionCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }

        if (params.has("location")) {
            const locations = params.getAll("location");

            locationCheckboxes.forEach(checkbox => {
                checkbox.checked = locations.includes(checkbox.value);
            });
        } else {
            locationCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }

        renderSelectedFilters();
    }

    // 선택한 세부 필터 표시
    function renderSelectedFilters() {
        selectedFilters.innerHTML = "";

        // 필터 그룹별 표시 요소 생성
        function addFilterTag(label, value, filterType) {
            const tag = document.createElement("div");
            tag.className = "selected-filter-tag";

            const text = document.createElement("span");
            text.textContent = `${label} : ${value}`;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "selected-filter-remove";
            removeButton.dataset.filter = filterType;
            removeButton.textContent = "×";
            removeButton.setAttribute(`${"aria-label"}`, `${label} 필터 취소`);

            tag.appendChild(text);
            tag.appendChild(removeButton);
            selectedFilters.appendChild(tag);
        }

        // 1. 가격 범위
        const min = Number(minPrice.value || 0);
        const max = maxPrice.value;

        // 기본값인 0원~제한 없음이면 표시하지 않음
        if (min !== 0 || max !== "") {
            const minText = min.toLocaleString();
            const maxText = max
                ? Number(max).toLocaleString()
                : "제한 없음";

            addFilterTag(
                "가격 범위",
                `${minText}~${maxText}원`,
                "price"
            );
        }

        // 2. 상품 상태
        const conditionNames = {
            "new": "새상품",
            "like-new": "거의 새 것",
            "used": "사용감 있음"
        };

        const selectedConditions = conditionCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => conditionNames[checkbox.value]);

        // 전체 선택 상태가 아닐 때만 표시
        if (selectedConditions.length !== conditionCheckboxes.length) {
            addFilterTag(
                "상품 상태",
                selectedConditions.length > 0
                    ? selectedConditions.join(", ")
                    : "선택 없음",
                "condition"
            );
        }

        // 3. 거래 장소
        const locationNames = {
            "ecc": "ECC",
            "학관": "학관",
            "아산공학관": "아산공학관"
        };

        const selectedLocations = locationCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => locationNames[checkbox.value]);

        // 전체 선택 상태가 아닐 때만 표시
        if (selectedLocations.length !== locationCheckboxes.length) {
            addFilterTag(
                "거래 장소",
                selectedLocations.length > 0
                    ? selectedLocations.join(", ")
                    : "선택 없음",
                "location"
            );
        }
    }

    // 선택한 필터 그룹의 X 버튼 클릭
    selectedFilters.addEventListener("click", function (event) {
        const removeButton = event.target.closest(
            ".selected-filter-remove"
        );

        if (!removeButton) {
            return;
        }

        const filterType = removeButton.dataset.filter;

        if (filterType === "price") {
            // 가격 범위 초기화
            minPrice.value = "0";
            maxPrice.value = "";
        }

        else if (filterType === "condition") {
            // 상품 상태 전체 선택
            conditionCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }

        else if (filterType === "location") {
            // 거래 장소 전체 선택
            locationCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }

        // 선택 표시 갱신 후 상품 목록 AJAX 갱신
        applyFilters();
    });

    // 필터 조건으로 요청 URL 생성
    function makeFilterUrl() {
        const min = Number(minPrice.value);
        const max = maxPrice.value === "" ? null : Number(maxPrice.value);

        if (minPrice.value === "" || !Number.isFinite(min) || min < 0) {
            alert("최저 가격은 0원 이상이어야 합니다.");
            minPrice.focus();
            return null;
        }

        if (
            max !== null &&
            (!Number.isFinite(max) || max < 0 || min > max)
        ) {
            alert("최저 가격은 최고 가격보다 클 수 없습니다.");
            maxPrice.focus();
            return null;
        }

        const params = new URLSearchParams();

        params.set("sort", sortFilter.value);
        params.set("category", categoryFilter.value);
        params.set("min_price", minPrice.value);

        if (maxPrice.value !== "") {
            params.set("max_price", maxPrice.value);
        }

        const conditions = conditionCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const locations = locationCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        if (conditions.length === 0) {
            params.append("condition", "__none__");
        } else {
            conditions.forEach(value => {
                params.append("condition", value);
            });
        }

        if (locations.length === 0) {
            params.append("location", "__none__");
        } else {
            locations.forEach(value => {
                params.append("location", value);
            });
        }

        params.set("page", "1");

        return "/products?" + params.toString();
    }

    // AJAX로 상품 목록 갱신
    async function loadProductResults(url) {
        const results = document.getElementById("productResults");

        try {
            results.style.opacity = "0.5";

            const response = await fetch(url);

            if (!response.ok && response.status !== 503) {
                throw new Error("상품 목록을 불러오지 못했습니다.");
            }

            const html = await response.text();

            const parser = new DOMParser();
            const parsedDocument = parser.parseFromString(
                html,
                "text/html"
            );

            const newResults = parsedDocument.getElementById(
                "productResults"
            );

            if (!newResults) {
                throw new Error("상품 목록 영역을 찾을 수 없습니다.");
            }

            results.innerHTML = newResults.innerHTML;

            // 현재 필터 조건을 유지
            currentProductUrl = url;
            window.currentProductUrl = currentProductUrl;

            // 새 상품 카드의 하트 상태 초기화
            if (window.initializeProductLikes) {
                window.initializeProductLikes();
            }

        } catch (error) {
            console.error(error);
            alert(error.message);

        } finally {
            results.style.opacity = "1";
        }
    }

    // 하트 기능에서도 현재 필터 URL을 사용할 수 있도록 공개
    window.loadProductResults = loadProductResults;
    window.currentProductUrl = currentProductUrl;

    // 필터 적용
    function applyFilters() {
        const url = makeFilterUrl();

        if (url) {
            renderSelectedFilters();
            loadProductResults(url);

            // 필터 적용 후 상세 필터 닫기
            detail.hidden = true;
        }
    }

    // 상세 필터 열기 / 닫기
    openButton.addEventListener("click", function () {
        detail.hidden = !detail.hidden;
    });

    // 상세 필터 적용 버튼: 적용 후 닫기
    applyButton.addEventListener("click", function () {
        applyFilters(true);
    });

    // 정렬 변경: 필터 창 유지
    sortFilter.addEventListener("change", function () {
        applyFilters();
    });

    // 카테고리 변경: 필터 창 유지
    categoryFilter.addEventListener("change", function () {
        applyFilters();
    });

    // 필터 초기화
    resetButton.addEventListener("click", function () {
        sortFilter.value = "default";
        categoryFilter.value = "all";

        minPrice.value = "0";
        maxPrice.value = "";

        conditionCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        locationCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        renderSelectedFilters();

        currentProductUrl = "/products";
        window.currentProductUrl = currentProductUrl;

        loadProductResults("/products");
        detail.hidden = true;
    });

    // 페이지네이션 AJAX 처리
    document.addEventListener("click", function (event) {
        const button = event.target.closest(
            ".product-pagination button[name='page']"
        );

        if (!button || button.disabled) {
            return;
        }

        event.preventDefault();

        const params = new URLSearchParams(
            currentProductUrl.split("?")[1] || ""
        );

        params.set("page", button.value);

        const url = "/products?" + params.toString();

        loadProductResults(url);
    });

    // 최초 화면의 필터 상태 표시
    restoreFilters(window.location.href);
});