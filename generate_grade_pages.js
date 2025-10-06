// Node.js で実行: node generate_grade_pages.js
const fs = require('fs');

const grades = [
  { num: 1, name: '1級', img: 'result1.PNG' },
  { num: 2, name: '準1級', img: 'result2.PNG' },
  { num: 3, name: '2級', img: 'result3.PNG' },
  { num: 4, name: '準2級', img: 'result4.PNG' },
  { num: 5, name: '3級', img: 'result5.PNG' },
  { num: 6, name: '4級', img: 'result6.PNG' },
  { num: 7, name: '5級', img: 'result7.PNG' },
  { num: 8, name: '6級', img: 'result8.PNG' },
  { num: 9, name: '7級', img: 'result9.PNG' },
  { num: 10, name: '8級', img: 'result10.PNG' }
];

const template = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TExAM - {{GRADE_NAME}}合格</title>
  
  <!-- OGP設定 -->
  <meta property="og:title" content="謎検模試 - {{GRADE_NAME}}合格！" />
  <meta property="og:description" content="TExAMで{{GRADE_NAME}}に合格しました！" />
  <meta property="og:image" content="https://matcha20070516.github.io/mytestplaydate/{{IMAGE}}" />
  <meta property="og:url" content="https://matcha20070516.github.io/mytestplaydate/" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="謎検模試 - {{GRADE_NAME}}合格！" />
  <meta name="twitter:description" content="TExAMで{{GRADE_NAME}}に合格しました！" />
  <meta name="twitter:image" content="https://matcha20070516.github.io/mytestplaydate/{{IMAGE}}" />
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
      background: #f6f8fb;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      padding: 30px;
      width: 90%;
      max-width: 600px;
      text-align: center;
    }

    h2 {
      margin-bottom: 16px;
      color: #444;
    }

    .result-info {
      margin-bottom: 20px;
    }

    .result-info p {
      font-size: 1.1em;
      margin: 8px 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      margin: 6px 4px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.85em;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
      color: #555;
    }

    .btn:hover {
      background: #f8f8f8;
      border-color: #aaa;
    }

    .btn-tweet::before {
      content: "𝕏";
      margin-right: 3px;
    }

    .btn-detail::before {
      content: "📋";
      margin-right: 3px;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>模試 結果発表</h2>
    <div class="result-info">
      <p>名前：<span id="username">---</span></p>
      <p>模試名：<span id="setname">---</span></p>
      <p>得点：<span id="score">0</span> 点</p>
      <p>認定級：<span id="grade" style="font-weight: bold;">{{GRADE_NAME}}</span></p>
      <p>経過時間：<span id="elapsedTimeDisplay">--:--</span></p>
    </div>

    <div class="button-group">
      <a href="#" id="share-link" class="btn btn-tweet" target="_blank">
        結果をポストする
      </a>

      <a id="detail-link" class="btn btn-detail" href="#">
        解答詳細を見る
      </a>
    </div>

    <div id="result-summary"></div>

    <div class="button-group">
      <button id="review-btn" class="btn">問題を見返す</button>
      <button id="home-btn" class="btn">ホームに戻る</button>
    </div>
  </div>
  
  <script>
    window.addEventListener("DOMContentLoaded", () => {
      // URLパラメータから情報取得
      const params = new URLSearchParams(window.location.search);
      const grade = params.get('grade') || '{{GRADE_NAME}}';
      const score = params.get('score') || '0';
      
      // currentExamSetから正しいprefixを取得
      const currentExamSet = localStorage.getItem("currentExamSet") || "";
      const prefix = \`ex_\${currentExamSet}_\`;
      
      const username = localStorage.getItem(\`\${prefix}Username\`) || "名無し";
      const displaySetName = localStorage.getItem(\`\${prefix}SetName\`) || currentExamSet;

      document.getElementById("username").textContent = username;
      document.getElementById("score").textContent = score;
      document.getElementById("setname").textContent = displaySetName;
      document.getElementById("grade").textContent = grade;

      const elapsedSec =
        Number(localStorage.getItem(\`\${prefix}ElapsedTime\`)) ||
        Number(localStorage.getItem("exElapsedTime")) ||
        0;

      function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return \`\${m}分\${s}秒\`;
      }
      document.getElementById("elapsedTimeDisplay").textContent = formatTime(elapsedSec);

      const reviewBtn = document.getElementById("review-btn");
      if (reviewBtn) {
        reviewBtn.addEventListener("click", () => {
          localStorage.setItem("exReviewMode", "true");
          localStorage.setItem("exCurrent", "1");

          let targetPage = "";
          switch (displaySetName) {
            case "謎検模試_M":
              targetPage = "exproblem_set1.html";
              break;
            case "謎検模試test":
              targetPage = "exproblem_set2.html";
              break;
            case "謎検模試_set3":
              targetPage = "exproblem_set3.html";
              break;
            default:
              targetPage = "exproblem_set1.html";
              break;
          }

          window.location.href = targetPage;
        });
      }

      const homeBtn = document.getElementById("home-btn");
      if (homeBtn) {
        homeBtn.addEventListener("click", () => {
          window.location.href = "index.html";
        });
      }

      const currentUrl = window.location.href;
      const tweetText = encodeURIComponent(
        \`『\${displaySetName}』の結果は【\${score}点】で【\${grade}】でした！ #謎解き #TExAM #\${displaySetName.replace(/\\s/g, '')}\\n\${currentUrl}\`
      );
      document.getElementById("share-link").href = \`https://twitter.com/intent/tweet?text=\${tweetText}\`;

      let detailPage = "exresult_detail_M.html";
      if (displaySetName === "謎検模試_M") {
        detailPage = "exresult_detail_M.html";
      } else if (displaySetName === "謎検模試test") {
        detailPage = "exresult_detail_test.html";
      } else if (displaySetName === "謎検模試_set3") {
        detailPage = "exresult_detail_set3.html";
      }
      const detailLink = document.getElementById("detail-link");
      if (detailLink) {
        detailLink.href = detailPage;
      }
    });
  </script>
</body>
</html>`;

// 10ファイル生成
grades.forEach(grade => {
  const html = template
    .replace(/{{GRADE_NAME}}/g, grade.name)
    .replace(/{{IMAGE}}/g, grade.img);
  
  const filename = `exresult_grade${grade.num}.html`;
  fs.writeFileSync(filename, html);
  console.log(`✅ ${filename} を生成しました`);
});

console.log('\n🎉 全10ファイルの生成が完了しました！');
