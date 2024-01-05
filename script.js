class Game {
  initialMove = true;
  won = colors.EMPTY;
  board = [];
  turn = colors.WHITE;
  mp = undefined;

  init(w, h) {
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
      elem.addEventListener("click", () => {
        this.handlePlace(elem);
      });
      this.board.push(colors.EMPTY);
    }
  }

  place(id, elem) {
    this.initialMove = false;
    sounds[Math.floor(Math.random() * sounds.length)].cloneNode(true).play();
    console.log(checkWin(id, this.board, this.turn));
    if (checkWin(id, this.board, this.turn)) {
      this.won = this.turn;
      winText.innerText = `${this.won} wins!`;
      winElem.classList.add("display");
    }
    this.board[id] = this.turn;
    elem.classList.add(this.turn, "colored");
    this.turn = this.turn == colors.WHITE ? colors.BLACK : colors.WHITE;
    document.body.style.backgroundColor =
      this.turn == colors.WHITE ? "#b98951" : "#805f3b";
  }

  handlePlace(elem) {
    const id = parseInt(elem.dataset.id);
    if (this.mp) {
      if (this.mp.thisColor != this.turn) {
        msg("It's not your turn!", 1500);
        return;
      }
    }
    if (this.initialMove) {
      if (this.mp && this.mp.conn) {
        this.mp.place(id);
      }
      this.place(id, elem);
      return;
    }
    if (this.board[id] != colors.EMPTY) {
      msg("Invalid move: tile is already taken", 1500);
      return;
    }
    if (this.won != colors.EMPTY) {
      msg("Invalid move: game is already over", 1500);
      return;
    }
    if (!checkMove(id, this.board)) {
      msg("Invalid move: no adjacent tiles", 1500);
      return;
    }
    if (this.mp && this.mp.conn) {
      this.mp.place(id);
    }
    this.place(id, elem);
  }

  _restart() {
    msg("Resetting game...", 1500);
    this.initialMove = true;
    this.won = colors.EMPTY;
    document.body.style.backgroundColor =
      this.turn == colors.WHITE ? "#b98951" : "#805f3b";
    const tileElems = Array.from(document.getElementsByClassName("tile"));
    for (let i = 0; i < tileElems.length; i++) {
      tileElems[i].classList.remove("colored", "white", "black");
    }
    document.getElementById("win").classList.remove("display");
    this.turn = colors.WHITE;
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = colors.EMPTY;
    }
  }

  restart() {
    if (this.mp && this.mp.conn) {
      this.mp.restart();
      if (!this.mp.isHost) {
        msg("Restart request send.", 1500);
        return;
      }
    }
    this._restart();
  }

  save() {
    const gameData = {
      board: this.board,
      turn: this.turn,
      won: this.won,
      initialMove: this.initialMove,
    };

    const jsonData = JSON.stringify(gameData);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "savegame" + ".json";
    a.click();

    URL.revokeObjectURL(url);
  }

  load() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        this.board = data.board;
        this.turn = data.turn;
        this.won = data.won;
        this.initialMove = data.initialMove;
        const tileElems = Array.from(document.getElementsByClassName("tile"));
        for (let i = 0; i < W * H; i++) {
          if (this.board[i] != colors.EMPTY) {
            tileElems[i].classList.add(this.board[i], "colored");
          }
        }
        document.body.style.backgroundColor =
          this.turn == colors.WHITE ? "#b98951" : "#805f3b";
        if (this.won != colors.EMPTY) {
          winText.innerText = `${won} wins!`;
          winElem.classList.add("display");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}
