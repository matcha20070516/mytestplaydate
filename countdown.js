const countdownEl = document.getElementById("countdown");
let count = 3;

const timer = setInterval(() => {
    count--;
    if (count > 0) {
        countdownEl.textContent = count;
        countdownEl.style.animation = "none";
        countdownEl.offsetHeight; // reflow
        countdownEl.style.animation = null;
    } else if (count === 0) {
        countdownEl.textContent = "スタート！";
    } else {
        clearInterval(timer);

        // セッションから選択されたセットを取得（キー名をsetNameに）
        const selectedSet = sessionStorage.getItem('setName');

        let targetPage = '';
        switch (selectedSet) {
            case '基本セット':
                targetPage = 'problem_set1.html';
                break;
            case 'まっちゃ問':
                targetPage = 'problem_set2.html';
                break;
            case 'set3':
                targetPage = 'problem_set3.html';
                break;
            default:
                targetPage = 'problem_set1.html';
                break;
        }

        window.location.href = targetPage;
    }
}, 1000);
