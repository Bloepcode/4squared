var peer = undefined;

var conn = undefined;
var id = undefined;

var onOpen = undefined;
var onMove = undefined;

function initMP(_onMove, _onOpen, id) {
  if (id) {
    peer = new Peer(id);
  } else {
    peer = new Peer();
  }

  onMove = _onMove;
  onOpen = _onOpen;

  peer.on("open", (id) => {
    msg("Opened");
    id = id;
    if (onOpen) {
      onOpen();
    }
    console.log(id);
  });

  peer.on("connection", function (_conn) {
    msg("Your turn!");
    restart();
    conn = _conn;
    conn.on("data", (data) => {
      handleData(data);
    });
  });
}

function handleData(data) {
  if (data.type == "move") {
    onMove(data.tile);
  }
}

function sendMove(tile) {
  if (!conn) {
    console.log("No connection has been made yet!");
    return;
  }
  conn.send({
    type: "move",
    tile,
  });
}

function connect(otherId) {
  restart();
  yourColor = colors.BLACK;
  if (conn) {
    console.log("Already connected!");
    return;
  }
  conn = peer.connect(otherId);
  conn.on("data", (data) => {
    handleData(data);
  });
  msg("Connecting!");
}

function onPlaceHandler(tile) {
  msg("Your turn!");
  place(tile, tileElems[tile]);
}

function mp(id, host, otherId) {
  mpEnabled = true;
  if (!host) {
    initMP(onPlaceHandler, undefined, id);
  } else {
    initMP(
      onPlaceHandler,
      () => {
        connect(otherId);
      },
      id
    );
  }
}
