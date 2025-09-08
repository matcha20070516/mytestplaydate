const total = 5;
let current = 1;
let passes = 0;
let startTime = Date.now();
let addedPenalty = 0;
let maxReached = 1;

const answers = ["りんご", "みかん", "ぶどう", "もも", "すいか"];
const answerStates = Array(total).fill(null);
const locked = Array(total).fill(false); // これを追加

function loadQuestion() {
    document.getElementById("question-num").textContent = `第${current}問`;
    document.getElementById("quiz-img").src = `q${current}.png`;

    const input = document.getElementById("answer");
    input.value = answerStates[current - 1] === "__passed__" ? "" : (answerStates[current - 1] || "");
    input.disabled = locked[current - 1];
    document.getElementById("message").textContent = "";
    updateNavButtons();
    updateChapters();
    attachZoomableHandler();
}

function updateNavButtons() {
    document.getElementById("back-btn").style.visibility = current > 1 ? "visible" : "hidden";
    document.getElementById("forward-btn").style.visibility =
        current < maxReached && current < total ? "visible" : "hidden";
}

function updateChapters() {
    const chapterContainer = document.getElementById("chapters");
    chapterContainer.innerHTML = "";
    for (let i = 0; i < total; i++) {
        const btn = document.createElement("button");
        btn.textContent = `${i + 1}`;
        btn.className = "chapter-btn";
        if (i + 1 === current) btn.classList.add("current");
        if (locked[i]) btn.classList.add("answered");
        btn.disabled = i + 1 > maxReached;
        btn.onclick = () => {
            current = i + 1;
            loadQuestion();
        };
        chapterContainer.appendChild(btn);
    }
}

function attachZoomableHandler() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    const zoomables = document.querySelectorAll('.zoomable');
    zoomables.forEach(img => {
        img.onclick = () => {
            modal.style.display = "flex";
            modalImg.src = img.src;
        };
    });

    modal.onclick = () => {
        modal.style.display = "none";
        modalImg.src = "";
    };
}

function checkAnswer() {
    const input = document.getElementById("answer");
    const userAnswer = input.value.trim();
    answerStates[current - 1] = userAnswer;

    const correct = answers[current - 1];
    const normalized = userAnswer.replace(/\s/g, "").replace(/[ー－]/g, "").toLowerCase();
    const correctNormalized = correct.replace(/\s/g, "").replace(/[ー－]/g, "").toLowerCase();

    if (normalized === correctNormalized) {
        document.getElementById("message").textContent = "正解！";
        locked[current - 1] = true;
        input.disabled = true;
        if (current === maxReached) maxReached++;
        setTimeout(() => {
            if (current < total) {
                current++;
                loadQuestion();
            } else {
                finish();
            }
        }, 500);
    } else {
        document.getElementById("message").textContent = "不正解…もう一度試してみよう";
    }
}

function back() {
    if (current > 1) {
        current--;
        loadQuestion();
    }
}

function forward() {
    if (current < maxReached && current < total) {
        current++;
        loadQuestion();
    }
}

function pass() {
    if (locked[current - 1]) return; // すでに正解してたら無効
    if (answerStates[current - 1] === "__passed__") return; // パス済なら無効

    passes++;
    addedPenalty += 60;
    answerStates[current - 1] = "__passed__"; // パス記録
    showPassOverlay();

    if (current === maxReached && current < total) maxReached++;
    if (current < total) {
        current++;
        loadQuestion();
    } else {
        finish();
    }
}

function showPassOverlay() {
    const overlay = document.getElementById("pass-overlay");
    overlay.style.display = "block";
    setTimeout(() => {
        overlay.style.display = "none";
    }, 1000);
}

function finish() {
    const totalTime = Date.now() - startTime + addedPenalty * 1000;
    sessionStorage.setItem("passes", passes);
    sessionStorage.setItem("time", totalTime);
    window.location.href = "result.html";
}

function updateTimer() {
    const elapsed = Date.now() - startTime + addedPenalty * 1000;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById("timer").textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    window.elapsedTimeMillis = elapsed;
}

function adjustViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustViewportHeight);

window.onload = function() {
    adjustViewportHeight();
    loadQuestion();
    setInterval(updateTimer, 100);
};
