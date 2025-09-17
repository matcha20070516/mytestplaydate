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

function adjustViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustViewportHeight);
window.addEventListener('load', adjustViewportHeight);
