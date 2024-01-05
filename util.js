var sounds = [];

for (let i = 0; i < 6; i++) {
  sounds.push(new Audio(`sounds/hit${i + 1}.mp3`));
}

const mpInitElem = document.getElementById("mp-init");
const mpInfoElem = document.getElementById("mp-info");

const mpNameElem = document.getElementById("mp-name");
const mpStatusElem = document.getElementById("mp-status");

const gameElem = document.getElementById("game");
const winElem = document.getElementById("win");
const winText = document.getElementById("win-text");

const msgElem = document.getElementById("msg");
const msgText = document.getElementById("msg-text");

const tileIntroAnimation = [
  {
    opacity: 0,
    transform: "scale(50%)",
  },
  {
    opacity: 1,
    transform: "scale(100%)",
  },
];

const colors = {
  EMPTY: "empty",
  BLACK: "black",
  WHITE: "white",
};

const W = 13;
const H = 13;

const L = -1;
const R = 1;
const T = -W;
const B = W;

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

function checkAxis(pos, dir1, dir2, touching1, touching2, board, turn) {
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

function checkWin(pos, board, turn) {
  if (checkAxis(pos, L, R, touchingLeftEdge, touchingRightEdge, board, turn)) {
    return true;
  }
  if (
    checkAxis(pos, T, B, touchingRightEdge, touchingBottomEdge, board, turn)
  ) {
    return true;
  }
  if (
    checkAxis(
      pos,
      L + T,
      R + B,
      touchingTopLeftEdge,
      touchingBottomRightEdge,
      board,
      turn
    )
  ) {
    return true;
  }
  if (
    checkAxis(
      pos,
      L + B,
      R + T,
      touchingBottomLeftEdge,
      touchingTopRightEdge,
      board,
      turn
    )
  ) {
    return true;
  }
  return false;
}

function checkMove(pos, board) {
  if (
    !touchingLeftEdge(pos, board) &&
    board[pos + L] != undefined &&
    board[pos + L] != colors.EMPTY
  ) {
    return true;
  }
  if (
    !touchingRightEdge(pos, board) &&
    board[pos + R] != undefined &&
    board[pos + R] != colors.EMPTY
  ) {
    return true;
  }
  if (
    !touchingTopEdge(pos, board) &&
    board[pos + T] != undefined &&
    board[pos + T] != colors.EMPTY
  ) {
    return true;
  }
  if (
    !touchingBottomEdge(pos, board) &&
    board[pos + B] != undefined &&
    board[pos + B] != colors.EMPTY
  ) {
    return true;
  }
  return false;
}

function msg(text, time) {
  console.log(text);
  var elem = document.createElement("div");
  elem.classList.add("msg");

  var textElem = document.createElement("p");
  textElem.classList.add("bold");
  textElem.innerText = text;

  elem.appendChild(textElem);
  document.body.appendChild(elem);

  setTimeout(() => {
    elem.remove();
  }, time);
}

function setStatus(status, id) {
  if (id) {
    mpNameElem.innerText = "Server name: " + id;
  }
  mpStatusElem.innerText = "Status: " + status;
}
