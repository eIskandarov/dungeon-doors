// ======= CONFIGURABLE VARIABLES =======
const pointOptions = [50, 100];
const spookyEntities = ["ghost", "zombie", "vampire", "skeleton"];
const winScore = 1000;

// ======= GAME CLASSES & STATE =======
class Player {
  constructor(name) {
    this.name = name;
    this.score = 0;
  }

  addPoints(points) {
    this.score += points;
  }
}

class Game {
  constructor() {
    this.players = [new Player("P1"), new Player("P2")];
    this.currentPlayerIndex = 0;
    this.doorOutcomes = [];
    this.init();
  }

  init() {
    this.assignRandomOutcomes();
    this.updateScores();
    this.setActivePlayer();
    this.attachEventListeners();
  }

  assignRandomOutcomes() {
    this.doorOutcomes = Array.from({ length: 3 }, () => {
      const isSpooky = Math.random() < 0.33;
      return isSpooky
        ? spookyEntities[Math.floor(Math.random() * spookyEntities.length)]
        : pointOptions[Math.floor(Math.random() * pointOptions.length)];
    });
  }

  updateScores() {
    document.getElementById("player1").textContent =
      `P1: ${this.players[0].score}`;
    document.getElementById("player2").textContent =
      `P2: ${this.players[1].score}`;
  }

  setActivePlayer() {
    document.getElementById("player1").classList.remove("active");
    document.getElementById("player2").classList.remove("active");
    document
      .getElementById(`player${this.currentPlayerIndex + 1}`)
      .classList.add("active");
  }

  nextTurn() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    this.setActivePlayer();
  }

  openDoor(doorIndex) {
    const result = this.doorOutcomes[doorIndex];

    // Reveal logic (add delay or animation here)
    setTimeout(() => {
      if (typeof result === "number") {
        this.players[this.currentPlayerIndex].addPoints(result);
        this.updateScores();

        if (this.players[this.currentPlayerIndex].score >= winScore) {
          this.showModal(
            `${this.players[this.currentPlayerIndex].name} won the game!`,
          );
          return;
        }

        this.assignRandomOutcomes(); // refresh doors
      } else {
        // Spooky! Next player's turn
        this.nextTurn();
      }
    }, 1000); // simulate delay
  }

  attachEventListeners() {
    document.querySelectorAll(".door").forEach((door) => {
      door.addEventListener("click", () => {
        const index = parseInt(door.dataset.door);
        this.openDoor(index);
      });
    });

    document.getElementById("restartBtn").addEventListener("click", () => {
      this.showModal("Would you like to start a new game?", true);
    });

    document.getElementById("modal-action").addEventListener("click", () => {
      this.resetGame();
    });
  }

  showModal(message, confirmRestart = false) {
    document.getElementById("modal-message").textContent = message;
    document.getElementById("modal-action").textContent = confirmRestart
      ? "Yes"
      : "Start a New Game";
    document.getElementById("modal").classList.remove("hidden");
  }

  resetGame() {
    this.players.forEach((player) => (player.score = 0));
    this.currentPlayerIndex = 0;
    this.assignRandomOutcomes();
    this.updateScores();
    this.setActivePlayer();
    document.getElementById("modal").classList.add("hidden");
  }
}

const game = new Game();
