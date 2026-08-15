(function () {
  "use strict";

  const {
    BLACK,
    WHITE,
    EMPTY,
    BOARD_SIZE,
    rowOf,
    colOf,
    indexOf,
    neighbors,
    applyMove,
    getGroup,
    countStones,
  } = window.Go;

  // 开局常选点（角部 3-3、3-4、4-3、4-4 及星位）。
  const OPENING_POINTS = new Set();
  const cornerPoints = [3, 4];
  for (const r of cornerPoints) {
    for (const c of cornerPoints) {
      OPENING_POINTS.add(indexOf(r, c));
      OPENING_POINTS.add(indexOf(r, BOARD_SIZE - 1 - c));
      OPENING_POINTS.add(indexOf(BOARD_SIZE - 1 - r, c));
      OPENING_POINTS.add(indexOf(BOARD_SIZE - 1 - r, BOARD_SIZE - 1 - c));
    }
  }
  const stars = [3, 9, 15];
  for (const r of stars) {
    for (const c of stars) {
      OPENING_POINTS.add(indexOf(r, c));
    }
  }

  // 难度档位：18 级到 1 级，再初段到九段。
  const DIFFICULTIES = [];
  for (let kyu = 18; kyu >= 1; kyu--) {
    DIFFICULTIES.push({
      rank: DIFFICULTIES.length,
      id: "k" + kyu,
      label: kyu + "级",
    });
  }
  for (let dan = 1; dan <= 9; dan++) {
    DIFFICULTIES.push({
      rank: DIFFICULTIES.length,
      id: "d" + dan,
      label: dan === 1 ? "初段" : dan + "段",
    });
  }

  function difficultyLabel(rank) {
    const d = DIFFICULTIES[rank] || DIFFICULTIES[0];
    return d.label;
  }

  function difficultyConfig(rank) {
    const r = Math.max(0, Math.min(DIFFICULTIES.length - 1, Number(rank) || 0));
    const strength = r / (DIFFICULTIES.length - 1);
    return {
      rank: r,
      label: DIFFICULTIES[r].label,
      strength,
      depth: strength >= 0.5 ? 1 : 0,
      noise: 12 * (1 - strength) + 0.4,
      band: 9 * (1 - strength) + 0.6,
      blunder: 0.3 * (1 - strength),
      topK: Math.round(6 + 8 * strength),
      oppFactor: 0.6 + 0.25 * strength,
    };
  }

  function isEdge(index) {
    const r = rowOf(index);
    const c = colOf(index);
    return r === 0 || r === BOARD_SIZE - 1 || c === 0 || c === BOARD_SIZE - 1;
  }

  function nearbyCount(board, index, color, radius) {
    const r0 = rowOf(index);
    const c0 = colOf(index);
    let count = 0;
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = r0 + dr;
        const c = c0 + dc;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
        if (board[indexOf(r, c)] === color) count++;
      }
    }
    return count;
  }

  function opposite(color) {
    return color === BLACK ? WHITE : BLACK;
  }

  function evaluateMove(board, index, color) {
    const result = applyMove(board, index, color);
    if (!result) return -Infinity;

    const next = result.board;
    const capturedCount = result.captured.length;
    let score = 0;
    score += capturedCount * 16;

    const opponent = opposite(color);
    const ownGroup = getGroup(next, index);
    const liberties = ownGroup.liberties.length;

    if (liberties === 1 && capturedCount === 0) {
      score -= 28;
    } else if (liberties === 1) {
      score += 5;
    } else if (liberties === 2) {
      score -= 3;
    } else {
      score += Math.min(liberties, 8) * 0.7;
    }

    for (const nb of neighbors(index)) {
      if (next[nb] === opponent) {
        const group = getGroup(next, nb);
        if (group.liberties.length === 1) score += 11;
        else if (group.liberties.length === 2) score += 2;
      }
    }

    score += nearbyCount(next, index, color, 2) * 0.8;
    score += nearbyCount(next, index, opponent, 1) * -0.4;

    const totalStones = countStones(next);
    if (totalStones < 10 && OPENING_POINTS.has(index)) {
      score += 7;
    }

    if (isEdge(index)) score -= 5;

    return score;
  }

  // 粗略评估：AI 下某一手后，对手最强的一手大概有多好。
  function bestOpponentResponse(board, aiIndex, aiColor) {
    const result = applyMove(board, aiIndex, aiColor);
    if (!result) return 0;
    const opponent = opposite(aiColor);
    let best = -Infinity;
    for (let i = 0; i < result.board.length; i++) {
      if (result.board[i] !== EMPTY) continue;
      const score = evaluateMove(result.board, i, opponent);
      if (score > best) best = score;
    }
    return best === -Infinity ? 0 : best;
  }

  function chooseAiMove(game, color, difficultyRank) {
    if (game.over) return null;

    const cfg = difficultyConfig(difficultyRank);
    const legal = game.legalMoves(color);
    if (legal.length === 0) return null;

    // 低段位偶尔随手乱下，体现明显实力差。
    if (Math.random() < cfg.blunder) {
      return legal[Math.floor(Math.random() * legal.length)];
    }

    const scored = legal.map((index) => ({
      index,
      score: evaluateMove(game.board, index, color),
    }));
    scored.sort((a, b) => b.score - a.score);

    // 高段位多做一层思考：考虑对手的最佳应手。
    if (cfg.depth >= 1 && scored.length > 0) {
      const top = scored.slice(0, Math.min(cfg.topK, scored.length));
      for (const move of top) {
        move.score =
          move.score - cfg.oppFactor * bestOpponentResponse(game.board, move.index, color);
      }
      scored.sort((a, b) => b.score - a.score);
    }

    const jittered = scored.map((move) => ({
      index: move.index,
      score: move.score + (Math.random() * 2 - 1) * cfg.noise,
    }));
    jittered.sort((a, b) => b.score - a.score);

    const best = jittered[0].score;
    if (best < -12) return null; // 无好棋，选择虚着。
    const candidates = jittered.filter((move) => move.score >= best - cfg.band);
    return candidates[Math.floor(Math.random() * candidates.length)].index;
  }

  window.GoAI = {
    chooseAiMove,
    evaluateMove,
    DIFFICULTIES,
    difficultyConfig,
    difficultyLabel,
  };
})();
