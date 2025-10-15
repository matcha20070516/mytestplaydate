const total = 20;
let current = 1;
const TOTAL_TIME = 30 * 60; // 30分（秒）
let startTime; // 開始時刻

const answers = Array(total).fill("");

// --- 傾斜配点（例） ---
const pointsPerQuestion = [
  1, 2, 3, 2, 2,
  2, 2, 3, 3, 3,
  3, 1, 2, 2, 3,
  2, 4, 4, 3, 5
];

// --- 正答リスト ---
const correctAnswers = [
  "3", "たにそこ", "はんたい", "おろそか", "こまいぬ",
  "ちくせき", "ユニオン", "ホエール", "はんらん", "がんばん",
  "たつじん", "とのさま", "かけごえ", "てきかく", "ドリーム",
  "みさんが", "ながさき", "いせえび", "はだいろ", "かいどく"
];

// --- 解答形式指定 ---
const answerFormats = [
  "半角数字", "ひらがな", "ひらがな", "ひらがな", "ひらがな",
  "ひらがな", "カタカナ", "カタカナ", "ひらがな", "ひらがな",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな"
];

let timerInterval = null;

// --- 結果ロック確認 ---
const isLocked = () => localStorage.getItem("exResultLocked") === "true";

// --- 形式チェック ---
const isValidFormat = (answer, format) => {
  if (!answer || answer.trim() === "") return true;

  switch (format) {
    case "半角数字":
      return /^[0-9]+$/.test(answer);
    case "ひらがな":
      return /^[ぁ-ん]+$/.test(answer);
    case "カタカナ":
      return /^[ァ-ヶー]+$/.test(answer);
    case "漢字":
      return /^[一-龯]+$/.test(answer);
    case "英字":
      return /^[a-zA-Z]+$/.test(answer);
    default:
      return true;
  }
};

// --- 重み式による級判定関数 ---
const getGrade = (score, pointsPerQuestion) => {
  const maxScore = pointsPerQuestion.reduce((a, b) => a + b, 0);
  const ratio = score / maxScore;

  const thresholds = [
    { name: "1級", num: 1, minRatio: 1.00 },
    { name: "準1級", num: 2, minRatio: 0.90 },
    { name: "2級", num: 3, minRatio: 0.80 },
    { name: "準2級", num: 4, minRatio: 0.70 },
    { name: "3級", num: 5, minRatio: 0.60 },
    { name: "4級", num: 6, minRatio: 0.50 },
    { name: "5級", num: 7, minRatio: 0.40 },
    { name: "6級", num: 8, minRatio: 0.30 },
    { name: "7級", num: 9, minRatio: 0.20 },
    { name: "8級", num: 10, minRatio: 0.00 }
  ];

  for (const t of thresholds) {
    if (ratio >= t.minRatio) return t;
  }
  return thresholds[thresholds.length - 1];
};

// --- 新規スタート処理 ---
const isFreshStart = localStorage.getItem("exFreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem("exFreshStart");
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exStartTime");
  localStorage.removeItem("exAnswers");

  startTime = Date.now();
  localStorage.setItem("exStartTime", startTime);
} else {
  startTime = parseInt(localStorage.getItem("exStartTime") || Date.now());
  const savedCurrent = parseInt(localStorage.getItem("exCurrent") || "1", 10);
  current = savedCurrent;

  const savedAnswers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
  for (let i = 0; i < savedAnswers.length; i++) {
    answers[i] = savedAnswers[i] || "";
  }
}

// --- タイマー更新 ---
const updateTimer = () => {
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const remainingSec = TOTAL_TIME - elapsedSec;

  if (remainingSec <= 0) {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "終了";
    timeUp();
    return;
  }

  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  document.getElementById("timer").textContent =
    `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  localStorage.setItem("exElapsedTime", elapsedSec);
};

// ページ読み込み時に保存された残り時間を読み込み
const savedTime = localStorage.getItem(`exam_timeLeft_${setName}`);
if (savedTime !== null) {
  timeLeft = parseInt(savedTime, 10);
}

// --- 自動セーブ ---
const autoSaveState = () => {
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exCurrent", current.toString());
};

// --- 問題読み込み ---
const loadQuestion = () => {
  document.getElementById("question-num").textContent = `第${current}問`;
  document.getElementById("quiz-img").src = `mq${current}.PNG`;
  document.getElementById("answer").value = answers[current - 1] || "";

  const formatSpan = document.getElementById("answer-format");
  formatSpan.textContent = answerFormats[current - 1] || "";

  document.getElementById("answer").disabled = isLocked();

  checkCurrentAnswerFormat();

  updateNavButtons();
  updateChapters();

  if (current < total) {
    const nextImg = new Image();
    nextImg.src = `mq${current + 1}.PNG`;
  }
  if (current > 1) {
    const prevImg = new Image();
    prevImg.src = `mq${current - 1}.PNG`;
  }
};

// --- 解答入力時の形式チェック ---
const checkCurrentAnswerFormat = () => {
  const answerInput = document.getElementById("answer");
  const formatSpan = document.getElementById("answer-format");
  const currentAnswer = answerInput.value.trim();
  const currentFormat = answerFormats[current - 1];

  if (currentAnswer && !isValidFormat(currentAnswer, currentFormat)) {
    answerInput.style.borderColor = "#e53935";
    answerInput.style.backgroundColor = "#ffebee";
    formatSpan.style.color = "#e53935";
  } else {
    answerInput.style.borderColor = "#ccc";
    answerInput.style.backgroundColor = "white";
    formatSpan.style.color = "#666";
  }
};

// --- ナビゲーション更新 ---
const updateNavButtons = () => {
  document.getElementById("back-btn").style.visibility = current > 1 ? "visible" : "hidden";
  document.getElementById("forward-btn").style.visibility = current < total ? "visible" : "hidden";
};

// --- チャプター更新 ---
const updateChapters = () => {
  const chapterContainer = document.getElementById("chapters");
  chapterContainer.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}`;
    btn.className = "chapter-btn";

    if (i + 1 === current) btn.classList.add("current");

    if (answers[i].trim() !== "") {
      if (isValidFormat(answers[i], answerFormats[i])) {
        btn.classList.add("answered");
      } else {
        btn.classList.add("invalid");
      }
    }

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

// --- スコア計算 ---
const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) =>
    score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
};

// --- 終了処理 ---
const handleExamEnd = (message) => {
  saveCurrentAnswer();

  const username =
    document.getElementById("username-input")?.value ||
    localStorage.getItem("exUsername") ||
    "名無し";

  const setName = "謎検模試_M";
  const score = calculateScore(answers);
  const grade = getGrade(score, pointsPerQuestion); // ← 重み式対応済み

  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", setName);
  localStorage.setItem("exResultLocked", "true");

  localStorage.setItem(`${setName}_completed`, "true");
  localStorage.removeItem("exCurrent");

  alert(message);

  const shareUrl = `https://matcha20070516.github.io/mytestplaydate/share/grade-${grade.num}.html`;

  const params = new URLSearchParams({
    grade: grade.name,
    score: score,
    set: setName,
    shareUrl: shareUrl
  });
  location.href = `exresult_grade${grade.num}.html?${params.toString()}`;
};

// --- 終了確認 ---
const confirmAndFinish = () => {
  let invalidCount = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i].trim() !== "" && !isValidFormat(answers[i], answerFormats[i])) {
      invalidCount++;
    }
  }

  if (invalidCount > 0) {
    const confirmMsg = `解答形式が正しくない問題が${invalidCount}問あります。\nこのまま終了しますか？`;
    if (!confirm(confirmMsg)) return;
  }

  document.getElementById("confirm-overlay").style.display = "flex";
};

const timeUp = () => handleExamEnd("時間切れです。結果画面に移動します。");
const finishExam = () => handleExamEnd("結果画面に遷移します。");

document.addEventListener("keydown", (e) => {
  if (isLocked()) return;
  if (e.key === "ArrowLeft" && current > 1) back();
  if (e.key === "ArrowRight" && current < total) forward();
});

window.onload = () => {
  if (isLocked()) {
    const lockNotice = document.createElement("p");
    lockNotice.textContent = "この模試の結果は確定済みです。解答を変更できません。";
    lockNotice.style.color = "red";
    document.querySelector(".quiz-area")?.prepend(lockNotice);

    const elapsed = parseInt(localStorage.getItem("exElapsedTime") || "0", 10);
    const fixedTimeLeft = TOTAL_TIME - elapsed;
    const m = Math.floor(fixedTimeLeft / 60);
    const s = fixedTimeLeft % 60;
    document.getElementById("timer").textContent =
      `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    loadQuestion();
  } else {
    loadQuestion();
    updateTimer();
    timerInterval = setInterval(updateTimer, 100);
    setInterval(autoSaveState, 1000);

    const answerInput = document.getElementById("answer");
    let composing = false;

    answerInput.addEventListener("compositionstart", () => {
      composing = true;
    });
    answerInput.addEventListener("compositionend", () => {
      composing = false;
      saveCurrentAnswer();
      checkCurrentAnswerFormat();
      updateChapters();
    });
    answerInput.addEventListener("input", () => {
      if (!composing) {
        saveCurrentAnswer();
        checkCurrentAnswerFormat();
        updateChapters();
      }
    });
  }

  const reviewMode = localStorage.getItem("exReviewMode") === "true";
  const submitBtn = document.getElementById("submit-btn");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  if (reviewMode) {
    if (submitBtn) submitBtn.onclick = finishExam;
    const overlay = document.getElementById("confirm-overlay");
    if (overlay) overlay.style.display = "none";
  } else {
    if (submitBtn) submitBtn.onclick = confirmAndFinish;
    if (confirmYes) confirmYes.onclick = finishExam;
    if (confirmNo) confirmNo.onclick = () => {
      document.getElementById("confirm-overlay").style.display = "none";
    };
  }
};
