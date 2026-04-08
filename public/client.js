const socket = io(); // DŮLEŽITÉ – žádný localhost!

const statusEl = document.getElementById("status");
const horse1 = document.getElementById("horse1");
const horse2 = document.getElementById("horse2");
const namesEl = document.getElementById("names");
const saveBtn = document.getElementById("save");
const restartBtn = document.getElementById("restart");
const nameInput = document.getElementById("name");

let me = null;

socket.on("you", (player) => {
  me = player;
});

socket.on("full", () => {
  statusEl.textContent = "Hra je plná (max 2 hráči)";
});

socket.on("state", (state) => {
  const players = state.players;

  if (players.length < 2) {
    statusEl.textContent = `Čekání na hráče... (${players.length}/2)`;
  } else if (state.winner) {
    statusEl.textContent = `🏆 Vyhrál: ${state.winner}`;
  } else if (state.gameStarted) {
    statusEl.textContent = "Závod běží! Mačkej mezerník!";
  }

  const p1 = players.find((p) => p.number === 1);
  const p2 = players.find((p) => p.number === 2);

  // pohyb koní
  if (p1) horse1.style.left = `${p1.progress * 8}px`;
  if (p2) horse2.style.left = `${p2.progress * 8}px`;

  // jména
  namesEl.innerHTML = `
    <p>${p1 ? p1.name : "čeká se..."} (${p1 ? p1.progress : 0})</p>
    <p>${p2 ? p2.name : "čeká se..."} (${p2 ? p2.progress : 0})</p>
  `;
});

// tlačítka
saveBtn.addEventListener("click", () => {
  socket.emit("setName", nameInput.value);
});

restartBtn.addEventListener("click", () => {
  socket.emit("restart");
});

// ovládání
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    socket.emit("run");
  }
});