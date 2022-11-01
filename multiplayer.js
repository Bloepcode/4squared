var peer = undefined;

var conn = undefined;
var id = undefined;

var onOpen = undefined;
var onMove = onPlaceHandler;
var onRestart = otherRestart;

var connectionTimeoutId = undefined;

const mpInitElem = document.getElementById("mp-init");
const mpInfoElem = document.getElementById("mp-info");

const mpNameElem = document.getElementById("mp-name");
const mpStatusElem = document.getElementById("mp-status");

function setStatus(status) {
  console.log("ID", id);
  if (id) {
    mpNameElem.innerText = "Server name: " + id;
  }
  mpStatusElem.innerText = "Status: " + status;
}

async function connectionTimeout() {
  connectionTimeoutId = setTimeout(() => {
    if (!id) {
      msg("Could not open, maybe the username is taken!", 5000);
      peer = undefined;
    }
  }, 2000);
}

function initMP(_onOpen, _id) {
  if (peer) {
    msg("Already initialized!", 2000);
    return;
  }

  id = _id;

  connectionTimeout();

  if (id) {
    peer = new Peer(id);
  } else {
    peer = new Peer();
  }

  onOpen = _onOpen;

  peer.on("open", (_id) => {
    clearTimeout(connectionTimeoutId);
    msg("Opened", 2000);
    setStatus("Waiting for other player...");

    mpInitElem.classList.remove("display");
    mpInfoElem.classList.add("display");
    if (onOpen) {
      onOpen();
    }
  });

  peer.on("connection", (_conn) => {
    msg("Connected, your turn!");
    setStatus("Connected!");
    restart();
    mpEnabled = true;
    conn = _conn;
    conn.on("close", () => {
      disconnect();
    });
    conn.on("data", (data) => {
      handleData(data);
    });
  });
}

function handleData(data) {
  if (data.type == "move") {
    onMove(data.tile);
  } else if (data.type == "restart") {
    onRestart();
  }
}

function sendMove(tile) {
  if (!conn) {
    msg("No connection has been made yet!", 5000);
    return;
  }
  conn.send({
    type: "move",
    tile,
  });
}

function sendRestart() {
  if (!conn) {
    msg("No connection has been made yet!", 5000);
    return;
  }
  conn.send({
    type: "restart",
  });
}

function connect(otherId) {
  if (conn) {
    msg("Already connected!", 4000);
    return;
  }
  restart();
  mpEnabled = true;
  yourColor = colors.BLACK;
  conn = peer.connect(otherId);
  conn.on("open", () => {
    msg("Connected!", 2000);
    setStatus("Connected");
  });
  conn.on("data", (data) => {
    handleData(data);
  });
  conn.on("close", () => {
    disconnect();
  });
  msg("Connecting!", 2000);
}

function onPlaceHandler(tile) {
  msg("Your turn!", 1000);
  place(tile, tileElems[tile]);
}

function mp(id, host, otherId) {
  if (!host) {
    initMP(undefined, id);
  } else {
    initMP(() => {
      connect(otherId);
    }, id);
  }
}

function disconnect() {
  if (!conn) {
    msg("Not connected!", 2000);
    return;
  }
  msg("Disconnected!", 2000);

  mpInitElem.classList.add("display");
  mpInfoElem.classList.remove("display");

  conn = undefined;
}
