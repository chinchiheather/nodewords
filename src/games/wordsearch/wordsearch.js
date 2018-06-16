// todo: use abstract base class Game
class WordsearchGame {
  constructor() {
    this.playPromise = new Promise((resolve) => {
      this.resolvePlay = resolve;
    });
  }

  play() {
    console.log('playing wordsearch');
    return this.playPromise;
  }
}

module.exports = WordsearchGame;
