// 로그인 여부 확인 (방식 확정되면 이 함수만 수정)
function isLoggedIn() {
  return document.getElementById("buyBtn").dataset.loggedIn === "true";
}

async function handleBuy() {
  const btn = document.getElementById("buyBtn");

  if (!isLoggedIn()) {
    if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동할까요?")) {
      const back = encodeURIComponent(location.pathname + location.search);
      location.href = `/login?redirect=${back}`;
    }
    return;
  }

  if (!confirm("이 상품을 구매하시겠습니까?")) return;

  try {
    const res = await fetch(`/buy_item/${encodeURIComponent(btn.dataset.name)}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      alert("구매되었습니다!");
      btn.textContent = "구매완료";
      btn.disabled = true;
    } else if (res.status === 409) {
      alert("이미 판매된 상품입니다.");
      location.reload();
    } else if (res.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    } else {
      alert("구매 처리 중 문제가 생겼습니다.");
    }
  } catch (e) {
    alert("네트워크 오류가 발생했습니다.");
  }
}

function goBack() {
  if (document.referrer || window.history.length > 1) {
    history.back();
  } else {
    location.href = "/products"; // TODO: 상품 목록 페이지 주소 확인
  }
}

document.getElementById("buyBtn").addEventListener("click", handleBuy);
document.getElementById("backBtn").addEventListener("click", goBack);