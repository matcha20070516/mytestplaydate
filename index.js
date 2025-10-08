// ページ読み込み時に受験済みチェックマークを表示
window.addEventListener('DOMContentLoaded', () => {
  updateExamStatus();
});

// 受験済みステータスを更新
function updateExamStatus() {
  const selectElement = document.getElementById("set");
  const options = selectElement.querySelectorAll("option");
  
  options.forEach(option => {
    const setName = option.value;
    const isCompleted = localStorage.getItem(`${setName}_completed`) === "true";
    
    // 既存のテキストから✅を削除
    let text = option.textContent.replace(" ✅", "");
    
    // 受験済みなら✅を追加
    if (isCompleted) {
      option.textContent = text + " ✅";
      option.style.color = "#4caf50";
    } else {
      option.textContent = text;
      option.style.color = "";
    }
  });
}

function start() {
  const name = document.getElementById("name").value.trim();
  const set = document.getElementById("set").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  // 受験完了済みチェック（exResultLockedがtrueなら完了済み）
  const isCompleted = localStorage.getItem(`${set}_completed`) === "true";
  const isLocked = localStorage.getItem("exResultLocked") === "true";
  
  if (isCompleted && isLocked) {
    alert("この模試は既に受験済みです。結果画面に移動します。");
    
    localStorage.setItem("currentExamSet", set);
    
    const score = localStorage.getItem("exScore") || "0";
    const grade = getGrade(parseInt(score));
    const shareUrl = `https://matcha20070516.github.io/mytestplaydate/share/grade-${grade.num}.html`;
    
    const params = new URLSearchParams({
      grade: grade.name,
      score: score,
      set: set,
      shareUrl: shareUrl
    });
    
    window.location.href = `exresult_grade${grade.num}.html?${params.toString()}`;
    return;
  }

  const prefix = `ex_${set}`;

  // 途中データがあるかチェック
  const hasSavedData = localStorage.getItem("exCurrent") || localStorage.getItem("exStartTime");
  
  if (hasSavedData) {
    // 途中から再開
    alert("前回中断された状態から再開します。");
  } else {
    // 新規開始の場合のみFreshStartフラグを立てる
    localStorage.setItem(`${prefix}_FreshStart`, "true");
    localStorage.setItem("exFreshStart", "true");
  }

  localStorage.setItem(`${prefix}_Username`, name);
  localStorage.setItem(`${prefix}_SetName`, set);
  localStorage.setItem("currentExamSet", set);

  window.location.href = "exrule.html";
}

// 級判定関数（index.jsでも必要）
function getGrade(score) {
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
}

// 説明文だけ配列で管理
const slideDescriptions = [
  '説明文1',
  '右上の数字は残り時間です。問題の移動は問題画像の左右に出てくる三角を押すことで1問ずつ、上にあるチャプターをスライド、選択することでその番号の問題に飛ぶことができます。解答形式に従って解答してください。解答欄に文字列を記入するとその問題のチャプターが緑色になります。途中で全ての問題が解けたときは下の終了ボタンを押しても構いません',
  '説明文3',
  '説明文4'
];
const totalSlides = slideDescriptions.length;
let currentSlide = 0;

const howtoImg = document.getElementById('howtoImg');
const slideDesc = document.getElementById('slideDesc');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicator = document.getElementById('indicator');

function updateSlide() {
  howtoImg.src = `Howto${currentSlide + 1}.png`;
  slideDesc.innerHTML = slideDescriptions[currentSlide];
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  renderIndicator();
}

// モーダル背景クリックで閉じる
const modalHelp = document.getElementById('modalHelp');
const modalContent = document.querySelector('.modal-content');

modalHelp.addEventListener('click', function (e) {
  if (e.target === modalHelp) {
    closeHelp();
  }
});

// モーダル内クリックは閉じない
modalContent.addEventListener('click', function (e) {
  e.stopPropagation();
});

function renderIndicator() {
  indicator.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === currentSlide ? ' active' : '');
    indicator.appendChild(dot);
  }
}

prevBtn.onclick = function() {
  if (currentSlide > 0) { currentSlide--; updateSlide(); }
};
nextBtn.onclick = function() {
  if (currentSlide < totalSlides - 1) { currentSlide++; updateSlide(); }
};

function openHelp() {
  document.getElementById('modalHelp').classList.add('show');
  currentSlide = 0;
  updateSlide();
}
function closeHelp() {
  document.getElementById('modalHelp').classList.remove('show');
}
// 初期表示
updateSlide();

function adjustViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustViewportHeight);
window.addEventListener('load', adjustViewportHeight);
