// ==== CONFIGURATION ====
const config = {
  scoreToWin: 1000,
  pointValues: [50, 100],
  spookyEntities: ["ghost", "zombie", "skeleton", "vampire"],
  sounds: {
    doorOpen: "sound-door.mp3",
    smallReward: "sound-50.mp3",
    bigReward: "sound-100.mp3",
    spooky: "sound-spooky.mp3",
  },
  revealDelay: 1000, // ms before showing door result
};

// ==== GAME CLASS ====
class SpookyGame {
  constructor() {
    this.players = [
      { name: "P1", score: 0 },
      { name: "P2", score: 0 },
    ];
    this.activePlayerIndex = 0;
    this.isBusy = false;

    this.scoreEls = document.querySelectorAll(".scoreboard__score");
    this.playerEls = document.querySelectorAll(".scoreboard__player");
    this.doorEls = document.querySelectorAll(".door");
    this.modal = document.querySelector(".game__modal");
    this.modalMessage = document.querySelector(".modal__message");
    this.modalYes = document.querySelector(".modal__button--confirm");
    this.modalNo = document.querySelector(".modal__button--cancel");
    this.resetBtn = document.querySelector(".game__reset");
    this.gameContainer = document.querySelector(".game");

    this.doorResults = [];

    this.doorEls.forEach((door, index) =>
      door.addEventListener("click", () => this.handleDoorClick(index)),
    );
    this.modalYes.addEventListener("click", () => this.startNewGame());
    this.modalNo.addEventListener("click", () => this.hideModal());
    this.resetBtn.addEventListener("click", () =>
      this.showModal("Would you like to start a new game?"),
    );

    this.updateUI();
    this.generateDoorResults();
  }

  get activePlayer() {
    return this.players[this.activePlayerIndex];
  }

  handleDoorClick(index) {
    if (this.isBusy) return;
    this.isBusy = true;
    const door = this.doorEls[index];

    this.lockOtherDoors(index);
    this.animateDoorOpen(door);

    setTimeout(() => {
      this.revealResult(door, index);
    }, config.revealDelay);
  }

  revealResult(door, index) {
    const result = this.doorResults[index];
    if (result.type === "points") {
      door.textContent = result.label;
      this.activePlayer.score += result.value;
      this.updateUI();
      this.playSound(result.sound);

      if (this.activePlayer.score >= config.scoreToWin) {
        this.showModal(`${this.activePlayer.name} won the game!`);
      } else {
        this.resetDoors();
        this.generateDoorResults();
      }
      this.isBusy = false;
    } else {
      door.classList.add(
        "door--monster",
        `door--${result.label.toLowerCase()}`,
      );
      this.playSound(result.sound);
      setTimeout(() => {
        this.switchPlayer();
        this.showModal(`${this.activePlayer.name} turn`, true);
      }, 1000);
    }
  }

  generateDoorResults() {
    this.doorResults = Array.from({ length: this.doorEls.length }, () =>
      this.randomDoorResult(),
    );
  }

  randomDoorResult() {
    const PROB_POINTS_50 = 0.4;
    const PROB_POINTS_100 = 0.7; // 0.7 - 0.4 = 30% chance

    const rand = Math.random();

    if (rand < PROB_POINTS_50) {
      return {
        type: "points",
        value: 50,
        label: "+50",
        sound: config.sounds.smallReward,
      };
    }

    if (rand < PROB_POINTS_100) {
      return {
        type: "points",
        value: 100,
        label: "+100",
        sound: config.sounds.bigReward,
      };
    }

    // Only spooky remains (~30% chance)
    const spookyEntities = config.spookyEntities;
    const spooky =
      spookyEntities[Math.floor(Math.random() * spookyEntities.length)];

    return {
      type: "spooky",
      label: spooky,
      sound: config.sounds.spooky,
    };
  }

  animateDoorOpen(door) {
    door.textContent = "";
    door.classList.add("door--animating");
    this.playSound(config.sounds.doorOpen);
  }

  lockOtherDoors(activeIndex) {
    this.doorEls.forEach((door, index) => {
      if (index !== activeIndex) {
        door.classList.add("door--locked");
      }
    });
  }

  unlockAllDoors() {
    this.doorEls.forEach((door) => door.classList.remove("door--locked"));
    this.isBusy = false;
  }

  switchPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % 2;
    this.updateUI();
  }

  resetDoors() {
    this.doorEls.forEach((door) => {
      door.textContent = "";
      door.classList.remove(
        "door--opened",
        "door--animating",
        "door--locked",
        "door--monster",
        ...config.spookyEntities.map((m) => `door--${m}`),
      );
    });
  }

  updateUI() {
    this.players.forEach((player, index) => {
      this.scoreEls[index].textContent = player.score;
      this.playerEls[index].classList.toggle(
        "scoreboard__player--active",
        index === this.activePlayerIndex,
      );
    });
  }

  showModal(message, isTurn = false) {
    this.modalMessage.textContent = message;
    this.modal.classList.remove("hidden");
    if (isTurn) {
      this.modalYes.textContent = "Go";
      this.modalNo.classList.add("hidden");
    } else {
      this.modalYes.textContent = "Yes";
      this.modalNo.classList.remove("hidden");
    }
  }

  hideModal() {
    this.modal.classList.add("hidden");
    this.unlockAllDoors();
  }

  startNewGame() {
    this.players.forEach((player) => (player.score = 0));
    this.activePlayerIndex = 0;
    this.resetDoors();
    this.updateUI();
    this.hideModal();
    this.generateDoorResults();
  }

  playSound(filename) {
    const audio = new Audio(`./assets/${filename}`);
    audio.play().catch(() => { });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new SpookyGame();
});
