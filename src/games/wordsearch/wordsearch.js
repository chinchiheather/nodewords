const Game = require('../abstract-game');

class WordsearchGame extends Game {
  constructor() {
    super();
    this.a = 'b';
  }

  play() {
    console.log('playing wordsearch');
    return this.playPromise;
  }
}

module.exports = WordsearchGame;
