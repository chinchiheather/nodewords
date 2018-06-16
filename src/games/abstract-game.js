class Game {
  constructor() {
    this.playPromise = new Promise((resolve) => {
      this.resolvePlay = resolve;
    });
  }

  play() {
    console.log('play method should be overridden in child class');
  }
}

module.exports = Game;
