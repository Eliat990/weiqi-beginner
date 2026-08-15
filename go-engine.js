(function () {
  "use strict";

  const BOARD_SIZE = 19;
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;

  const COLS = "ABCDEFGHJKLMNOPQRST";

  function indexOf(row, col) {
    return row * BOARD_SIZE + col;
  }

  function rowOf(index) {
    return Math.floor(index / BOARD_SIZE);
  }

  function colOf(index) {
    return index % BOARD_SIZE;
  }

  // 坐标格式：字母列 + 数字行，A1 位于左下角。
  function parseCoord(text) {
    if (!text || typeof text !== "string") return null;
    const m = text.trim().toUpperCase().match(/^([A-T])([1-9]|1[0-9])$/);
    if (!m) return null;
    const col = COLS.indexOf(m[1]);
    if (col < 0) return null;
    const rowNumber = parseInt(m[2], 10);
    if (rowNumber < 1 || rowNumber > 19) return null;
    const row = BOARD_SIZE - rowNumber;
    return indexOf(row, col);
  }

  function coordOf(index) {
    const row = rowOf(index);
    const col = colOf(index);
    return COLS[col] + (BOARD_SIZE - row);
  }

  function neighbors(index) {
    const row = rowOf(index);
    const col = colOf(index);
    const result = [];
    if (row > 0) result.push(indexOf(row - 1, col));
    if (row < BOARD_SIZE - 1) result.push(indexOf(row + 1, col));
    if (col > 0) result.push(indexOf(row, col - 1));
    if (col < BOARD_SIZE - 1) result.push(indexOf(row, col + 1));
    return result;
  }

  function colorName(color) {
    if (color === BLACK) return "黑";
    if (color === WHITE) return "白";
    return "空";
  }

  function cloneBoard(board) {
    return board.slice();
  }

  function snapshot(board) {
    return board.join("");
  }

  function getGroup(board, index) {
    const color = board[index];
    const stones = [];
    const liberties = [];
    if (color === EMPTY) return { color, stones, liberties };

    const seenStones = new Set();
    const seenLiberties = new Set();
    const stack = [index];
    seenStones.add(index);

    while (stack.length) {
      const cur = stack.pop();
      stones.push(cur);
      for (const nb of neighbors(cur)) {
        if (board[nb] === EMPTY) {
          if (!seenLiberties.has(nb)) {
            seenLiberties.add(nb);
            liberties.push(nb);
          }
        } else if (board[nb] === color && !seenStones.has(nb)) {
          seenStones.add(nb);
          stack.push(nb);
        }
      }
    }

    return { color, stones, liberties };
  }

  // 尝试落子，返回新棋盘与被提的对手子；若为自杀则返回 null。
  function applyMove(board, index, color) {
    if (board[index] !== EMPTY) return null;
    const next = cloneBoard(board);
    next[index] = color;
    const captured = [];
    const opponent = color === BLACK ? WHITE : BLACK;

    for (const nb of neighbors(index)) {
      if (next[nb] === opponent) {
        const group = getGroup(next, nb);
        if (group.liberties.length === 0) {
          for (const stone of group.stones) {
            next[stone] = EMPTY;
            captured.push(stone);
          }
        }
      }
    }

    const ownGroup = getGroup(next, index);
    if (ownGroup.liberties.length === 0) return null;
    return { board: next, captured };
  }

  function countStones(board) {
    let n = 0;
    for (let i = 0; i < board.length; i++) if (board[i] !== EMPTY) n++;
    return n;
  }

  function territoryOf(board) {
    const visited = new Array(board.length).fill(false);
    const blackTerritory = [];
    const whiteTerritory = [];
    const neutral = [];

    for (let i = 0; i < board.length; i++) {
      if (board[i] !== EMPTY || visited[i]) continue;
      const region = [];
      const stack = [i];
      visited[i] = true;
      let touchesBlack = false;
      let touchesWhite = false;

      while (stack.length) {
        const cur = stack.pop();
        region.push(cur);
        for (const nb of neighbors(cur)) {
          if (board[nb] === EMPTY) {
            if (!visited[nb]) {
              visited[nb] = true;
              stack.push(nb);
            }
          } else if (board[nb] === BLACK) {
            touchesBlack = true;
          } else if (board[nb] === WHITE) {
            touchesWhite = true;
          }
        }
      }

      if (touchesBlack && !touchesWhite) blackTerritory.push(...region);
      else if (touchesWhite && !touchesBlack) whiteTerritory.push(...region);
      else neutral.push(...region);
    }

    return { blackTerritory, whiteTerritory, neutral };
  }

  function formatFraction(value) {
    // 将 0.25 / 0.5 / 0.75 显示为中文分数。
    if (Math.abs(value - Math.round(value)) < 0.001) {
      return String(Math.round(value));
    }
    if (Math.abs(value - 0.25) < 0.001) return "1/4";
    if (Math.abs(value - 0.5) < 0.001) return "1/2";
    if (Math.abs(value - 0.75) < 0.001) return "3/4";
    return value.toFixed(2);
  }

  class GoGame {
    constructor() {
      this.reset();
    }

    reset() {
      this.board = new Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY);
      this.current = BLACK;
      this.history = [];
      this.koPoint = -1;
      this.passes = 0;
      this.over = false;
      this.winner = null;
    }

    setBoard(board) {
      this.board = cloneBoard(board);
      this.current = BLACK;
      this.history = [];
      this.koPoint = -1;
      this.passes = 0;
      this.over = false;
      this.winner = null;
    }

    isLegal(index, color) {
      if (this.over) return false;
      if (index < 0 || index >= this.board.length) return false;
      if (this.board[index] !== EMPTY) return false;
      if (color !== BLACK && color !== WHITE) return false;
      if (index === this.koPoint) return false;
      return applyMove(this.board, index, color) !== null;
    }

    place(index, color) {
      if (!this.isLegal(index, color)) return false;
      const result = applyMove(this.board, index, color);
      this.board = result.board;

      this.koPoint = -1;
      if (result.captured.length === 1) {
        const playedGroup = getGroup(this.board, index);
        if (playedGroup.stones.length === 1 && playedGroup.liberties.length === 1) {
          this.koPoint = result.captured[0];
        }
      }

      this.history.push({ color, index, captured: result.captured });
      this.passes = 0;
      this.current = color === BLACK ? WHITE : BLACK;
      return true;
    }

    pass() {
      if (this.over) return;
      this.history.push({ color: this.current, pass: true });
      this.passes += 1;
      this.koPoint = -1;
      if (this.passes >= 2) {
        this.over = true;
      } else {
        this.current = this.current === BLACK ? WHITE : BLACK;
      }
    }

    resign(color) {
      this.over = true;
      this.winner = color === BLACK ? WHITE : BLACK;
    }

    legalMoves(color) {
      const moves = [];
      for (let i = 0; i < this.board.length; i++) {
        if (this.isLegal(i, color)) moves.push(i);
      }
      return moves;
    }
  }

  // 终局算分：deadIndices 为用户标记的死子。
  function scoreBoard(board, deadIndices) {
    const working = cloneBoard(board);
    for (const d of deadIndices) {
      if (working[d] !== EMPTY) working[d] = EMPTY;
    }

    const territory = territoryOf(working);
    let blackStones = 0;
    let whiteStones = 0;
    for (let i = 0; i < working.length; i++) {
      if (working[i] === BLACK) blackStones += 1;
      else if (working[i] === WHITE) whiteStones += 1;
    }

    const blackTotal = blackStones + territory.blackTerritory.length;
    const whiteTotal = whiteStones + territory.whiteTerritory.length;
    const diff = blackTotal - whiteTotal;

    // 中国规则：黑贴 3 又 3/4 子（7.5 目）。
    let winner;
    let margin;
    if (diff >= 8) {
      winner = BLACK;
      margin = (diff - 7.5) / 2;
    } else {
      winner = WHITE;
      margin = (7.5 - diff) / 2;
    }

    return {
      blackStones,
      whiteStones,
      blackTerritory: territory.blackTerritory.length,
      whiteTerritory: territory.whiteTerritory.length,
      neutral: territory.neutral.length,
      blackTotal,
      whiteTotal,
      winner,
      margin,
      territory: {
        black: territory.blackTerritory,
        white: territory.whiteTerritory,
        neutral: territory.neutral,
      },
      workingBoard: working,
    };
  }

  window.Go = {
    BOARD_SIZE,
    EMPTY,
    BLACK,
    WHITE,
    parseCoord,
    coordOf,
    indexOf,
    rowOf,
    colOf,
    neighbors,
    colorName,
    cloneBoard,
    snapshot,
    getGroup,
    applyMove,
    countStones,
    territoryOf,
    scoreBoard,
    formatFraction,
    GoGame,
  };
})();
