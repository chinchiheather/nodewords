class Game {
  constructor() {
    this.playPromise = new Promise((resolve) => {
      this.resolvePlay = resolve;
    });
  }

  play() {
    this.startGame();
    return this.playPromise;
  }

  startGame() {
    console.log('startGame method should be overridden in child class');
  }
}

module.exports = Game;
