/* --- Portal + QuizBattle Game Logic --- */
document.addEventListener('DOMContentLoaded', function () {
  // =====================================================
  // Портальные элементы (навигация между страницами)
  // =====================================================
  const startBtn = document.querySelector('.hero .btn');
  const navLinks = document.querySelectorAll('.nav a');
  const gameCards = document.querySelectorAll('.game-card');

  // Initialize quiz from portal
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      const hero = document.querySelector('.hero');
      const gameSection = document.getElementById('game-section');
      if (hero) hero.style.display = 'none';
      if (gameSection) {
        gameSection.style.display = 'block';
        const firstFocusable = gameSection.querySelector('button, input');
        if (firstFocusable) firstFocusable.focus();
      }
    });
  }

  // Nav link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Game card interactions
  gameCards.forEach(card => {
    card.addEventListener('click', function () {
      const title = this.querySelector('.game-card-info h3').textContent;
      const stats = this.querySelector('.game-card-stats');
      if (stats) {
        stats.style.color = '#ff6b35';
        setTimeout(() => stats.style.color = '#b0b0b0', 1500);
      }
      console.log(`Selected game: ${title}`);
    });
  });

  // Keyboard navigation - Escape resets to portal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const hero = document.querySelector('.hero');
      const gameSection = document.getElementById('game-section');
      if (gameSection && gameSection.style.display !== 'none') {
        gameSection.style.display = 'none';
        if (hero) hero.style.display = 'block';
      }
    }
  });
});

// =====================================================
// QuizBattle Game Logic (адаптировано с вычитанием 100 за ошибку)
// =====================================================

// Game state
var QUESTIONS = [
  { q: "Какой мой любимый цвет?", a: ["Красный", "Синий", "Чёрный", "Оранжевый"], c: 3 },
  { q: "Какая моя любимая аудиокнига?", a: ["Гарри Поттер", "Как приручить дракона", "Приключения семейки из Шербура", "Алиса в Стране чудес"], c: 0 },
  { q: "Какая моя любимая игра?", a: ["Minecraft", "Roblox", "Dors Paradox", "Portal 2"], c: 0 },
  { q: "Сколько мне лет?", a: ["9", "10", "11", "8"], c: 1 },
  { q: "Какая моя позиция в футболе?", a: ["Защитник", "Вратарь", "Нападающий", "Полузащитник"], c: 0 }
];

var MAX_POINTS = 1000;           // очков за верный ответ при 100% оставшегося времени
var TIMEUP = "Время вышло! ⏰";
var SHAPES = ["▲", "◆", "●", "■"];
var GOOD_EMO = ["🎉", "🔥", "😎", "🚀", "👏"];
var BAD = ["Не угадал(а) 😅", "Мимо! Но не сдавайся 💪", "Ой, почти 🙈", "Не-а! Бывает 🤷", "Увы, не то 😄"];

var RESULTS = [
  { min: 5, emoji: "🏆", title: "Ты мой лучший друг!", text: "Ты знаешь обо мне ВСЁ! Даже я бы так не ответил(а). Звание «Супердруг» твоё!" },
  { min: 4, emoji: "🥳", title: "Почти идеально!", text: "Всего одна ошибка! Ты настоящий друг, просто ещё немного секретов осталось." },
  { min: 3, emoji: "😎", title: "Хороший друг!", text: "Больше половины верно. Нам надо чаще гулять и болтать, чтобы стало 5 из 5!" },
  { min: 2, emoji: "🤔", title: "Мы только знакомимся", text: "Что-то ты угадал(а), но мне пора рассказать тебе о себе побольше!" },
  { min: 0, emoji: "𙈟", title: "Эй, мы вообще знакомы?", text: "Почти ни одного балла... Не переживай! Попробуй ещё раз, теперь ты точно запомнишь." }
];

var PRESETS = [[5, "5 сек"], [10, "10 сек"], [20, "20 сек"], [30, "30 сек"], [60, "1 мин"], [120, "2 мин"], [300, "5 мин"]];

// Score tracking (изменяется при вер/невер ответе)
var score = 0;
var correct = 0;
var MAX_SCORE = 5000;  // Максимум: 5 вопросов × 1000 очков

function $(id) { return document.getElementById(id); }

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined && text !== null) e.textContent = text;
  return e;
}

function show(name) {
  var screens = document.querySelectorAll(".screen");
  for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
  $("screen-" + name).classList.add("active");
  window.scrollTo(0, 0);
}

function pickResult(correct) {
  for (var i = 0; i < RESULTS.length; i++) {
    if (correct >= RESULTS[i].min) return RESULTS[i];
  }
  return RESULTS[RESULTS.length - 1];
}

function plural(n) {
  var a = n % 100, b = n % 10;
  if (a >= 11 && a <= 14) return "очков";
  if (b === 1) return "очко";
  if (b >= 2 && b <= 4) return "очка";
  return "очков";
}

function fmtTime(s) {
  if (s < 60) return s + " сек";
  var m = Math.floor(s / 60), r = s % 60;
  return r ? (m + " мин " + r + " сек") : (m + " мин");
}

function fmtClock(sec) {
  if (sec < 60) return String(sec);
  var m = Math.floor(sec / 60), r = sec % 60;
  return m + ":" + (r < 10 ? "0" : "") + r;
}

function confetti() {
  var colors = ["#e21b3c", "#1368ce", "#ffa602", "#26890c", "#ffffff", "#ff66c4"];
  for (var i = 0; i < 70; i++) {
    var d = document.createElement("div");
    d.className = "confetti";
    d.style.left = Math.random() * 100 + "vw";
    d.style.background = colors[Math.floor(Math.random() * colors.length)];
    d.style.animationDuration = (2.2 + Math.random() * 2.5) + "s";
    d.style.animationDelay = (Math.random() * 0.8) + "s";
    document.body.appendChild(d);
    (function (node) {
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 6000);
    })(d);
  }
}

// --- Panel ---
function Panel(cfg) {
  var N = QUESTIONS.length;
  var LIMIT_MS = (cfg.timeLimit || 30) * 1000;
  var idx = 0, score = 0, correct = 0, locked = false, done = false, lastChoose = 0;
  var timerId = null, deadline = 0;

  var root = el("div", "panel " + cfg.cls);
  if (cfg.color) root.style.setProperty("--pc", cfg.color);

  var quiz = el("div", "quiz");
  var top = el("div", "topbar");
  var namePill = null;
  if (cfg.name) {
    namePill = el("div", "pill name", cfg.name);
    namePill.style.background = cfg.color;
    top.appendChild(namePill);
  }
  var counter = el("div", "pill");
  var timePill = el("div", "pill time");
  var scoreEl = el("div", "pill score");
  top.appendChild(counter);
  top.appendChild(timePill);
  top.appendChild(scoreEl);

  var prog = el("div", "progress");
  var bar = el("div");
  prog.appendChild(bar);

  var tbar = el("div", "timebar");
  var timeFill = el("div");
  var timeLabel = el("span", "timelabel");
  tbar.appendChild(timeFill);
  tbar.appendChild(timeLabel);

  var qbox = el("div", "question-box");
  var answers = el("div", "answers");

  var fb = el("div", "feedback");
  var fbText = el("div", "fb-text");
  var nextBtn = el("button", "big-btn blue", "Дальше ➜");
  nextBtn.type = "button";
  fb.appendChild(fbText);
  fb.appendChild(nextBtn);

  quiz.appendChild(top);
  quiz.appendChild(prog);
  quiz.appendChild(tbar);
  quiz.appendChild(qbox);
  quiz.appendChild(answers);
  quiz.appendChild(fb);

  var res = el("div", "center result");
  var rEmoji = el("div", "result-emoji");
  var rScore = el("div", "result-score");
  var rSub = el("div", "result-sub");
  var rTitle = el("div", "result-title");
  var rText = el("p", "result-text");
  var rNote = el("div", "result-note");
  res.appendChild(rEmoji);
  res.appendChild(rScore);
  res.appendChild(rSub);
  res.appendChild(rTitle);
  res.appendChild(rText);
  res.appendChild(rNote);
  if (!cfg.duel) {
    var rb = el("div", "result-btns");
    var again = el("button", "big-btn", "Сыграть ещё раз");
    again.type = "button";
    again.addEventListener("click", function () { if (cfg.onRestart) cfg.onRestart(); });
    var menu = el("button", "big-btn blue", "В меню");
    menu.type = "button";
    menu.addEventListener("click", function () { if (cfg.onMenu) cfg.onMenu(); });
    rb.appendChild(again);
    rb.appendChild(menu);
    res.appendChild(rb);
  }
  res.style.display = "none";

  root.appendChild(quiz);
  root.appendChild(res);

  function setScore(pop) {
    scoreEl.textContent = "Счёт: " + score;
    if (pop) {
      scoreEl.classList.remove("pop");
      void scoreEl.offsetWidth;
      scoreEl.classList.add("pop");
    }
  }

  function pointsFor(msLeft) {
    var frac = msLeft / LIMIT_MS;
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;
    return Math.round(frac * MAX_POINTS);
  }

  // --- НОВОЕ: вычитание 100 очков за неправильный ответ ---
  function deductForWrong() {
    score = Math.max(0, score - 100);  // Минимальный баланс - 0
    setScore(false);
    // Обновляем текст обратной связи с указанием вычета
    fbText.className = "fb-text bad";
    fbText.textContent = "-100 " + BAD[BAD.length - 1];  // Используем последний вариант из BAD массива
  }
  // ------------------------------------------------------

  function render() {
    locked = false;
    var item = QUESTIONS[idx];
    counter.textContent = cfg.duel ? ((idx + 1) + "/" + N) : ("Вопрос " + (idx + 1) + " из " + N);
    bar.style.width = (idx / N * 100) + "%";
    qbox.textContent = item.q;
    fb.classList.remove("show");
    setScore(false);

    answers.innerHTML = "";
    for (var i = 0; i < item.a.length; i++) {
      (function (i) {
        var b = el("button", "ans c" + i);
        b.type = "button";
        b.appendChild(el("span", "shape", SHAPES[i]));
        b.appendChild(el("span", "txt", item.a[i]));
        if (cfg.keyLabels) b.appendChild(el("span", "keyhint", cfg.keyLabels[i]));
        b.addEventListener("click", function () { choose(i); });
        answers.appendChild(b);
      })(i);
    }
    nextBtn.textContent = (idx === N - 1) ? "Результат 🏁" : "Дальше ➜";
    startTimer();
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function updateTimerUI(ms) {
    if (ms < 0) ms = 0;
    var sec = Math.ceil(ms / 1000);
    var frac = ms / LIMIT_MS;
    timePill.textContent = "⏱ " + fmtClock(sec);
    timeFill.style.width = (frac * 100) + "%";
    timeLabel.textContent = "⚡ +" + pointsFor(ms);
    var red = frac <= 0.17 && sec <= 30;
    var orange = !red && frac <= 0.34 && sec <= 60;
    timePill.classList.toggle("low", red || orange);
    timeFill.className = red ? "red" : (orange ? "orange" : "");
  }

  function tick() {
    var left = deadline - Date.now();
    if (left <= 0) {
      stopTimer();
      updateTimerUI(0);
      timeUp();
      return;
    }
    updateTimerUI(left);
  }

  function startTimer() {
    stopTimer();
    deadline = Date.now() + LIMIT_MS;
    updateTimerUI(LIMIT_MS);
    timerId = setInterval(tick, 100);
  }

  function reveal(chosen) {
    var item = QUESTIONS[idx];
    var buttons = answers.children;
    for (var k = 0; k < buttons.length; k++) {
      buttons[k].disabled = true;
      if (k === item.c) {
        buttons[k].classList.add("right");
        buttons[k].appendChild(el("span", "mark", "✓"));
      } else if (k === chosen) {
        buttons[k].classList.add("wrong");
        buttons[k].appendChild(el("span", "mark", "✗"));
      } else {
        buttons[k].classList.add("dim");
      }
    }
  }

  function choose(i) {
    if (locked || done) return;
    var left = deadline - Date.now();
    if (left <= 0) { stopTimer(); updateTimerUI(0); timeUp(); return; }
    locked = true;
    lastChoose = Date.now();
    stopTimer();
    var ok = (i === QUESTIONS[idx].c);
    reveal(i);

    if (ok) {
      var pts = pointsFor(left);
      score += pts;
      correct++;
      setScore(true);
      fbText.className = "fb-text ok";
      fbText.textContent = pts > 0
        ? ("Верно! +" + pts + " " + plural(pts) + " " + GOOD_EMO[idx % GOOD_EMO.length])
        : "Верно, но слишком поздно: +0 очков 😅";
    } else {
      // --- НОВОЕ: вычитаем 100 очков за неправильный ответ ---
      deductForWrong();
      // ---------------------------------------------------
    }
    fb.classList.add("show");
  }

  function timeUp() {
    if (locked || done) return;
    locked = true;
    lastChoose = Date.now();
    reveal(-1);
    fbText.className = "fb-text bad";
    fbText.textContent = TIMEUP;
    fb.classList.add("show");
  }

  function next() {
    if (!locked || done) return;
    idx++;
    if (idx >= N) { finish(); } else { render(); }
  }

  function finish() {
    done = true;
    stopTimer();
    var r = pickResult(correct);
    rEmoji.textContent = r.emoji;
    rScore.textContent = String(score);
    rSub.textContent = "очков из " + (N * MAX_POINTS) + " · верно " + correct + " из " + N;
    rTitle.textContent = r.title;
    rText.textContent = r.text;
    rNote.textContent = cfg.duel ? "⏳ Ждём соперника…" : "";
    quiz.style.display = "none";
    res.style.display = "";
    if (!cfg.duel && correct >= 4) confetti();
    if (cfg.onFinish) cfg.onFinish();
  }

  nextBtn.addEventListener("click", next);

  render();

  return {
    root: root,
    destroy: function () { stopTimer(); },
    isDone: function () { return done; },
    getScore: function () { return score; },
    setNote: function (t) { rNote.textContent = t; rNote.style.animation = "none"; },
    markWinner: function () {
      root.classList.add("winner");
      if (namePill) namePill.textContent = "👑 " + cfg.name;
    },
    handleKey: function (code) {
      if (!cfg.keys) return false;
      var k = cfg.keys.indexOf(code);
      if (k < 0) return false;
      if (done) return true;
      if (!locked) { choose(k); }
      else if (Date.now() - lastChoose > 600) { next(); }
      return true;
    }
  };
}

// =====================================================
// Настройки и управление режимами
// =====================================================
var settings = { mode: "solo", time: 30 };
var arena = $("arena");
var banner = $("banner");
var rangeEl = $("time-range");
var chips = [];
var panels = [];
var mode = "solo";

function syncSetup() {
  rangeEl.value = String(settings.time);
  $("time-value").textContent = fmtTime(settings.time);
  for (var i = 0; i < chips.length; i++) {
    if (chips[i].secs === settings.time) chips[i].btn.classList.add("active");
    else chips[i].btn.classList.remove("active");
  }
  if (settings.mode === "solo") {
    $("btn-mode-solo").classList.add("active");
    $("btn-mode-duel").classList.remove("active");
  } else {
    $("btn-mode-duel").classList.add("active");
    $("btn-mode-solo").classList.remove("active");
  }
  $("duel-hint").style.display = settings.mode === "duel" ? "" : "none";
}

function buildPresets() {
  var box = $("presets");
  PRESETS.forEach(function (p) {
    var b = el("button", "chip", p[1]);
    b.type = "button";
    b.addEventListener("click", function () { settings.time = p[0]; syncSetup(); });
    box.appendChild(b);
    chips.push({ btn: b, secs: p[0] });
  });
}

function clearGame() {
  for (var i = 0; i < panels.length; i++) panels[i].destroy();
  panels = [];
  arena.innerHTML = "";
  banner.innerHTML = "";
  banner.classList.remove("show");
}

function toMenu() {
  clearGame();
  show("start");
}

function startGame() {
  mode = settings.mode;
  clearGame();
  arena.className = "arena " + mode;

  if (mode === "solo") {
    var p = Panel({
      cls: "solo", duel: false, timeLimit: settings.time,
      onRestart: startGame,
      onMenu: toMenu
    });
    panels.push(p);
    arena.appendChild(p.root);
  } else {
    var p1 = Panel({
      name: "Игрок 1", color: "#1fb6ff", cls: "duel", duel: true, timeLimit: settings.time,
      keys: ["KeyA", "KeyS", "KeyD", "KeyF"], keyLabels: ["A", "S", "D", "F"],
      onFinish: checkEnd
    });
    var p2 = Panel({
      name: "Игрок 2", color: "#ff4fa3", cls: "duel", duel: true, timeLimit: settings.time,
      keys: ["KeyJ", "KeyK", "KeyL", "Semicolon"], keyLabels: ["J", "K", "L", ";"],
      onFinish: checkEnd
    });
    panels.push(p1, p2);
    arena.appendChild(p1.root);
    arena.appendChild(el("div", "vs", "VS"));
    arena.appendChild(p2.root);
  }
  show("game");
}

function checkEnd() {
  if (mode !== "duel" || panels.length < 2) return;
  var a = panels[0], b = panels[1];
  if (!(a.isDone() && b.isDone())) return;

  var sa = a.getScore(), sb = b.getScore();
  var msg;
  if (sa === sb) {
    msg = "🤝 Ничья! " + sa + " : " + sb + " очков. Вы знаете меня одинаково хорошо!";
    a.setNote("Дуэль окончена!");
    b.setNote("Дуэль окончена!");
  } else {
    var winnerIsA = sa > sb;
    var w = winnerIsA ? a : b;
    var l = winnerIsA ? b : a;
    w.markWinner();
    w.setNote("🏆 Ты победил(а)!");
    l.setNote("Реванс? 😉");
    msg = "🏆 Победил " + (winnerIsA ? "Игрок 1" : "Игрок 2") + "! " + sa + " : " + sb + " очков";
    confetti();
  }

  banner.innerHTML = "";
  banner.appendChild(el("div", "banner-text", msg));
  var btns = el("div", "banner-btns");
  var rematch = el("button", "big-btn mid", "⚔️ Реванс");
  rematch.type = "button";
  rematch.addEventListener("click", startGame);
  var menu = el("button", "big-btn blue mid", "☰ В меню");
  menu.type = "button";
  menu.addEventListener("click", toMenu);
  btns.appendChild(rematch);
  btns.appendChild(menu);
  banner.appendChild(btns);
  banner.classList.add("show");
  if (banner.scrollIntoView) banner.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Клавиатура для дуэли
document.addEventListener("keydown", function (e) {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!$("screen-game").classList.contains("active")) return;
  for (var i = 0; i < panels.length; i++) {
    if (panels[i].handleKey(e.code)) { e.preventDefault(); break; }
  }
});

rangeEl.addEventListener("input", function () {
  var v = parseInt(rangeEl.value, 10);
  if (isNaN(v)) v = 30;
  settings.time = Math.min(300, Math.max(5, v));
  syncSetup();
});
$("btn-mode-solo").addEventListener("click", function () { settings.mode = "solo"; syncSetup(); });
$("btn-mode-duel").addEventListener("click", function () { settings.mode = "duel"; syncSetup(); });
$("btn-start").addEventListener("click", startGame);
$("btn-menu").addEventListener("click", toMenu);

buildPresets();
syncSetup();