
let current = 1;
let timeLimit = 1 * 60; // 制限時間：30分（秒）

const answers = Array(total).fill("");

// 問題ごとの配点
const pointsPerQuestion = [
  2, 3, 6, 3, 4,
  4, 4, 4, 6, 6,
  6, 3, 3, 4, 6,
  4, 8, 8, 6, 10
];

// 問題ごとの正解
const correctAnswers = [
  "3", "たにそこ", "はんたい", "おろそか", "こまいぬ",
  "ちくせき", "ユニオン", "ホエール", "はんらん", "がんばん",
  "たつじん", "とのさま", "かけごえ", "てきかく", "ドリーム",
  "みさんが", "ながさき", "いせえび", "はだいろ", "かいどく"
];

// 問題ごとの解答形式（ここを変えれば個別設定可能）
const answerFormats = [
  "半角数字", "ひらがな", "ひらがな", "ひらがな", "ひらがな",
  "ひらがな", "カタカナ", "カタカナ", "ひらがな", "ひらがな",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな"
];

let timerInterval = null;

// ロック判定関数
const isLocked = () => localStorage.getItem("exResultLocked") === "true";

// 新規スタート判定
const isFreshStart = localStorage.getItem("exFreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem("exFreshStart");
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exElapsedTime");
  localStorage.removeItem("exAnswers");
} else {
  const savedCurrent = parseInt(localStorage.getItem("exCurrent") || "1", 10);
  current = savedCurrent;

  const savedElapsed = parseInt(localStorage.getItem("exElapsedTime") || "0", 10);
  timeLimit -= savedElapsed;

  const savedAnswers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
  for (let i = 0; i < savedAnswers.length; i++) {
    answers[i] = savedAnswers[i] || "";
  }
}

const updateTimer = () => {
  if (timeLimit <= 0) {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "終了";
    timeUp();
    return;
  }
  const m = Math.floor(timeLimit / 60);
  const s = timeLimit % 60;
  document.getElementById("timer").textContent =
    `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  timeLimit--;

  const elapsed = (30 * 60) - timeLimit;
  localStorage.setItem("exElapsedTime", elapsed);
};

const autoSaveState = () => {
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exCurrent", current.toString());
  localStorage.setItem("exTimeLeft", timeLimit.toString());
};

const loadQuestion = () => {
  document.getElementById("question-num").textContent = `第${current}問`;
  document.getElementById("quiz-img").src = `mq${current}.PNG`;
  document.getElementById("answer").value = answers[current - 1] || "";

  // ここで解答形式表示も更新
  const formatSpan = document.getElementById("answer-format");
  formatSpan.textContent = answerFormats[current - 1] || "";

  // ロック時は入力不可
  document.getElementById("answer").disabled = isLocked();

  updateNavButtons();
  updateChapters();
};

const updateNavButtons = () => {
  document.getElementById("back-btn").style.visibility = current > 1 ? "visible" : "hidden";
  document.getElementById("forward-btn").style.visibility = current < total ? "visible" : "hidden";
};

const updateChapters = () => {
  const chapterContainer = document.getElementById("chapters");
  chapterContainer.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}`;
    btn.className = "chapter-btn";
    if (i + 1 === current) btn.classList.add("current");
    if (answers[i].trim() !== "") btn.classList.add("answered");
    btn.onclick = () => {
      saveCurrentAnswer();
      current = i + 1;
      localStorage.setItem("exCurrent", current.toString());
      loadQuestion();
    };
    chapterContainer.appendChild(btn);
  }
};

const back = () => {
  saveCurrentAnswer();
  if (current > 1) {
    current--;
    localStorage.setItem("exCurrent", current.toString());
    loadQuestion();
  }
};

const forward = () => {
  saveCurrentAnswer();
  if (current < total) {
    current++;
    localStorage.setItem("exCurrent", current.toString());
    loadQuestion();
  }
};

const saveCurrentAnswer = () => {
  answers[current - 1] = document.getElementById("answer").value.trim();
};

const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) =>
    score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
};

const handleExamEnd = (message) => {
  saveCurrentAnswer();

  const username =
    document.getElementById("username-input")?.value ||
    localStorage.getItem("exUsername") ||
    "名無し";

  const setName = localStorage.getItem("exSetName") || "謎検模試セット";

  const score = calculateScore(answers);

  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", setName);
  localStorage.setItem("exResultLocked", "true");

  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exTimeLeft");

window.onload = () => {
  const reviewMode = localStorage.getItem("exReviewMode") === "true";
  if (reviewMode) {
    // タイマー非表示
    const t = document.getElementById("timer");
    if (t) t.style.display = "none";

    // 入力欄を触れなくする
    const ans = document.getElementById("answer");
    if (ans) ans.disabled = true;

    // 「終了」ボタンを隠す
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.style.display = "none";

    // 「結果に戻る」ボタンを左上に追加
    const backBtn = document.createElement("button");
    backBtn.id = "back-to-result";
    backBtn.textContent = "結果に戻る";
    backBtn.style.position = "fixed";
    backBtn.style.top = "12px";
    backBtn.style.left = "12px";
    backBtn.style.zIndex = "1001";
    backBtn.style.padding = "8px 12px";
    document.body.appendChild(backBtn);

    backBtn.addEventListener("click", () => {
      localStorage.removeItem("exReviewMode");
      window.location.href = "exresult_detail_M.html"; // 詳細ページに戻る
    });
  } else {
    // 普通の試験モードの処理（今まで通り）
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    if (submitBtn) submitBtn.onclick = confirmAndFinish;
  }
  loadQuestion();
};
  
  alert(message);
  location.href = "exresult.html";
};
const confirmAndFinish = () => {
  document.getElementById("confirm-overlay").style.display = "flex";
};
const timeUp = () => handleExamEnd("時間切れです。結果画面に移動します。");
const finishExam = () => handleExamEnd("試験終了です。結果画面に遷移します。");

window.onload = () => {
  if (isLocked()) {
    const lockNotice = document.createElement("p");
    lockNotice.textContent = "この模試の結果は確定済みです。解答を変更できません。";
    lockNotice.style.color = "red";
    document.querySelector(".quiz-area")?.prepend(lockNotice);
  }

  loadQuestion();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  setInterval(autoSaveState, 1000);

  document.getElementById("answer").addEventListener("input", () => {
    saveCurrentAnswer();
    updateChapters();
  });

  // 終了確認モーダル関連のイベント登録
  document.getElementById("submit-btn").onclick = confirmAndFinish;
  document.getElementById("confirm-yes").onclick = finishExam;
  document.getElementById("confirm-no").onclick = () => {
    document.getElementById("confirm-overlay").style.display = "none";
  };

  // 問題画像クリックでモーダル拡大
  document.getElementById("quiz-img").addEventListener("click", function () {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modal.style.display = "block";
    modalImg.src = this.src;
  });

  document.getElementById("imageModal").addEventListener("click", function () {
    this.style.display = "none";
  });
};
