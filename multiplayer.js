class Multiplayer {
  peer = undefined;
  conn = undefined;
  id = undefined;
  isHost = false;
  thisColor = colors.EMPTY;
  game = undefined;
  wantRestart = false;
  otherRestart = false;

  connectionTimeoutId = undefined;

  constructor(game) {
    this.game = game;
    game.mp = this;
  }

  init() {
    if (this.peer) {
      msg("Multiplayer has already been initialized!", 1500);
      return;
    }

    mpInitElem.classList.remove("display");
    mpInfoElem.classList.add("display");
    this.game.restart();
    this.thisColor = colors.EMPTY;
  }

  connectionTimeout() {
    if (!this.conn) {
      msg("Connection timed out! Please try again...", 1500);
      this.disconnect();
    }
  }

  join(id) {
    if (!id) {
      msg("Please enter a server name!", 1500);
      return;
    }
    this.isHost = false;
    msg("Connecting!", 1500);
    setStatus("Connecting...", id);
    this.peer = new Peer();
    this.peer.on("open", () => {
      this.conn = this.peer.connect(id);
      this.conn.on("open", () => {
        msg("Connected!", 1500);
        setStatus("Connected", id);
        this.id = id;
      });
      this.conn.on("data", (data) => {
        this.handleData(data);
      });
      this.conn.on("close", () => {
        this.disconnect();
      });
    });
  }

  host() {
    this.isHost = true;
    this.thisColor = colors.WHITE;
    this.id = Math.random().toString(36).substring(2, 8);
    this.peer = new Peer(this.id);

    this.connectionTimeoutId = setTimeout(() => {
      this.connectionTimeout();
    }, 2000);

    this.peer.on("open", (_) => {
      clearTimeout(this.connectionTimeoutId);
      msg("Multiplayer has started, waiting for other player to join...", 1500);
      setStatus("Waiting for other player...", this.id);
    });

    this.peer.on("connection", (_conn) => {
      if (this.conn) {
        _conn.close();
        return;
      }
      msg("Connected, your turn!", 1500);
      setStatus("Connected!");
      this.conn = _conn;
      this.conn.on("open", () => {
        this.conn.send({ type: "init", color: colors.BLACK });
      });
      this.conn.on("close", () => {
        this.disconnect();
      });
      this.conn.on("data", (data) => {
        this.handleData(data);
      });
    });
  }

  handleData(data) {
    if (data.type == "move") {
      this.game.place(
        data.tile,
        document.querySelector(`[data-id="${data.tile}"]`)
      );
    } else if (data.type == "restart") {
      if (!this.isHost) {
        this.game._restart();
        this.thisColor = data.color;
      } else {
        msg("Other player wants to restart.", 1500);
      }
    } else if (data.type == "init") {
      this.thisColor = data.color;
    }
  }

  place(id) {
    this.conn.send({ type: "move", tile: id });
  }

  restart() {
    if (this.isHost) {
      this.conn.send({ type: "restart", color: this.thisColor });
      this.thisColor =
        this.thisColor == colors.WHITE ? colors.BLACK : colors.WHITE;
    } else {
      this.conn.send({ type: "restart" });
    }
  }

  disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = undefined;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = undefined;
    }
    this.isHost = false;
    this.thisColor = colors.EMPTY;
    this.id = undefined;
    this.game.mp = undefined;
    this.game = undefined;
    mpInitElem.classList.add("display");
    mpInfoElem.classList.remove("display");
    msg("Disconnected!", 1500);
    setStatus("Disconnected");
  }
}
