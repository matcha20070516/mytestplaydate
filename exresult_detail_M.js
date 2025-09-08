window.onload = () => {
  const answers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
  const correctAnswers = [
    "3", "たにそこ", "はんたい", "おろそか", "こまいぬ",
    "ちくせき", "ユニオン", "ホエール", "はんらん", "がんばん",
    "たつじん", "とのさま", "かけごえ", "てきかく", "ドリーム",
    "みさんが", "ながさき", "いせえび", "はだいろ", "かいどく"
  ];
  const pointsPerQuestion = [
    2, 3, 6, 3, 4,
    4, 4, 4, 6, 6,
    6, 3, 3, 4, 6,
    4, 8, 8, 6, 10
  ];
  const tbody = document.querySelector("#detail-table tbody");
  let totalScore = 0;
  let correctCount = 0;

  for (let i = 0; i < correctAnswers.length; i++) {
    const tr = document.createElement("tr");

    const userAns = answers[i] || "";
    const isCorrect = userAns === correctAnswers[i];

    if (isCorrect) {
      tr.classList.add("correct");
      totalScore += pointsPerQuestion[i];
      correctCount++;
    } else {
      tr.classList.add("incorrect");
    }

    tr.innerHTML = `
    <td>第${i + 1}問</td>
    <td>${userAns || "（無記入）"}</td>
    <td>${correctAnswers[i]}</td>
    <td>${pointsPerQuestion[i]}</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById("result-summary").textContent = `正解数：${correctCount} / ${correctAnswers.length} 問, 合計得点：${totalScore} 点`;
};

const backBtn = document.getElementById("back-to-result");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "exresult.html"; // ←サマリーに戻る
  });
}
