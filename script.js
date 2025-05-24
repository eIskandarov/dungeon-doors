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

    // Select DOM elements
    this.scoreEls = document.querySelectorAll(".scoreboard__score");
    this.playerEls = document.querySelectorAll(".scoreboard__player");
    this.doorEls = document.querySelectorAll(".door");
    this.modal = document.querySelector(".game__modal");
    this.modalMessage = document.querySelector(".modal__message");
    this.modalYes = document.querySelector(".modal__button--confirm");
    this.modalNo = document.querySelector(".modal__button--cancel");
    this.resetBtn = document.querySelector(".game__reset");

    // Bind events
    this.doorEls.forEach((door, index) =>
      door.addEventListener("click", () => this.handleDoorClick(index)),
    );
    this.modalYes.addEventListener("click", () => this.startNewGame());
    this.modalNo.addEventListener("click", () => this.hideModal());
    this.resetBtn.addEventListener("click", () =>
      this.showModal("Would you like to start a new game?"),
    );

    this.updateUI();
  }

  get activePlayer() {
    return this.players[this.activePlayerIndex];
  }

  handleDoorClick(index) {
    if (this.isBusy) return;
    this.isBusy = true;

    const door = this.doorEls[index];
    this.openDoorAnimation(door);

    setTimeout(() => {
      const result = this.randomDoorResult();

      // Show result on door (could use icons or text later)
      door.textContent = result.label;
      door.classList.add("door--opened");

      this.playSound(result.sound);

      if (result.type === "points") {
        this.activePlayer.score += result.value;
        this.updateUI();

        if (this.activePlayer.score >= config.scoreToWin) {
          this.showModal(`${this.activePlayer.name} won the game!`);
        } else {
          this.resetDoors(); // Refresh location if points found
        }
      } else {
        // spooky item found, switch player
        this.switchPlayer();
      }

      this.isBusy = false;
    }, config.revealDelay);
  }

  randomDoorResult() {
    const rand = Math.random();
    if (rand < 0.4) {
      return {
        type: "points",
        value: 50,
        label: "+50",
        sound: config.sounds.smallReward,
      };
    } else if (rand < 0.7) {
      return {
        type: "points",
        value: 100,
        label: "+100",
        sound: config.sounds.bigReward,
      };
    } else {
      const spooky =
        config.spookyEntities[
        Math.floor(Math.random() * config.spookyEntities.length)
        ];
      return {
        type: "spooky",
        label: spooky.toUpperCase(),
        sound: config.sounds.spooky,
      };
    }
  }

  openDoorAnimation(door) {
    // Placeholder for door animation
    door.textContent = "";
    door.classList.add("door--animating");
    this.playSound(config.sounds.doorOpen);
  }

  switchPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % 2;
    this.updateUI();
  }

  resetDoors() {
    this.doorEls.forEach((door) => {
      door.textContent = "";
      door.classList.remove("door--opened", "door--animating");
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

  showModal(message) {
    this.modalMessage.textContent = message;
    this.modal.classList.remove("hidden");
  }

  hideModal() {
    this.modal.classList.add("hidden");
  }

  startNewGame() {
    this.players.forEach((player) => (player.score = 0));
    this.activePlayerIndex = 0;
    this.resetDoors();
    this.updateUI();
    this.hideModal();
  }

  playSound(filename) {
    // Placeholder - load actual audio later
    const audio = new Audio(`./assets/${filename}`);
    audio.play().catch(() => {
      // Avoid console errors for missing sounds
    });
  }
}

// ==== INIT ====
window.addEventListener("DOMContentLoaded", () => {
  new SpookyGame();
});
