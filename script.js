const gameElem = document.getElementById("game");
const winElem = document.getElementById("win");
const winText = document.getElementById("win-text");

const colors = {
  EMPTY: "empty",
  BLACK: "black",
  WHITE: "white",
};

const W = 13;
const H = 13;

const L = -1;
const R = 1;
const T = W;
const B = -W;

var initialMove = true;

var board = [];

var turn = colors.WHITE;

generateBoard(W, H);

const tileElems = Array.from(document.getElementsByClassName("tile"));

function touchingLeftEdge(pos) {
  return pos % W == 0;
}
function touchingRightEdge(pos) {
  return (pos - W + 1) % W == 0;
}
function touchingTopEdge(pos) {
  return pos < W;
}

function touchingBottomEdge(pos) {
  return pos >= W * H - W;
}

function touchingTopLeftEdge(pos) {
  return touchingTopEdge(pos) || touchingLeftEdge(pos);
}
function touchingTopRightEdge(pos) {
  return touchingTopEdge(pos) || touchingRightEdge(pos);
}
function touchingBottomLeftEdge(pos) {
  return touchingBottomEdge(pos) || touchingLeftEdge(pos);
}
function touchingBottomRightEdge(pos) {
  return touchingBottomEdge(pos) || touchingRightEdge(pos);
}

function generateBoard(w, h) {
  gameElem.style.gridTemplateColumns = `repeat(${w}, auto)`;
  for (let i = 0; i < w * h; i++) {
    let elem = document.createElement("div");
    elem.classList.add("tile");
    elem.dataset.id = i;
    if (i % 2 != 0) {
      elem.classList.add("dark-tile");
    }
    gameElem.append(elem);
    board.push(colors.EMPTY);
  }
}

function checkAxis(pos, dir1, dir2, touching1, touching2) {
  var amount = 1;
  for (let i = 0; i < 3; i++) {
    if (!touching1(pos) && board[pos + dir1 + dir1 * i] == turn) {
      amount += 1;
    } else {
      break;
    }
  }
  for (let i = 0; i < 3; i++) {
    if (!touching2(pos) && board[pos + dir2 + dir2 * i] == turn) {
      amount += 1;
    } else {
      break;
    }
  }
  return amount >= 4;
}

function checkWin(pos) {
  if (checkAxis(pos, L, R, touchingLeftEdge, touchingRightEdge)) {
    return true;
  }
  if (checkAxis(pos, T, B, touchingRightEdge, touchingBottomEdge)) {
    return true;
  }
  if (checkAxis(pos, L + T, R + B, touchingTopEdge, touchingBottomRightEdge)) {
    return true;
  }
  if (
    checkAxis(pos, L + B, R + T, touchingBottomLeftEdge, touchingTopRightEdge)
  ) {
    return true;
  }
  return false;
}

function checkMove(pos) {
  if (
    !touchingLeftEdge(pos) &&
    board[pos + L] != undefined &&
    board[pos + L] != colors.EMPTY
  ) {
    return true;
  }
  if (
    !touchingRightEdge(pos) &&
    board[pos + R] != undefined &&
    board[pos + R] != colors.EMPTY
  ) {
    return true;
  }
  if (
    !touchingTopEdge(pos) &&
    board[pos + T] != undefined &&
    board[pos + T] != colors.EMPTY
  ) {
    return true;
  }
  if (
    !touchingBottomEdge(pos) &&
    board[pos + B] != undefined &&
    board[pos + B] != colors.EMPTY
  ) {
    return true;
  }
  return false;
}

function handleClick(elem) {
  const id = parseInt(elem.dataset.id);
  if (board[id] != colors.EMPTY) {
    return;
  }
  if (!initialMove) {
    if (!checkMove(id)) {
      return;
    }
  } else {
    initialMove = false;
  }
  if (checkWin(id)) {
    winText.innerText = `${turn} wins!`;
    winElem.style.display = "inline";
  }
  elem.classList.add(turn);
  board[id] = turn;
  turn = turn == colors.WHITE ? colors.BLACK : colors.WHITE;
  document.body.style.backgroundColor =
    turn == colors.WHITE ? "#9f6c32" : "#855c2e";
}

tileElems.forEach((element) => {
  element.addEventListener("click", (e) => {
    handleClick(e.target);
  });
});
