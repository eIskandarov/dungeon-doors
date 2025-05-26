// ==== CONFIGURATION ====
const config = {
  scoreToWin: 1000,
  pointValues: [25, 50],
  diffucultyThreshold: 900,
  spookyEntities: ["ghost", "zombie", "skeleton", "vampire", "mummy"],
  sounds: {
    doorOpen: [
      "door-open-1.mp3",
      "door-open-2.mp3",
      "door-open-3.mp3",
      "door-open-4.mp3",
    ],
    smallReward: [
      "small-reward-1.mp3",
      "small-reward-2.mp3",
      "small-reward-3.mp3",
    ],
    bigReward: ["big-reward-1.mp3", "big-reward-2.mp3", "big-reward-3.mp3"],
    spooky: ["spooky.mp3"],
    ghost: ["ghost-1.mp3", "ghost-2.mp3", "ghost-3.mp3"],
    zombie: ["zombie-1.mp3", "zombie-2.mp3", "zombie-3.mp3", "zombie-4.mp3"],
    skeleton: ["skeleton-1.mp3", "skeleton-2.mp3", "skeleton-3.mp3"],
    vampire: ["vampire-1.mp3", "vampire-2.mp3", "vampire-3.mp3"],
    mummy: ["mummy-1.mp3", "mummy-2.mp3", "mummy-3.mp3"],
    win: [
      "win-1.mp3",
      "win-2.mp3",
      "win-3.mp3",
      "win-4.mp3",
      "win-5.mp3",
      "win-6.mp3",
      "win-7.mp3",
    ],
    gameStart: [
      "game-start-1.mp3",
      "game-start-2.mp3",
      "game-start-3.mp3",
      "game-start-4.mp3",
      "game-start-5.mp3",
      "game-start-6.mp3",
      "game-start-7.mp3",
    ],
  },
  revealDelay: 1500, // ms before updating doors
  flashDisplayDelay: 800, // ms before showing door result
};

// ==== GAME CLASS ====
class SpookyGame {
  modalButtonText = {
    yes: "Yes",
    no: "No",
    go: "Go",
  };

  doorStates = {
    opened: "door--opened",
    animating: "door--animating",
    locked: "door--locked",
    monster: "door--monster",
    smallReward: "door--small-reward",
    bigReward: "door--big-reward",
  };

  state = {
    startNewGame: false,
    isAnimating: false,
  };

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
    this.modalYes.addEventListener("click", () => this.handleYesClick());
    this.modalNo.addEventListener("click", () => this.hideModal());
    this.resetBtn.addEventListener("click", () =>
      this.showModal("Would you like to start a new game?"),
    );

    this.updatePlayerScoreUI();
    this.generateDoorResults();
  }

  get activePlayer() {
    return this.players[this.activePlayerIndex];
  }

  handleDoorClick(index) {
    if (this.state.isAnimating) return;

    if (this.isBusy) return;
    this.isBusy = true;
    const door = this.doorEls[index];

    this.lockOtherDoors(index);
    this.animateDoorOpen(door);

    setTimeout(() => {
      this.revealResult(door, index);
    }, config.flashDisplayDelay);
  }

  revealResult(door, index) {
    const result = this.doorResults[index];
    const { type } = result;

    // Guard: If no result, exit early
    if (!result) return;

    // Strategy pattern: Dispatch to the right handler
    const handlers = {
      points: () => this.handlePointsReward(door, result),
      spooky: () => this.handleSpookyEvent(door, result),
    };

    // Execute the handler (or default if type is invalid)
    const handler =
      handlers[type] || (() => console.error("Unknown result type"));
    handler();

    this.isBusy = false; // Always mark as not busy
  }

  // --- Extracted Functions ---
  handlePointsReward(door, result) {
    const { reward, value, sound } = result;
    door.classList.add(`${reward.toLowerCase()}`);
    this.activePlayer.score += value;
    this.updatePlayerScoreUI();
    this.playSound(sound);

    // Early exit if player won
    if (this.activePlayer.score >= config.scoreToWin) {
      this.showModal(`${this.activePlayer.name} won the game!`);
      return;
    }

    // Otherwise, reset doors
    setTimeout(() => {
      this.resetDoors();
      this.generateDoorResults();
    }, config.revealDelay);
  }

  handleSpookyEvent(door, result) {
    const { label, sound } = result;
    door.classList.add(this.doorStates.monster, `door--${label.toLowerCase()}`);
    this.playSound(sound);

    setTimeout(() => {
      this.switchPlayer();
      this.showModal(`${this.activePlayer.name}'s turn`, true);
    }, 1000);
  }

  generateDoorResults() {
    this.doorResults = Array.from({ length: this.doorEls.length }, () =>
      this.randomDoorResult(),
    );
  }

  randomDoorResult() {
    let PROB_POINTS_SMALL = 0.4;
    let PROB_POINTS_BIG = 0.7; // 0.7 - 0.4 = 30% chance

    if (this.activePlayer.score >= config.diffucultyThreshold) {
      PROB_POINTS_SMALL = 0.2;
      PROB_POINTS_BIG = 0.4; // 0.7 - 0.4 = 30% chance
    }

    const rand = Math.random();

    if (rand < PROB_POINTS_SMALL) {
      return {
        type: "points",
        value: config.pointValues[0],
        reward: this.doorStates.smallReward,
        sound: config.sounds.smallReward,
      };
    }

    if (rand < PROB_POINTS_BIG) {
      return {
        type: "points",
        value: config.pointValues[1],
        reward: this.doorStates.bigReward,
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
      sound: config.sounds[spooky],
    };
  }

  animateDoorOpen(door) {
    this.state.isAnimating = true;
    door.classList.add(this.doorStates.animating);
    this.playSound(config.sounds.doorOpen);
  }

  lockOtherDoors(activeIndex) {
    this.doorEls.forEach((door, index) => {
      if (index !== activeIndex) {
        door.classList.add(this.doorStates.locked);
      }
    });
  }

  unlockAllDoors() {
    this.doorEls.forEach((door) =>
      door.classList.remove(this.doorStates.locked),
    );
    this.isBusy = false;
  }

  switchPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % 2;
    this.updatePlayerScoreUI();
  }

  resetDoors() {
    this.state.isAnimating = false;
    this.doorEls.forEach((door) => {
      door.textContent = "";
      door.classList.remove(
        this.doorStates.opened,
        this.doorStates.animating,
        this.doorStates.locked,
        this.doorStates.monster,
        this.doorStates.smallReward,
        this.doorStates.bigReward,
        ...config.spookyEntities.map((m) => `door--${m}`),
      );
    });
  }

  updatePlayerScoreUI() {
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
      this.state.startNewGame = true;
      this.modalNo.classList.remove("hidden");
    }
  }

  hideModal() {
    this.modal.classList.add("hidden");
    this.unlockAllDoors();
  }

  handleYesClick() {
    if (this.state.startNewGame) {
      this.startNewGame();
      return;
    }

    this.updateLevelUI();
  }

  startNewGame() {
    this.state.startNewGame = false;
    this.players.forEach((player) => (player.score = 0));
    this.activePlayerIndex = 0;
    this.updateLevelUI();
  }

  updateLevelUI() {
    this.resetDoors();
    this.updatePlayerScoreUI();
    this.hideModal();
    this.generateDoorResults();
  }

  playSound(soundArray) {
    const filename = soundArray[Math.floor(Math.random() * soundArray.length)];
    const audio = new Audio(`./assets/sounds/${filename}`);
    audio.play().catch(() => {});
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new SpookyGame();
});
