/********************************************
 * المتغيرات العامة
 ********************************************/
let isGolden = false;
let goldenChance = 0.15; // احتمال 15% أن يكون السؤال ذهبي
let lineWinTriggered = false;
let currentPlayer    = "red";
let redScore         = 0;
let greenScore       = 0;
let selectedCell     = null;
let timer            = null;
let timeLeft         = 10;
let answeringTeam    = null;

let level            = 1;
let combo            = 0;
let redTotalPoints   = 0;
let greenTotalPoints = 0;

let aiEnabled        = false;
let aiTeam           = "green";
window.focus();
let soundResult, hbSlow, hbMed, hbFast, winSound;

/********************************************
 * الحروف + توزيع اللوحة
 ********************************************/
const letters = [
    "أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض",
    "ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","هـ","و","ي"
];
const boardLayout = [5, 5, 5, 5, 5];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(letters);

/********************************************
 * إنشاء اللوحة
 ********************************************/
function createBoard() {
    selectedCell = null; // ← إصلاح مهم جداً

    if (lineWinTriggered) return;

    const board = document.getElementById("board");
    board.innerHTML = "";
    let letterIndex = 0;

    // الصف العلوي الأحمر
    const topRow = document.createElement("div");
    topRow.classList.add("board-row");
    topRow.style.marginLeft = "5px";

    for (let i = 0; i < 7; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "cell-shape", "hex", "border-red", "no-click");
        topRow.appendChild(cell);
    }
    board.appendChild(topRow);

    // الصفوف الأساسية
    boardLayout.forEach((cellsInRow) => {
        const row = document.createElement("div");
        row.classList.add("board-row");

        // الحد الأيسر الأخضر
        const leftBorder = document.createElement("div");
        leftBorder.classList.add("cell", "cell-shape", "hex", "border-green", "no-click");
        row.appendChild(leftBorder);

        // الخلايا الوسطى
        for (let i = 0; i < cellsInRow; i++) {
            if (letterIndex >= letters.length) break;

            const cell = document.createElement("div");
            cell.classList.add("cell", "cell-shape", "hex", "playable");
            cell.textContent = letters[letterIndex];

            cell.addEventListener("click", () => {
                if (lineWinTriggered) return;

                if (cell.classList.contains("red") || cell.classList.contains("green")) return;

                

                if (aiEnabled && currentPlayer === aiTeam) {
    // الكمبيوتر يلعب تلقائيًا
    aiPlay();
    return;
}

                showQuestion(cell);
            });

            row.appendChild(cell);
            letterIndex++;
        }

        // الحد الأيمن الأخضر
        const rightBorder = document.createElement("div");
        rightBorder.classList.add("cell", "cell-shape", "hex", "border-green", "no-click");
        row.appendChild(rightBorder);

        board.appendChild(row);
    });

    // الصف السفلي الأحمر
    const bottomRow = document.createElement("div");
    bottomRow.classList.add("board-row");
    bottomRow.style.marginLeft = "5px";

    for (let i = 0; i < 7; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "cell-shape", "hex", "border-red", "no-click");
        bottomRow.appendChild(cell);
    }

    board.appendChild(bottomRow);
}

/********************************************
 * عرض السؤال
 ********************************************/
let currentQuestion = null;

function showQuestion(cell) {
    // حفظ الخلية المختارة
    selectedCell = cell;
    currentPlayer = null;
    answeringTeam = null;
   

    // إعادة ضبط المؤقت قبل بدء السؤال
    clearInterval(timer);
    timeLeft = 10;
    document.getElementById("timerText").textContent = timeLeft;

    window.focus();

    // استخراج الحرف
    const letter = cell.textContent.trim();
    let q = getQuestionByLetter(letter);

    // سؤال افتراضي لو لم يوجد سؤال لهذا الحرف
    if (!q) {
        q = {
            q: `اذكر كلمة تبدأ بحرف ${letter}`,
            choices: ["لا أعرف", "لا يوجد", `${letter}...`],
            answer: `${letter}...`
        };
    }

    currentQuestion = q;

    // إظهار شاشة السؤال
    const overlay = document.getElementById("questionOverlay");

// أول شيء: أظهر شاشة السؤال
overlay.classList.remove("hidden");
overlay.style.display = "flex";

// الآن فقط ابدأ التعامل مع عناصرها
document.getElementById("qText").textContent = q.q;

    document.activeElement.blur();

    // إظهار البازر بعد لحظة بسيطة
    setTimeout(() => {
        document.getElementById("buzzers").classList.remove("hidden");
    }, 50);

    // إخفاء المؤشر والاختيارات
    document.getElementById("buzzIndicator").classList.add("hidden");
    document.getElementById("choicesContainer").classList.add("hidden");
    // تحديد إذا كان السؤال ذهبي
isGolden = Math.random() < goldenChance;
if (isGolden) {
    const qText = document.getElementById("qText");
    qText.classList.add("golden-glow");
} else {
    document.getElementById("qText").classList.remove("golden-glow");
}

// تغيير شكل السؤال الذهبي
if (isGolden) {
    document.getElementById("qText").style.color = "gold";
    document.getElementById("qText").style.textShadow = "0 0 10px gold";
} else {
    document.getElementById("qText").style.color = "";
    document.getElementById("qText").style.textShadow = "";
}
    // وضع نص السؤال
    document.getElementById("qText").textContent = q.q;
    
    // بناء الاختيارات
    const container = document.getElementById("choicesContainer");
    container.innerHTML = "";
    const goldenBanner = document.getElementById("goldenQuestionBanner");
    



if (isGolden) {
    goldenBanner.classList.remove("hidden");
    goldenSound.currentTime = 0;
    goldenSound.play();

    setTimeout(() => {
        goldenBanner.classList.add("hidden");
    }, 2000);
}
    q.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "choiceBtn";
        btn.textContent = choice;

        btn.onclick = () => {
            stopHeartbeats();
            checkAnswer(choice, q.answer, q);
        };

        container.appendChild(btn);
    });
}

/********************************************
 * التقاط ضغطات الكيبورد للبازر
 ********************************************/
document.addEventListener("keydown", function(e) {
    const overlay = document.getElementById("questionOverlay");
    if (overlay.classList.contains("hidden")) return;

    if (answeringTeam !== null) return;

    if (e.keyCode === 65) { // A
        answeringTeam = "red";
        startAnswerPhase();
    }

    if (e.keyCode === 76) { // L
        answeringTeam = "green";
        startAnswerPhase();
    }
});

/********************************************
 * بدء مرحلة الإجابة بعد البازر
 ********************************************/
function startAnswerPhase() {
    if (!answeringTeam) return;

    document.getElementById("buzzers").classList.add("hidden");
    document.getElementById("buzzIndicator").classList.remove("hidden");

    document.getElementById("redIndicator").classList.remove("active");
    document.getElementById("greenIndicator").classList.remove("active");

    if (answeringTeam === "red") {
        document.getElementById("redIndicator").classList.add("active");
    } else {
        document.getElementById("greenIndicator").classList.add("active");
    }

    document.getElementById("choicesContainer").classList.remove("hidden");

    currentPlayer = answeringTeam;
    document.getElementById("turn").textContent =
        currentPlayer === "red" ? "الأحمر" : "الأخضر";

    startTimer();          // ← أهم سطر
    playHeartbeatSlow();
}
/********************************************
 * زمن المستوى
 ********************************************/
function getTimeForLevel() {
    // عدّل القيم لو حاب
    return Math.max(5, 12 - level);
}

/********************************************
 * المؤقت
 ********************************************/
function startTimer() {
    clearInterval(timer);

    timeLeft = isGolden ? 5 : 10;

    const text = document.getElementById("timerText");
    const ring = document.getElementById("timerRing");

    text.textContent = timeLeft;

    const full = 314; // محيط الدائرة

    timer = setInterval(() => {
        timeLeft--;
        text.textContent = timeLeft;

        const progress = full * (1 - timeLeft / (isGolden ? 5 : 10));
        ring.style.strokeDashoffset = progress;

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeUp();
        }
    }, isGolden ? 700 : 1000);
}

/********************************************
 * أصوات دقات القلب
 ********************************************/
function playHeartbeatSlow() {
    stopHeartbeats();
    if (!hbSlow) return;
    hbSlow.currentTime = 0;
    hbSlow.play();
}
function playHeartbeatMed() {
    if (hbSlow) hbSlow.pause();
    if (!hbMed) return;
    hbMed.currentTime = 0;
    hbMed.play();
}
function playHeartbeatFast() {
    if (hbMed) hbMed.pause();
    if (!hbFast) return;
    hbFast.currentTime = 0;
    hbFast.play();
}
function stopHeartbeats() {
    if (hbSlow) hbSlow.pause();
    if (hbMed)  hbMed.pause();
    if (hbFast) hbFast.pause();
}

/********************************************
 * التحقق من الإجابة
 ********************************************/
function checkAnswer(selected, correct, questionObj) {
    if (lineWinTriggered) return;

    clearInterval(timer);
    stopHeartbeats();

    let gained = 0;
    const isCorrect = (selected === correct);

    // ============================
    // 1) الإجابة الصحيحة
    // ============================
    if (isCorrect) {

        // تلوين الخلية
        if (selectedCell) {
            selectedCell.classList.add(currentPlayer);
        }

        // نقاط أساسية
        gained += 1;

        // نقاط السرعة
        if (timeLeft > getTimeForLevel() * 0.6) {
            gained += 2;
        }

        // كومبو
        combo++;
        if (combo >= 3) {
            gained += 1;
        }

        // مضاعفة النقاط في السؤال الذهبي
        if (isGolden) {
            gained *= 2;
        }

        // إضافة النقاط للفريق
        if (currentPlayer === "red") {
            redScore++;
            redTotalPoints += gained;
        } else {
            greenScore++;
            greenTotalPoints += gained;
        }

        // ============================
        // 2) تأثير الفوز الذهبي
        // ============================
        if (isGolden) {
            const winBanner = document.getElementById("goldenWinBanner");
           const winSound= document.getElementById("goldenWin"); 



            winBanner.classList.remove("hidden");
            winSound.currentTime = 0;
            winSound.play();

            setTimeout(() => {
                winBanner.classList.add("hidden");
            }, 2500);

            // انفجار ذهبي
            const boom = document.createElement("div");
            boom.className = "golden-explosion";
            boom.style.left = "50%";
            boom.style.top = "50%";
            boom.style.transform = "translate(-50%, -50%)";
            document.body.appendChild(boom);
            setTimeout(() => boom.remove(), 600);
        }

    } else {
        // ============================
        // 3) الإجابة الخاطئة
        // ============================
        combo = 0;
    }

    // ============================
    // 4) أصوات الصح والخطأ
    // ============================
    if (isCorrect) {
        const s = document.getElementById("soundCorrect");
        if (s) {
            s.currentTime = 0;
            s.play();
        }
    } else {
        const s = document.getElementById("soundWrong");
        if (s) {
            s.currentTime = 0;
            s.play();
        }
    }

    // ============================
    // 5) إغلاق الشاشات
    // ============================
    updateScore();
    updateAdvancedScore();

    document.getElementById("choicesContainer").classList.add("hidden");
    document.getElementById("buzzers").classList.add("hidden");
    document.getElementById("buzzIndicator").classList.add("hidden");
    document.getElementById("questionOverlay").classList.add("hidden");

    selectedCell = null;
    answeringTeam = null;

    // ============================
    // 6) فحص الفوز
    // ============================
    checkWinner();
    checkLineWin();

    // ============================
    // 7) الانتقال للدور التالي
    // ============================
    if (!lineWinTriggered) {
        switchTurn();
    }
}

/********************************************
 * تحديث النقاط
 ********************************************/
function updateScore() {
    document.getElementById("redCount").textContent   = redScore;
    document.getElementById("greenCount").textContent = greenScore;
}
function updateAdvancedScore() {
    document.getElementById("redPoints").textContent   = redTotalPoints;
    document.getElementById("greenPoints").textContent = greenTotalPoints;
    document.getElementById("levelValue").textContent  = level;
}

/********************************************
 * تبديل الدور
 ********************************************/
function switchTurn() {
    if (lineWinTriggered) return;

    currentPlayer = currentPlayer === "red" ? "green" : "red";
    document.getElementById("turn").textContent =
        currentPlayer === "red" ? "الأحمر" : "الأخضر";

    if (aiEnabled && currentPlayer === aiTeam) {
        setTimeout(() => aiPlay(), 800);
    }
}

/********************************************
 * فوز بالنقاط عند امتلاء اللوحة
 ********************************************/
function checkWinner() {
    if (lineWinTriggered) return;

    const playable = [...document.querySelectorAll(".cell.playable")];
    const filled = playable.filter(c =>
        c.classList.contains("red") || c.classList.contains("green")
    ).length;

    if (filled === playable.length && playable.length > 0) {
        const winnerText = document.getElementById("winnerText");

        if (redTotalPoints > greenTotalPoints)
            winnerText.textContent = "الفائز هو الفريق الأحمر بالنقاط!";
        else if (greenTotalPoints > redTotalPoints)
            winnerText.textContent = "الفائز هو الفريق الأخضر بالنقاط!";
        else
            winnerText.textContent = "تعادل في النقاط!";

        document.getElementById("winnerOverlay").classList.remove("hidden");
        lineWinTriggered = true;
    }
}

/********************************************
 * فوز الأحمر (مسار من أعلى لأسفل)
 ********************************************/
function checkRedPathWin() {
    if (lineWinTriggered) return false;

    const rows = [...document.querySelectorAll(".board-row")];

    const grid = rows
        .map(row => [...row.querySelectorAll(".cell.playable")])
        .filter(r => r.length > 0);

    const visited = new Set();
    const stack   = [];

    if (!grid.length) return false;

    grid[0].forEach((cell, col) => {
        if (cell.classList.contains("red")) {
            stack.push({ row: 0, col });
        }
    });

    while (stack.length > 0) {
        const { row, col } = stack.pop();
        const key = row + "-" + col;

        if (visited.has(key)) continue;
        visited.add(key);

        if (row === grid.length - 1) {
            const winningCells = [...visited].map(k => {
                const [r, c] = k.split("-").map(Number);
                return grid[r][c];
            });

            redTotalPoints += 5;
            triggerWinEffect(winningCells, "الأحمر");
            return true;
        }

        const neighbors = [
            { r: row - 1, c: col },
            { r: row + 1, c: col },
            { r: row,     c: col - 1 },
            { r: row,     c: col + 1 },
            { r: row - 1, c: col + 1 },
            { r: row + 1, c: col - 1 },
        ];

        neighbors.forEach(n => {
            if (
                grid[n.r] &&
                grid[n.r][n.c] &&
                grid[n.r][n.c].classList.contains("red")
            ) {
                stack.push({ row: n.r, col: n.c });
            }
        });
    }

    return false;
}

/********************************************
 * فوز الأخضر (مسار من يسار ليمين)
 ********************************************/
function checkGreenPathWin() {
    if (lineWinTriggered) return false;

    const rows = [...document.querySelectorAll(".board-row")];

    const grid = rows
        .map(row => [...row.querySelectorAll(".cell.playable")])
        .filter(r => r.length > 0);

    const visited = new Set();
    const stack   = [];

    if (!grid.length) return false;

    grid.forEach((row, r) => {
        if (row[0] && row[0].classList.contains("green")) {
            stack.push({ row: r, col: 0 });
        }
    });

    while (stack.length > 0) {
        const { row, col } = stack.pop();
        const key = row + "-" + col;

        if (visited.has(key)) continue;
        visited.add(key);

        if (col === grid[row].length - 1) {
            const winningCells = [...visited].map(k => {
                const [r, c] = k.split("-").map(Number);
                return grid[r][c];
            });

            greenTotalPoints += 5;
            triggerWinEffect(winningCells, "الأخضر");
            return true;
        }

        const neighbors = [
            { r: row,     c: col - 1 },
            { r: row,     c: col + 1 },
            { r: row - 1, c: col },
            { r: row + 1, c: col },
            { r: row - 1, c: col + 1 },
            { r: row + 1, c: col + 1 },
            { r: row - 1, c: col - 1 },
            { r: row + 1, c: col - 1 },
        ];

        neighbors.forEach(n => {
            if (
                grid[n.r] &&
                grid[n.r][n.c] &&
                grid[n.r][n.c].classList.contains("green")
            ) {
                stack.push({ row: n.r, col: n.c });
            }
        });
    }

    return false;
}

/********************************************
 * فحص الفوز الكامل
 ********************************************/
function checkLineWin() {
    if (lineWinTriggered) return;

    const rows = [...document.querySelectorAll(".board-row")];

    for (const row of rows) {
        const playable = [...row.querySelectorAll(".cell.playable")];
        if (playable.length === 0) continue;

        const greenWin = playable.every(c => c.classList.contains("green"));
        if (greenWin) {
            greenTotalPoints += 3;
            triggerWinEffect(playable, "الأخضر");
            return;
        }
    }

    if (checkRedPathWin())   return;
    if (checkGreenPathWin()) return;

    updateAdvancedScore();
}

/********************************************
 * مؤثرات الفوز
 ********************************************/
function createExplosion(x, y) {
    const p = document.createElement("div");
    p.className = "particle";

    const angle    = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 20;

    p.style.left = (x + Math.cos(angle) * distance) + "px";
    p.style.top  = (y + Math.sin(angle) * distance) + "px";

    document.body.appendChild(p);

    setTimeout(() => p.remove(), 900);
}

function triggerWinEffect(cells, winnerName) {
    if (lineWinTriggered) return;
    lineWinTriggered = true;

    const qOv = document.getElementById("questionOverlay");
    if (qOv) qOv.classList.add("hidden");

    cells.forEach(c => c.classList.add("win-cell"));

    cells.forEach(c => {
        const rect = c.getBoundingClientRect();
        createExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    document.body.classList.add("camera-effect");
    setTimeout(() => {
        document.body.classList.remove("camera-effect");
    }, 600);

    if (winSound) {
        winSound.currentTime = 0;
        winSound.play();
    }

    const msg = document.getElementById("congratsMessage");
    if (msg) msg.classList.remove("hidden");

    createExplosion(window.innerWidth / 2, window.innerHeight / 2);

    const winnerText = document.getElementById("winnerText");
    if (winnerText) {
        winnerText.textContent = `🎉 الفائز هو الفريق ${winnerName}! 🎉`;
    }

    const overlay = document.getElementById("winnerOverlay");
    if (overlay) overlay.classList.remove("hidden");

    const allCells = document.querySelectorAll(".cell");
    allCells.forEach(c => c.style.pointerEvents = "none");
}

/********************************************
 * الذكاء الاصطناعي
 ********************************************/
function aiChooseCell() {
    const playable = [...document.querySelectorAll(".cell.playable")];
       const empty = playable.filter(c =>
        !c.classList.contains("red") &&
        !c.classList.contains("green")
    );

    if (!empty.length) return null;

    return empty[Math.floor(Math.random() * empty.length)];
}

function aiAnswer(question) {
    const chance = Math.random();
    if (chance < 0.7) {
        return question.answer;
    } else {
        return question.choices.find(c => c !== question.answer) || question.answer;
    }
}

function aiPlay() {
    if (lineWinTriggered) return;

    const cell = aiChooseCell();
    if (!cell) return;

    const letter = cell.textContent.trim();
    const q = getQuestionByLetter(letter);
    if (!q) return;

    const aiSelected = aiAnswer(q);

    selectedCell = cell;
    currentPlayer = aiTeam;
    answeringTeam = aiTeam;

    timeLeft = getTimeForLevel();
    checkAnswer(aiSelected, q.answer, q);
}

/********************************************
 * تهيئة اللعبة بعد تحميل الصفحة
 ********************************************/
window.onload = () => {
    soundResult = document.getElementById("soundResult");
    hbSlow      = document.getElementById("hbSlow");
    hbMed       = document.getElementById("hbMed");
    hbFast      = document.getElementById("hbFast"); 
    winSound    = document.getElementById("winSound");
    goldenSound = document.getElementById("goldenSound");
    
    
   




    createBoard();
    updateScore();
    updateAdvancedScore();

    const startGameBtn  = document.getElementById("startGameBtn");
    const exitBtnBottom = document.getElementById("exitBtnBottom");
    const aiToggle      = document.getElementById("aiToggle");
    const returnButton  = document.getElementById("returnButton");

    if (startGameBtn) {
        startGameBtn.onclick = () => {
            document.getElementById("mainMenu").style.display = "none";
            document.getElementById("gameArea").style.display = "block";
        };
    }

    if (exitBtnBottom) {
        exitBtnBottom.onclick = () => {
            location.reload();
        };
    }

    if (aiToggle) {
        aiToggle.onclick = () => {
            aiEnabled = !aiEnabled;
            aiToggle.textContent = aiEnabled ? "إيقاف الكمبيوتر" : "تشغيل الكمبيوتر";
        };
    }

    if (returnButton) {
        returnButton.onclick = () => {
            document.getElementById("winnerOverlay").classList.add("hidden");
            document.getElementById("gameArea").style.display = "none";
            document.getElementById("mainMenu").style.display = "block";
            location.reload();
        };
    }

    const redBuzz   = document.getElementById("redBuzz");
    const greenBuzz = document.getElementById("greenBuzz");

    if (redBuzz) {
        redBuzz.onclick = () => {
            if (answeringTeam !== null) return;
            answeringTeam = "red";
            startAnswerPhase();
        };
    }

    if (greenBuzz) {
        greenBuzz.onclick = () => {
            if (answeringTeam !== null) return;
            answeringTeam = "green";
            startAnswerPhase();
        };
    }
};