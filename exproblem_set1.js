// Firebase SDKは別途HTMLで読み込み
// import { getFirestore, doc, setDoc, increment } from "firebase/firestore";

const total = 20;
let current = 1;
const TOTAL_TIME = 30 * 60; // 30分（秒）
let startTime; // 開始時刻

const answers = Array(total).fill("");

const pointsPerQuestion = [
  2, 3, 6, 3, 4,
  4, 4, 4, 6, 6,
  6, 3, 3, 4, 6,
  4, 8, 8, 6, 10
];

const correctAnswers = [
  "3", "たにそこ", "はんたい", "おろそか", "こまいぬ",
  "ちくせき", "ユニオン", "ホエール", "はんらん", "がんばん",
  "たつじん", "とのさま", "かけごえ", "てきかく", "ドリーム",
  "みさんが", "ながさき", "いせえび", "はだいろ", "かいどく"
];

const answerFormats = [
  "半角数字", "ひらがな", "ひらがな", "ひらがな", "ひらがな",
  "ひらがな", "カタカナ", "カタカナ", "ひらがな", "ひらがな",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな"
];

let timerInterval = null;

const isLocked = () => localStorage.getItem("exResultLocked") === "true";

const isValidFormat = (answer, format) => {
  if (!answer || answer.trim() === "") return true;
  
  switch(format) {
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

// 級判定関数
const getGrade = (score) => {
  const s = parseInt(score);
  if (s === 100) return { name: "1級", num: 1 };
  if (s >= 90) return { name: "準1級", num: 2 };
  if (s >= 80) return { name: "2級", num: 3 };
  if (s >= 70) return { name: "準2級", num: 4 };
  if (s >= 60) return { name: "3級", num: 5 };
  if (s >= 50) return { name: "4級", num: 6 };
  if (s >= 40) return { name: "5級", num: 7 };
  if (s >= 30) return { name: "6級", num: 8 };
  if (s >= 20) return { name: "7級", num: 9 };
  return { name: "8級", num: 10 };
};

// 新規スタート判定
const isFreshStart = localStorage.getItem("exFreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem("exFreshStart");
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exStartTime");
  localStorage.removeItem("exAnswers");
  
  // 新規開始時刻を記録
  startTime = Date.now();
  localStorage.setItem("exStartTime", startTime);
} else {
  // 保存された開始時刻を取得
  startTime = parseInt(localStorage.getItem("exStartTime") || Date.now());
  
  const savedCurrent = parseInt(localStorage.getItem("exCurrent") || "1", 10);
  current = savedCurrent;

  const savedAnswers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
  for (let i = 0; i < savedAnswers.length; i++) {
    answers[i] = savedAnswers[i] || "";
  }
}

const updateTimer = () => {
  // 経過時間を計算（ミリ秒→秒）
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
  
  // 経過時間を保存（結果画面用）
  localStorage.setItem("exElapsedTime", elapsedSec);
};

const autoSaveState = () => {
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exCurrent", current.toString());
};

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
  
  // 次の問題の画像をプリロード
  if (current < total) {
    const nextImg = new Image();
    nextImg.src = `mq${current + 1}.PNG`;
  }
  if (current > 1) {
    const prevImg = new Image();
    prevImg.src = `mq${current - 1}.PNG`;
  }
};

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

const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) =>
    score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
};

// ========================================
// 【追加】問題ごとの正答率を記録する関数
// ========================================
async function saveQuestionStats(userAnswers, setName) {
  // window.dbがFirestoreインスタンス
  if (!window.db) {
    console.log("Firestore未接続 - 統計保存スキップ");
    return;
  }
  
  try {
    const { doc, setDoc, increment } = window.firestoreAPI;
    
    // 各問題ごとに統計を更新
    for (let i = 0; i < userAnswers.length; i++) {
      const questionNum = i + 1;
      const userAnswer = userAnswers[i].trim();
      const correctAnswer = correctAnswers[i];
      const isCorrect = userAnswer === correctAnswer;
      
      // 問題ごとの統計ドキュメント
      const questionStatsRef = doc(window.db, "questionStats", `${setName}_q${questionNum}`);
      
      // 正答数・総解答数を更新
      await setDoc(questionStatsRef, {
        setName: setName,
        questionNum: questionNum,
        totalAttempts: increment(1),
        correctCount: increment(isCorrect ? 1 : 0),
        lastUpdated: new Date()
      }, { merge: true });
    }
    
    console.log("✅ 問題ごとの統計を保存しました");
  } catch (error) {
    console.error("統計保存エラー:", error);
  }
}
// ========================================

const handleExamEnd = async (message) => {
  saveCurrentAnswer();

  const username =
    document.getElementById("username-input")?.value ||
    localStorage.getItem("exUsername") ||
    "名無し";

  const setName = "謎検模試_M";
  const score = calculateScore(answers);
  const grade = getGrade(score);

  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", setName);
  localStorage.setItem("exResultLocked", "true");
  
  // 受験済みフラグを保存
  localStorage.setItem(`${setName}_completed`, "true");

  localStorage.removeItem("exCurrent");

  // ========================================
  // 【追加】問題ごとの統計を保存
  // ========================================
  await saveQuestionStats(answers, setName);
  // ========================================

  const reviewMode = localStorage.getItem("exReviewMode") === "true";
  if (reviewMode) {
    const t = document.getElementById("timer");
    if (t) t.style.display = "none";

    const ans = document.getElementById("answer");
    if (ans) ans.disabled = true;

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.style.display = "none";
  }

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

const confirmAndFinish = () => {
  let invalidCount = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i].trim() !== "" && !isValidFormat(answers[i], answerFormats[i])) {
      invalidCount++;
    }
  }
  
  if (invalidCount > 0) {
    const confirmMsg = `解答形式が正しくない問題が${invalidCount}問あります。\nこのまま終了しますか？`;
    if (!confirm(confirmMsg)) {
      return;
    }
  }
  
  document.getElementById("confirm-overlay").style.display = "flex";
};

const timeUp = () => handleExamEnd("時間切れです。結果画面に移動します。");
const finishExam = () => handleExamEnd("結果画面に遷移します。");

document.addEventListener("keydown", (e) => {
  if (isLocked()) return;
  
  if (e.key === "ArrowLeft" && current > 1) {
    back();
  }
  if (e.key === "ArrowRight" && current < total) {
    forward();
  }
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
