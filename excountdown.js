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

        // ✅ localStorage に変更！
        localStorage.setItem(`${prefix}_SetName`, set);

        let targetPage = '';
        switch (selectedSet) {
            case '謎検模試_M':
                targetPage = 'exproblem_set1.html';
                break;
            case '謎検模試test':
                targetPage = 'exproblem_set2.html';
                break;
            case 'set3':
                targetPage = 'exproblem_set3.html';
                break;
            default:
                targetPage = 'exproblem_set1.html';
                break;
        }

        window.location.href = targetPage;
    }
}, 1000);
