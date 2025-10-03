function start() {
  const name = document.getElementById("name").value.trim();
  const set = document.getElementById("set").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  const prefix = `ex_${set}`;  // ex_謎検模試セット1 とか

  const hasOldData =
    localStorage.getItem(`${prefix}_Answers`) ||
    localStorage.getItem(`${prefix}_Username`) ||
    localStorage.getItem(`${prefix}_SetName`);

  if (hasOldData) {
    const continueOld = confirm("以前のデータが残っています。このセットで続けますか？\n「OK」で続行、「キャンセル」で新しく始めます。");
    if (!continueOld) {
      let count = parseInt(localStorage.getItem(`${prefix}_AttemptCount`) || "0", 10);
      count += 1;
      localStorage.setItem(`${prefix}_AttemptCount`, count);

      const exKeysToClear = [
        "Username", "SetName", "Answers", "Score", "TimeLimit",
        "ElapsedTime", "StartTime", "Progress", "CurrentPage", "Current", "ResultLocked"
      ];
      exKeysToClear.forEach(key => localStorage.removeItem(`${prefix}_${key}`));

      const legacyKeys = [
        "exAnswers", "exScore", "exElapsedTime", "exCurrent", "exResultLocked"
      ];
      legacyKeys.forEach(key => localStorage.removeItem(key));

      localStorage.setItem(`${prefix}_FreshStart`, "true");
      alert(`新しく始めます。（${count}回目の挑戦）`);
    } else {
      alert("前回のデータで続行します。");
    }
  } else {
    localStorage.setItem(`${prefix}_AttemptCount`, "1");
    localStorage.setItem(`${prefix}_FreshStart`, "true");
    alert("模試を始めます。");
  }

  localStorage.setItem(`${prefix}_Username`, name);
  localStorage.setItem(`${prefix}_SetName`, set);
  localStorage.setItem("currentExamSet", set);

  window.location.href = "exrule.html";
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
