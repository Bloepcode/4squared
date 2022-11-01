var peer = undefined;

var conn = undefined;
var id = undefined;

var onOpen = undefined;
var onMove = onPlaceHandler;
var onRestart = otherRestart;

var connectionTimeoutId = undefined;

async function connectionTimeout() {
  connectionTimeoutId = setTimeout(() => {
    if (!id) {
      msg("Could not open, maybe the username is taken!", 5000);
      peer = undefined;
    }
  }, 2000);
}

function initMP(_onOpen, id) {
  if (peer) {
    msg("Already hosting!", 2000);
    return;
  }

  connectionTimeout();

  if (id) {
    peer = new Peer(id);
  } else {
    peer = new Peer();
  }

  onOpen = _onOpen;

  peer.on("open", (id) => {
    clearTimeout(connectionTimeoutId);
    msg("Opened", 2000);
    id = id;
    if (onOpen) {
      onOpen();
    }
  });

  peer.on("connection", function (_conn) {
    msg("Connected, your turn!");
    restart();
    mpEnabled = true;
    conn = _conn;
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
  restart();
  mpEnabled = true;
  yourColor = colors.BLACK;
  if (conn) {
    msg("Already connected!", 4000);
    return;
  }
  conn = peer.connect(otherId);
  conn.on("data", (data) => {
    handleData(data);
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
