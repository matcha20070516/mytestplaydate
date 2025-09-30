window.addEventListener("DOMContentLoaded", () => {
  const setName = localStorage.getItem("currentExamSet") || "";
  const prefix = `ex_${setName}_`;

  const username = localStorage.getItem(`${prefix}Username`) || "名無し";
  const score = localStorage.getItem(`${prefix}Score`) || localStorage.getItem("exScore") || "0";
  const displaySetName = localStorage.getItem(`${prefix}SetName`) || setName;
  const attemptCount = localStorage.getItem(`${prefix}AttemptCount`) || "1";

  document.getElementById("username").textContent = username;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;
  document.getElementById("setname").textContent = displaySetName;

 const reviewBtn = document.getElementById("review-btn");
if (reviewBtn) {
  reviewBtn.addEventListener("click", () => {
    localStorage.setItem("exReviewMode", "true");
    localStorage.setItem("exCurrent", "1"); // 1問目から開始

    // 🔹 prefix付きの SetName を参照
    const currentExamSet = localStorage.getItem("currentExamSet");
    const setName = localStorage.getItem(`ex_${currentExamSet}_SetName`);

    let targetPage = "";
    switch (setName) {
      case "謎検模試_M":
        targetPage = "exproblem_set1.html";
        break;
      case "謎検模試test":
        targetPage = "exproblem_set2.html";
        break;
      case "謎検模試_set3":
        targetPage = "exproblem_set3.html";
        break;
      default:
        targetPage = "exproblem_set1.html"; // fallback
        break;
    }

    window.location.href = targetPage;
  });
}
  const tweetText = encodeURIComponent(
    `『${displaySetName}』の結果は【${score}点】でした！ #謎解き #TExAM`
  );
  document.getElementById("share-link").href = `https://twitter.com/intent/tweet?text=${tweetText}`;

  // detailリンク
  let detailPage = "exresult_detail_M.html";
  if (setName.includes("ろい")) {
    detailPage = "exresult_detail_ろい.html";
  } else if (setName.includes("set3")) {
    detailPage = "exresult_detail_set3.html";
  }
  const detailLink = document.getElementById("detail-link");
  if (detailLink) {
    detailLink.href = detailPage;
  }
});
