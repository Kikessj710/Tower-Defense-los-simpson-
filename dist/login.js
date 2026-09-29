"use strict";
(() => {
  // src/login.ts
  var LoginScreen = class {
    constructor() {
      this.music = new Audio("sonidos/The Simpsons Theme.mp3");
      this.startSound = new Audio("sonidos/intro.mp3");
    }
    init() {
      this.music.loop = true;
      this.music.play().catch(() => {
      });
      document.addEventListener("keydown", (e) => {
        if (e.code === "Space") this.startGame();
      });
    }
    startGame() {
      this.music.pause();
      this.startSound.play().catch(() => {
      });
      setTimeout(() => {
        window.location.href = "game.html";
      }, 500);
    }
  };
  window.addEventListener("load", () => new LoginScreen().init());
})();
