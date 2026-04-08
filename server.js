const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const PORT = 3000;

let players = {};
let order = [];
let gameStarted = false;
let winner = null;
const FINISH = 100;

io.on("connection", (socket) => {
  if (order.length >= 2) {
    socket.emit("full");
    return;
  }

  const playerNumber = order.length + 1;
  order.push(socket.id);

  players[socket.id] = {
    id: socket.id,
    number: playerNumber,
    name: "Hráč " + playerNumber,
    progress: 0
  };

  socket.emit("you", players[socket.id]);
  sendState();

  if (order.length === 2) {
    gameStarted = true;
    sendState();
  }

  socket.on("setName", (name) => {
    if (!players[socket.id]) return;
    players[socket.id].name = String(name).slice(0, 20);
    sendState();
  });

  socket.on("run", () => {
    if (!gameStarted || winner) return;
    if (!players[socket.id]) return;

    players[socket.id].progress += 3;

    if (players[socket.id].progress >= FINISH) {
      players[socket.id].progress = FINISH;
      winner = players[socket.id].name;
    }

    sendState();
  });

  socket.on("restart", () => {
    winner = null;
    Object.values(players).forEach((p) => (p.progress = 0));
    if (order.length === 2) gameStarted = true;
    sendState();
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    order = order.filter((id) => id !== socket.id);
    gameStarted = false;
    winner = null;
    Object.values(players).forEach((p) => (p.progress = 0));
    sendState();
  });
});

function sendState() {
  io.emit("state", {
    players: Object.values(players),
    gameStarted,
    winner,
    finish: FINISH
  });
}

server.listen(PORT, () => {
  console.log(`Hotovo: http://localhost:${PORT}`);
});