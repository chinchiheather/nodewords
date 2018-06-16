const clear = require('clear');
const Game = require('../abstract-game');
const wordList = require('./wordsearch-word-list');

class WordsearchGame extends Game {
  constructor() {
    super();
    this.wordList = [...wordList];
    this.gridSize = 15;
  }

  play() {
    clear();

    console.log('\n');
    console.log('Find the words in the grid');

    this.buildGrid();

    return this.playPromise;
  }

  buildGrid() {
    this.grid = Array(this.gridSize).fill(null);
    this.grid = this.grid.map(() => Array(this.gridSize).fill(''));

    this.wordList.forEach((word) => {
      const { row, col, isHorizontal } = this.findWordPosition(word);
      if (isHorizontal) {
        for (let i = 0, len = word.length; i < len; i++) {
          this.grid[row][col + i] = word.charAt(i);
        }
      } else {
        for (let i = 0, len = word.length; i < len; i++) {
          this.grid[row + i][col] = word.charAt(i);
        }
      }
    });

    console.log(this.grid);
    this.grid.forEach((row) => {
      process.stdout.write(row.join(' '));
      process.stdout.write('\r');
    });
  }

  // todo: this algorithm can be improved
  findWordPosition(word) {
    // choose horizontal or vertical
    const isHorizontal = Math.random() < 0.5;

    // randomise row/col
    let row;
    let col;
    let gridLetters = '';
    if (isHorizontal) {
      row = Math.floor(Math.random() * this.gridSize);
      col = Math.floor(Math.random() * (this.gridSize - word.length));
      for (let i = 0, len = word.length; i < len; i++) {
        gridLetters += this.grid[row][col + i];
      }
    } else {
      row = Math.floor(Math.random() * (this.gridSize - word.length));
      col = Math.floor(Math.random() * this.gridSize);
      for (let i = 0, len = word.length; i < len; i++) {
        gridLetters += this.grid[row + i][col];
      }
    }

    // test whether word can fit in this slot
    if (gridLetters) {
      // already letters in these spots, try again
      return this.findWordPosition(word);
    }
    return { row, col, isHorizontal };
  }
}

module.exports = WordsearchGame;
