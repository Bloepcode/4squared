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

const gameElem = document.getElementById("game");
const winElem = document.getElementById("win");
const winText = document.getElementById("win-text");

const msgElem = document.getElementById("msg");
const msgText = document.getElementById("msg-text");

var sounds = [];

for (let i = 0; i < 6; i++) {
  sounds.push(new Audio(`sounds/hit${i + 1}.mp3`));
}

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

var initialMove = true;
var won = colors.EMPTY;

var board = [];

var mpEnabled = false;
var yourColor = colors.WHITE;

var turn = colors.WHITE;

var otherRestarted = false;
var meRestarted = false;

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
    gameElem.append(elem);
    elem.animate(tileIntroAnimation, {
      fill: "forwards",
      easing: "ease-in-out",
      duration: 300,
      delay: i * 3,
    });
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
  if (
    checkAxis(pos, L + T, R + B, touchingTopLeftEdge, touchingBottomRightEdge)
  ) {
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

function otherRestart() {
  otherRestarted = true;
  if (!meRestarted) {
    msg("Other person wants to restart!", 2000);
    return;
  }
  restart();
}

function restart() {
  if (mpEnabled && !meRestarted) {
    meRestarted = true;
    sendRestart();
  }
  if (mpEnabled && !otherRestarted) {
    msg("Waiting for other person to restart!", 2000);
    return;
  }
  msg("Restarting!", 2000);
  meRestarted = false;
  otherRestarted = false;
  initialMove = true;
  document.getElementById("win").classList.remove("display");
  won = colors.EMPTY;
  turn = colors.WHITE;
  document.body.style.backgroundColor =
    turn == colors.WHITE ? "#b98951" : "#805f3b";
  for (let i = 0; i < W * H; i++) {
    setTimeout(() => {
      tileElems[i].classList.remove("colored", "white", "black");
    }, i * 3);
    board[i] = colors.EMPTY;
  }
}

function place(id, elem) {
  if (checkWin(id)) {
    won = turn;
    winText.innerText = `${won} wins!`;
    winElem.classList.add("display");
  }
  sounds[Math.floor(Math.random() * sounds.length)].cloneNode(true).play();
  elem.classList.add(turn, "colored");
  board[id] = turn;
  turn = turn == colors.WHITE ? colors.BLACK : colors.WHITE;
  document.body.style.backgroundColor =
    turn == colors.WHITE ? "#b98951" : "#805f3b";
}

function handleClick(elem) {
  if (mpEnabled && turn != yourColor) {
    msg("Not your turn!", 1000);
    return;
  }
  if (won != colors.EMPTY) {
    return;
  }
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

  if (conn) {
    sendMove(id);
  }

  place(id, elem);
}

tileElems.forEach((element) => {
  element.addEventListener("click", (e) => {
    handleClick(e.target);
  });
});

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
