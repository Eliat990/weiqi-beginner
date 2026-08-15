(function () {
  "use strict";

  const Go = window.Go;
  const GoAI = window.GoAI;
  const DATA = window.GO_DATA;

  const BLACK = Go.BLACK;
  const WHITE = Go.WHITE;
  const EMPTY = Go.EMPTY;

  const BOARD_PX = 760;
  const PAD = 44;
  const CELL = (BOARD_PX - PAD * 2) / (Go.BOARD_SIZE - 1);
  const STAR_POINTS = new Set();
  [3, 9, 15].forEach((r) =>
    [3, 9, 15].forEach((c) => STAR_POINTS.add(Go.indexOf(r, c)))
  );

  const STORAGE_KEY = "go_learning_progress_v1";

  const state = {
    view: "home",
    chapterId: null,
    itemId: null,
  };

  const store = loadStore();

  function loadStore() {
    const empty = { completed: {}, stars: {}, attempts: {} };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return empty;
      const parsed = JSON.parse(raw);
      return Object.assign(empty, parsed);
    } catch (e) {
      return empty;
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      // 浏览器禁用本地存储时，进度仅在本次会话中有效。
    }
  }

  function toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      el.hidden = true;
    }, 1800);
  }

  function parseMove(text) {
    const m = /^([BW]):([A-T][0-9]{1,2})$/.exec(String(text).trim().toUpperCase());
    if (!m) return null;
    const color = m[1] === "B" ? BLACK : WHITE;
    const index = Go.parseCoord(m[2]);
    if (index === null) return null;
    return { color, index };
  }

  function stonesToBoard(stones) {
    const board = new Array(Go.BOARD_SIZE * Go.BOARD_SIZE).fill(EMPTY);
    for (const s of stones) {
      const move = parseMove(s);
      if (move) board[move.index] = move.color;
    }
    return board;
  }

  function px(index) {
    return {
      x: PAD + Go.colOf(index) * CELL,
      y: PAD + Go.rowOf(index) * CELL,
    };
  }

  function indexAt(x, y) {
    const col = Math.round((x - PAD) / CELL);
    const row = Math.round((y - PAD) / CELL);
    if (col < 0 || col >= Go.BOARD_SIZE || row < 0 || row >= Go.BOARD_SIZE) return null;
    return Go.indexOf(row, col);
  }

  function canvasIndex(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return indexAt(x, y);
  }

  function createBoardCanvas() {
    const canvas = document.createElement("canvas");
    canvas.className = "go-board";
    canvas.width = BOARD_PX;
    canvas.height = BOARD_PX;
    return canvas;
  }

  function drawBoard(canvas, board, opts) {
    opts = opts || {};
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 棋盘木色
    const bg = ctx.createLinearGradient(0, 0, BOARD_PX, BOARD_PX);
    bg.addColorStop(0, "#dcb06b");
    bg.addColorStop(1, "#c9954e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

    // 网格
    ctx.strokeStyle = "#5b3a1c";
    ctx.lineWidth = 1.1;
    for (let i = 0; i < Go.BOARD_SIZE; i++) {
      const p = PAD + i * CELL;
      ctx.beginPath();
      ctx.moveTo(PAD, p);
      ctx.lineTo(BOARD_PX - PAD, p);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p, PAD);
      ctx.lineTo(p, BOARD_PX - PAD);
      ctx.stroke();
    }

    // 星位
    ctx.fillStyle = "#5b3a1c";
    for (const s of STAR_POINTS) {
      const { x, y } = px(s);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 坐标
    ctx.fillStyle = "#4a341b";
    ctx.font = "12px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cols = "ABCDEFGHJKLMNOPQRST";
    for (let c = 0; c < Go.BOARD_SIZE; c++) {
      ctx.fillText(cols[c], PAD + c * CELL, BOARD_PX - PAD + 22);
    }
    ctx.textAlign = "right";
    for (let r = 0; r < Go.BOARD_SIZE; r++) {
      ctx.fillText(String(Go.BOARD_SIZE - r), PAD - 14, PAD + r * CELL);
    }

    // 地盘着色（数棋模式）
    if (opts.territory) {
      const shade = (list, color) => {
        ctx.fillStyle = color;
        for (const idx of list) {
          const { x, y } = px(idx);
          ctx.beginPath();
          ctx.arc(x, y, CELL * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      shade(opts.territory.black, "rgba(35,35,35,0.20)");
      shade(opts.territory.white, "rgba(255,255,255,0.55)");
    }

    // 提示标记
    if (opts.markers && opts.markers.length) {
      ctx.strokeStyle = "#d9534f";
      ctx.lineWidth = 3;
      for (const m of opts.markers) {
        const idx = Go.parseCoord(m);
        if (idx === null) continue;
        const { x, y } = px(idx);
        ctx.beginPath();
        ctx.arc(x, y, CELL * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 棋子
    for (let i = 0; i < board.length; i++) {
      if (board[i] === EMPTY) continue;
      const { x, y } = px(i);
      const r = CELL * 0.48;
      const grad = ctx.createRadialGradient(x - r * 0.32, y - r * 0.34, r * 0.12, x, y, r);
      if (board[i] === BLACK) {
        grad.addColorStop(0, "#777");
        grad.addColorStop(1, "#111");
      } else {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, "#d9d4ca");
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = board[i] === BLACK ? "#000" : "#b6b0a4";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 最后一手标记
    if (opts.lastMove !== undefined && opts.lastMove !== null && opts.lastMove >= 0) {
      const { x, y } = px(opts.lastMove);
      ctx.fillStyle = board[opts.lastMove] === BLACK ? "#e9d7a2" : "#b0543f";
      ctx.beginPath();
      ctx.arc(x, y, CELL * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    // 死子标记
    if (opts.dead && opts.dead.size) {
      ctx.strokeStyle = "#e34a3f";
      ctx.lineWidth = 3;
      for (const idx of opts.dead) {
        if (board[idx] === EMPTY) continue;
        const { x, y } = px(idx);
        const d = CELL * 0.28;
        ctx.beginPath();
        ctx.moveTo(x - d, y - d);
        ctx.lineTo(x + d, y + d);
        ctx.moveTo(x + d, y - d);
        ctx.lineTo(x - d, y + d);
        ctx.stroke();
      }
    }
  }

  function boardWrap(canvas, note) {
    const wrap = document.createElement("div");
    wrap.className = "board-wrap";
    wrap.appendChild(canvas);
    if (note) {
      const n = document.createElement("div");
      n.className = "board-note";
      n.textContent = note;
      wrap.appendChild(n);
    }
    return wrap;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, className, onClick) {
    const b = el("button", className, text);
    if (onClick) b.addEventListener("click", onClick);
    return b;
  }

  // ---------- 进度与章节 ----------

  function findChapter(chapterId) {
    return DATA.chapters.find((c) => c.id === chapterId);
  }

  function findItem(chapter, itemId) {
    return chapter.items.find((i) => i.id === itemId);
  }

  function chapterUnlocked(chapter, index) {
    if (index === 0) return true;
    const prev = DATA.chapters[index - 1];
    return prev.items.every((item) => store.completed[item.id]);
  }

  function chapterProgress(chapter) {
    const done = chapter.items.filter((i) => store.completed[i.id]).length;
    return { done, total: chapter.items.length };
  }

  function chapterStars(chapter) {
    return chapter.items.reduce((sum, i) => sum + (store.stars[i.id] || 0), 0);
  }

  function totalStars() {
    return DATA.chapters.reduce((s, c) => s + chapterStars(c), 0);
  }

  function totalDone() {
    return DATA.chapters.reduce((s, c) => s + chapterProgress(c).done, 0);
  }

  function totalItems() {
    return DATA.chapters.reduce((s, c) => s + c.items.length, 0);
  }

  function updateSummary() {
    document.getElementById("progressSummary").textContent =
      "已学 " + totalDone() + " / " + totalItems() + " 节 · 共 " + totalStars() + " 星";
  }

  function renderSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = "";
    sidebar.appendChild(el("h2", null, "学习章节"));

    DATA.chapters.forEach((chapter, idx) => {
      const unlocked = chapterUnlocked(chapter, idx);
      const card = el("div", "chapter-card" + (unlocked ? "" : " locked"));
      if (state.chapterId === chapter.id) card.classList.add("active");

      const top = el("div", "chapter-top");
      const number = el("div", "chapter-number", String(idx + 1).padStart(2, "0"));
      const title = el("div", "chapter-title", chapter.title);
      const stars = el("div", "chapter-stars", "★ " + chapterStars(chapter));
      top.appendChild(number);
      top.appendChild(title);
      top.appendChild(stars);

      const prog = chapterProgress(chapter);
      const bar = el("div", "chapter-progress");
      const fill = el("span");
      fill.style.width = Math.round((prog.done / prog.total) * 100) + "%";
      bar.appendChild(fill);

      const meta = el("div", "chapter-meta", unlocked ? prog.done + " / " + prog.total + " 节" : "完成上一章后解锁");

      card.appendChild(top);
      card.appendChild(bar);
      card.appendChild(meta);

      card.addEventListener("click", () => {
        if (!unlocked) {
          toast("请先完成上一章");
          return;
        }
        showChapter(chapter.id);
      });
      sidebar.appendChild(card);
    });
  }

  // ---------- 页面渲染 ----------

  function render() {
    updateSummary();
    renderSidebar();
    if (state.view === "home") renderHome();
    else if (state.view === "chapter") renderChapter();
    else if (state.view === "item") renderItem();
  }

  function renderHome() {
    const content = document.getElementById("content");
    content.innerHTML = "";
    content.appendChild(el("h1", null, "从零学会围棋的思路与赢法"));
    const sub = el("p", "subtitle", "先懂规则，再练死活，接着学布局、手筋、官子和攻防，最后跟 AI 下一盘完整棋。");
    content.appendChild(sub);

    const grid = el("div", "home-grid");
    DATA.chapters.forEach((chapter, idx) => {
      const unlocked = chapterUnlocked(chapter, idx);
      const card = el("div", "home-card");
      card.appendChild(el("h3", null, String(idx + 1).padStart(2, "0") + " · " + chapter.title));
      card.appendChild(el("p", null, chapter.subtitle));
      const b = button(unlocked ? "进入章节" : "尚未解锁", unlocked ? "primary" : null, () => {
        if (!unlocked) {
          toast("请先完成上一章");
          return;
        }
        showChapter(chapter.id);
      });
      if (!unlocked) b.disabled = true;
      card.appendChild(b);
      grid.appendChild(card);
    });

    const playCard = el("div", "home-card");
    playCard.appendChild(el("h3", null, "人机对战"));
    playCard.appendChild(el("p", null, "随时和入门 AI 下一盘 19 路棋。"));
    playCard.appendChild(button("开始对战", "primary", () => {
      const ch = DATA.chapters[DATA.chapters.length - 1];
      const item = ch.items.find((i) => i.type === "play");
      showItem(ch.id, item.id);
    }));
    grid.appendChild(playCard);

    content.appendChild(grid);
  }

  function showChapter(chapterId) {
    state.view = "chapter";
    state.chapterId = chapterId;
    render();
  }

  function renderChapter() {
    const chapter = findChapter(state.chapterId);
    const content = document.getElementById("content");
    content.innerHTML = "";
    content.appendChild(button("← 返回首页", null, () => {
      state.view = "home";
      render();
    }));
    content.appendChild(el("h1", null, chapter.title));
    content.appendChild(el("p", "subtitle", chapter.subtitle));

    chapter.items.forEach((item) => {
      const done = !!store.completed[item.id];
      const stars = store.stars[item.id] || 0;
      const row = el("div", "section-text");
      const head = el("div", "chapter-top");
      const title = el("div", "chapter-title", item.title);
      const badge = el("div", "chapter-stars", done ? "★ " + stars + " 已完成" : "未完成");
      head.appendChild(title);
      head.appendChild(badge);
      row.appendChild(head);
      if (item.intro) row.appendChild(el("p", "muted small", item.intro));
      row.appendChild(button(done ? "继续复习" : "开始学习", "primary", () => showItem(chapter.id, item.id)));
      content.appendChild(row);
    });
  }

  function showItem(chapterId, itemId) {
    state.view = "item";
    state.chapterId = chapterId;
    state.itemId = itemId;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderItem() {
    const chapter = findChapter(state.chapterId);
    const item = findItem(chapter, state.itemId);
    const content = document.getElementById("content");
    content.innerHTML = "";

    const back = button("← 返回章节", null, () => showChapter(chapter.id));
    content.appendChild(back);
    content.appendChild(el("h1", null, item.title));
    if (item.intro) content.appendChild(el("p", "subtitle", item.intro));

    if (item.type === "lesson") renderLesson(content, item, chapter);
    else if (item.type === "quiz") renderQuiz(content, item, chapter);
    else if (item.type === "puzzle") renderPuzzle(content, item, chapter);
    else if (item.type === "play") renderPlay(content, item, chapter);
  }

  // ---------- 课程 ----------

  function renderLesson(content, item, chapter) {
    item.sections.forEach((section) => {
      if (section.kind === "text") {
        const box = el("div", "section-text");
        box.innerHTML = section.html;
        content.appendChild(box);
      } else if (section.kind === "board") {
        const board = stonesToBoard(section.stones);
        const canvas = createBoardCanvas();
        drawBoard(canvas, board, { markers: section.markers || [] });
        content.appendChild(boardWrap(canvas, section.note));
      } else if (section.kind === "sequence") {
        renderSequence(content, section);
      }
    });

    const done = !!store.completed[item.id];
    const b = button(done ? "已学完，返回章节" : "完成本节", "primary", () => {
      if (!done) {
        store.completed[item.id] = true;
        store.stars[item.id] = Math.max(store.stars[item.id] || 0, 3);
        saveStore();
      }
      showChapter(chapter.id);
    });
    content.appendChild(b);
  }

  function renderSequence(content, section) {
    let step = -1;
    const initialBoard = stonesToBoard(section.initial.stones);
    const wrap = el("div", "board-wrap");
    const canvas = createBoardCanvas();
    const note = el("div", "board-note");
    wrap.appendChild(canvas);
    wrap.appendChild(note);
    content.appendChild(wrap);

    const controls = el("div", "game-controls");
    const prev = button("← 上一手", null, () => {
      if (step < -1) return;
      step -= 1;
      drawSequence();
    });
    const next = button("下一手 →", "primary", () => {
      if (step >= section.steps.length - 1) return;
      step += 1;
      drawSequence();
    });
    controls.appendChild(prev);
    controls.appendChild(next);
    content.appendChild(controls);

    function currentBoard() {
      const board = initialBoard.slice();
      for (let k = 0; k <= step; k++) {
        const move = parseMove(section.steps[k].move);
        if (move) {
          const result = Go.applyMove(board, move.index, move.color);
          if (result) {
            for (let i = 0; i < board.length; i++) board[i] = result.board[i];
          }
        }
      }
      return board;
    }

    function drawSequence() {
      const board = currentBoard();
      let last = null;
      if (step >= 0) {
        const move = parseMove(section.steps[step].move);
        if (move) last = move.index;
      }
      drawBoard(canvas, board, { lastMove: last });
      note.textContent = step < 0 ? section.note || "这是初始局面。" : section.steps[step].note;
      prev.disabled = step < 0;
      next.disabled = step >= section.steps.length - 1;
    }

    drawSequence();
  }

  // ---------- 测验 ----------

  function renderQuiz(content, item, chapter) {
    let qIndex = 0;
    let correct = 0;
    let answered = false;

    const box = el("div", "section-text");
    const qTitle = el("h3");
    const qText = el("p");
    const options = el("div");
    const feedback = el("div", "feedback");
    feedback.hidden = true;
    const nextBtn = button("下一题", "primary");
    nextBtn.hidden = true;

    box.appendChild(qTitle);
    box.appendChild(qText);
    box.appendChild(options);
    box.appendChild(feedback);
    box.appendChild(nextBtn);
    content.appendChild(box);

    function loadQuestion() {
      answered = false;
      const q = item.questions[qIndex];
      qTitle.textContent = "第 " + (qIndex + 1) + " / " + item.questions.length + " 题";
      qText.textContent = q.q;
      options.innerHTML = "";
      feedback.hidden = true;
      nextBtn.hidden = true;

      q.options.forEach((opt, i) => {
        const optBtn = el("button", "quiz-option", String.fromCharCode(65 + i) + ". " + opt);
        optBtn.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const isCorrect = i === q.answer;
          if (isCorrect) {
            optBtn.classList.add("correct");
            correct += 1;
          } else {
            optBtn.classList.add("wrong");
            options.querySelectorAll(".quiz-option")[q.answer].classList.add("correct");
          }
          feedback.hidden = false;
          feedback.className = "feedback " + (isCorrect ? "ok" : "no");
          feedback.textContent = (isCorrect ? "答对了！" : "答错了。") + " " + q.explain;
          nextBtn.hidden = false;
        });
        options.appendChild(optBtn);
      });
    }

    nextBtn.addEventListener("click", () => {
      qIndex += 1;
      if (qIndex >= item.questions.length) {
        const stars = Math.max(1, Math.round((correct / item.questions.length) * 3));
        store.completed[item.id] = true;
        store.stars[item.id] = Math.max(store.stars[item.id] || 0, stars);
        saveStore();
        box.innerHTML = "";
        box.appendChild(el("h3", null, "测验完成"));
        box.appendChild(el("p", null, "答对 " + correct + " / " + item.questions.length + " 题，获得 " + stars + " 星。"));
        box.appendChild(button("返回章节", "primary", () => showChapter(chapter.id)));
      } else {
        loadQuestion();
      }
    });

    loadQuestion();
  }

  // ---------- 死活/手筋题 ----------

  function renderPuzzle(content, item, chapter) {
    const board = stonesToBoard(item.board.stones);
    const nextColor = item.board.next === "B" ? BLACK : WHITE;
    const canvas = createBoardCanvas();
    let wrongMarks = [];
    let solved = false;
    let attempts = store.attempts[item.id] || 0;

    const wrap = boardWrap(canvas, "请点击棋盘上正确的落点（" + (nextColor === BLACK ? "黑" : "白") + "先）");
    content.appendChild(wrap);
    const feedback = el("div", "feedback");
    feedback.hidden = true;
    content.appendChild(feedback);

    const controls = el("div", "game-controls");
    const backBtn = button("返回章节", null, () => showChapter(chapter.id));
    backBtn.hidden = true;
    controls.appendChild(backBtn);
    content.appendChild(controls);

    function redraw() {
      const markers = (item.board.markers || []).concat(wrongMarks);
      drawBoard(canvas, board, { markers });
    }
    redraw();

    canvas.addEventListener("click", (e) => {
      if (solved) return;
      const idx = canvasIndex(canvas, e);
      if (idx === null || board[idx] !== EMPTY) return;
      const coord = Go.coordOf(idx);
      attempts += 1;
      if (item.answer.includes(coord)) {
        solved = true;
        board[idx] = nextColor;
        const stars = Math.max(1, 3 - (attempts - 1));
        store.completed[item.id] = true;
        store.attempts[item.id] = attempts;
        store.stars[item.id] = Math.max(store.stars[item.id] || 0, stars);
        saveStore();
        drawBoard(canvas, board, { lastMove: idx });
        feedback.hidden = false;
        feedback.className = "feedback ok";
        feedback.textContent = "正确！" + item.explanation + "（第 " + attempts + " 次答对，获得 " + stars + " 星）";
        backBtn.hidden = false;
      } else {
        store.attempts[item.id] = attempts;
        saveStore();
        wrongMarks.push(coord);
        redraw();
        toast("再想一想");
      }
    });
  }

  // ---------- 人机对战 ----------

  function renderPlay(content, item, chapter) {
    let selectedDifficulty = 0;
    const setup = el("div", "section-text");
    setup.appendChild(el("h3", null, "选择对手难度"));
    const diffRow = el("div", "game-controls");
    const diffSelect = el("select", "difficulty-select");
    GoAI.DIFFICULTIES.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = String(d.rank);
      opt.textContent = d.label;
      diffSelect.appendChild(opt);
    });
    diffSelect.value = String(selectedDifficulty);
    diffSelect.addEventListener("change", () => {
      selectedDifficulty = parseInt(diffSelect.value, 10) || 0;
    });
    diffRow.appendChild(diffSelect);
    setup.appendChild(diffRow);

    setup.appendChild(el("h3", null, "选择你的颜色"));
    const row = el("div", "game-controls");
    row.appendChild(button("我执黑（先手）", "primary", () => startGame(BLACK)));
    row.appendChild(button("我执白（后手）", null, () => startGame(WHITE)));
    setup.appendChild(row);
    content.appendChild(setup);

    function startGame(playerColor) {
      content.innerHTML = "";
      content.appendChild(button("← 返回章节", null, () => showChapter(chapter.id)));
      content.appendChild(el("h1", null, item.title));

      let game = new Go.GoGame();
      let aiColor = playerColor === BLACK ? WHITE : BLACK;
      const difficultyRank = selectedDifficulty;
      const aiLevelLabel = GoAI.difficultyLabel(difficultyRank);
      let mode = "play"; // play | scoring
      let deadMarks = new Set();
      let scoreResult = null;
      let aiTimer = null;

      const statusLine = el("div", "status-line");
      content.appendChild(statusLine);

      const canvas = createBoardCanvas();
      const wrap = boardWrap(canvas, "点击交叉点落子。你的回合才会响应。");
      content.appendChild(wrap);

      const controls = el("div", "game-controls");
      const passBtn = button("虚着", null, () => {
        if (mode !== "play" || game.current !== playerColor || game.over) return;
        game.pass();
        afterHumanMove();
      });
      const resignBtn = button("认输", null, () => {
        if (mode !== "play" || game.over) return;
        game.resign(playerColor);
        finishGame();
      });
      const scoreBtn = button("开始数棋", "primary", () => {
        if (mode === "scoring" || game.over) return;
        game.over = true;
        enterScoring();
      });
      const restartBtn = button("重新开始", null, () => startGame(playerColor));
      controls.appendChild(passBtn);
      controls.appendChild(scoreBtn);
      controls.appendChild(resignBtn);
      controls.appendChild(restartBtn);
      content.appendChild(controls);

      const resultBox = el("div", "result-box");
      resultBox.hidden = true;
      content.appendChild(resultBox);

      const scoringBar = el("div", "game-controls");
      const countBtn = button("计算胜负", "primary", () => computeScore());
      const clearDeadBtn = button("清除死子标记", null, () => {
        deadMarks.clear();
        redraw();
      });
      scoringBar.appendChild(countBtn);
      scoringBar.appendChild(clearDeadBtn);
      scoringBar.hidden = true;
      content.appendChild(scoringBar);

      function redraw() {
        drawBoard(canvas, game.board, {
          lastMove: game.history.length ? game.history[game.history.length - 1].index : null,
          dead: deadMarks,
          territory: scoreResult ? scoreResult.territory : null,
        });
      }

      function updateStatus(text) {
        statusLine.textContent = text || (game.current === BLACK ? "轮到黑棋" : "轮到白棋") + "（你是" + (playerColor === BLACK ? "黑" : "白") + " · AI " + aiLevelLabel + "）";
      }

      function afterHumanMove() {
        redraw();
        if (game.over) {
          finishGame();
          return;
        }
        updateStatus();
        scheduleAi();
      }

      function scheduleAi() {
        if (game.over || game.current !== aiColor) return;
        statusLine.textContent = "AI 思考中…";
        clearTimeout(aiTimer);
        aiTimer = setTimeout(() => {
          const move = GoAI.chooseAiMove(game, aiColor, difficultyRank);
          if (move === null) {
            game.pass();
          } else {
            game.place(move, aiColor);
          }
          redraw();
          if (game.over) {
            finishGame();
          } else {
            updateStatus();
          }
        }, 350);
      }

      function finishGame() {
        if (game.winner) {
          // 认输直接出结果。
          mode = "scoring";
          resultBox.hidden = false;
          resultBox.innerHTML = "";
          resultBox.appendChild(el("h3", null, "对局结束"));
          resultBox.appendChild(el("p", null, game.winner === BLACK ? "黑棋获胜（认输）。" : "白棋获胜（认输）。"));
          completePlay(item);
          resultBox.appendChild(button("返回章节", "primary", () => showChapter(chapter.id)));
          redraw();
        } else {
          enterScoring();
        }
      }

      function enterScoring() {
        mode = "scoring";
        scoringBar.hidden = false;
        statusLine.textContent = "数棋模式：点击棋子标记死子，再点“计算胜负”。";
        completePlay(item);
        redraw();
      }

      function computeScore() {
        scoreResult = Go.scoreBoard(game.board, Array.from(deadMarks));
        resultBox.hidden = false;
        resultBox.innerHTML = "";
        resultBox.appendChild(el("h3", null, "胜负结果"));
        const winnerName = scoreResult.winner === BLACK ? "黑棋" : "白棋";
        const margin = Go.formatFraction(scoreResult.margin);
        resultBox.appendChild(
          el("p", null, winnerName + "胜 " + margin + " 子（黑贴 3又3/4 子）。")
        );
        resultBox.appendChild(
          el("p", null, "黑棋 " + scoreResult.blackTotal + " 子（棋 + 空），白棋 " + scoreResult.whiteTotal + " 子。")
        );
        resultBox.appendChild(
          el("p", "muted small", "黑空 " + scoreResult.blackTerritory + " 目，白空 " + scoreResult.whiteTerritory + " 目，单官 " + scoreResult.neutral + " 点。")
        );
        completePlay(item);
        resultBox.appendChild(button("返回章节", "primary", () => showChapter(chapter.id)));
        redraw();
      }

      canvas.addEventListener("click", (e) => {
        const idx = canvasIndex(canvas, e);
        if (idx === null) return;
        if (mode === "scoring") {
          if (game.board[idx] === EMPTY) return;
          if (deadMarks.has(idx)) deadMarks.delete(idx);
          else deadMarks.add(idx);
          scoreResult = null;
          redraw();
          return;
        }
        if (game.over || game.current !== playerColor) return;
        if (!game.place(idx, playerColor)) {
          toast("这里不能落子");
          return;
        }
        afterHumanMove();
      });

      redraw();
      updateStatus();
      if (game.current === aiColor) scheduleAi();
    }
  }

  function completePlay(item) {
    if (!store.completed[item.id]) {
      store.completed[item.id] = true;
      store.stars[item.id] = Math.max(store.stars[item.id] || 0, 3);
      saveStore();
    }
  }

  render();
})();
