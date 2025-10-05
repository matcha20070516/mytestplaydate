    const total = 20;
    let current = 1;
    let timeLimit = 30 * 60;
    const answers = Array(total).fill("");
    const pointsPerQuestion = [2, 3, 6, 3, 4, 4, 4, 4, 6, 6, 6, 3, 3, 4, 6, 4, 8, 8, 6, 10];
    const correctAnswers = ["3", "たにそこ", "はんたい", "おろそか", "こまいぬ", "ちくせき", "ユニオン", "ホエール", "はんらん", "がんばん", "たつじん", "とのさま", "かけごえ", "てきかく", "ドリーム", "みさんが", "ながさき", "いせえび", "はだいろ", "かいどく"];
    const answerFormats = ["半角数字", "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ", "カタカナ", "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ", "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな"];
    let timerInterval = null;

    const isLocked = () => localStorage.getItem("exResultLocked") === "true";

    const isValidFormat = (answer, format) => {
      if (!answer || answer.trim() === "") return true;
      switch(format) {
        case "半角数字": return /^[0-9]+$/.test(answer);
        case "ひらがな": return /^[ぁ-ん]+$/.test(answer);
        case "カタカナ": return /^[ァ-ヶー]+$/.test(answer);
        case "漢字": return /^[一-龯]+$/.test(answer);
        case "英字": return /^[a-zA-Z]+$/.test(answer);
        default: return true;
      }
    };

    const isFreshStart = localStorage.getItem("exFreshStart") === "true";
    if (isFreshStart) {
      localStorage.removeItem("exFreshStart");
      localStorage.removeItem("exCurrent");
      localStorage.removeItem("exElapsedTime");
      localStorage.removeItem("exAnswers");
    } else {
      current = parseInt(localStorage.getItem("exCurrent") || "1", 10);
      const savedElapsed = parseInt(localStorage.getItem("exElapsedTime") || "0", 10);
      timeLimit -= savedElapsed;
      const savedAnswers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
      for (let i = 0; i < savedAnswers.length; i++) answers[i] = savedAnswers[i] || "";
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
      document.getElementById("timer").textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      timeLimit--;
      localStorage.setItem("exElapsedTime", (30 * 60) - timeLimit);
    };

    const autoSaveState = () => {
      localStorage.setItem("exAnswers", JSON.stringify(answers));
      localStorage.setItem("exCurrent", current.toString());
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

    const loadQuestion = () => {
      document.getElementById("question-num").textContent = `第${current}問`;
      document.getElementById("quiz-img").src = `mq${current}.PNG`;
      document.getElementById("answer").value = answers[current - 1] || "";
      document.getElementById("answer-format").textContent = answerFormats[current - 1] || "";
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
      return userAnswers.reduce((score, ans, idx) => score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
    };

    const handleExamEnd = (message) => {
      saveCurrentAnswer();
      const username = localStorage.getItem("exUsername") || "名無し";
      const setName = localStorage.getItem("exSetName") || "謎検模試セット";
      const score = calculateScore(answers);
      localStorage.setItem("exUsername", username);
      localStorage.setItem("exScore", score);
      localStorage.setItem("exAnswers", JSON.stringify(answers));
      localStorage.setItem("exSetName", setName);
      localStorage.setItem("exResultLocked", "true");
      localStorage.removeItem("exCurrent");
      localStorage.removeItem("exTimeLeft");
      alert(message);
      location.href = "exresult.html";
    };

    const confirmAndFinish = () => {
      let invalidCount = 0;
      for (let i = 0; i < total; i++) {
        if (answers[i].trim() !== "" && !isValidFormat(answers[i], answerFormats[i])) invalidCount++;
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
        document.querySelector(".container")?.prepend(lockNotice);
        const elapsed = parseInt(localStorage.getItem("exElapsedTime") || "0", 10);
        const fixedTimeLeft = (30 * 60) - elapsed;
        const m = Math.floor(fixedTimeLeft / 60);
        const s = fixedTimeLeft % 60;
        document.getElementById("timer").textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        loadQuestion();
      } else {
        loadQuestion();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        setInterval(autoSaveState, 1000);
        
        // 日本語入力対応のイベントリスナー
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
      if (reviewMode) {
        const submitBtn = document.getElementById("submit-btn");
        if (submitBtn) submitBtn.onclick = finishExam;
        const overlay = document.getElementById("confirm-overlay");
        if (overlay) overlay.style.display = "none";
      } else {
        document.getElementById("submit-btn").onclick = confirmAndFinish;
        document.getElementById("confirm-yes").onclick = finishExam;
        document.getElementById("confirm-no").onclick = () => {
          document.getElementById("confirm-overlay").style.display = "none";
        };
      }
    };
