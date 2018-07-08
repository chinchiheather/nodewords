const clear = require('clear');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const Game = require('../abstract-game');
const wordList = require('../word-list');
const letterList = require('./wordsearch-letter-list');

const STARTING_LINE = 7;

class WordsearchGame extends Game {
  constructor() {
    super();
    this.gridSize = 15;
    this.currentWord = {
      id: null,
      letters: [],
      selected: []
    };
    this.guessedWords = [];

    this.onKeyPress = this.onKeyPress.bind(this);
  }

  startGame() {
    this.wordsearchWordList = [];
    for (let i = 0; i < this.gridSize; i++) {
      const randomIdx = Math.floor(Math.random() * wordList.length);
      this.wordsearchWordList.push(wordList[randomIdx]);
    }
    this.buildGrid();
  }

  buildGrid() {
    this.grid = Array(this.gridSize).fill(null);
    this.grid = this.grid.map(() => Array(this.gridSize).fill({
      letter: null,
      word: null
    }));

    this.wordsearchWordList.forEach((word, wordIdx) => {
      const { row, col, isHorizontal } = this.findWordPosition(word);
      if (isHorizontal) {
        for (let i = 0, len = word.length; i < len; i++) {
          this.grid[row][col + i] = {
            letter: word.charAt(i),
            word: wordIdx
          };
        }
      } else {
        for (let i = 0, len = word.length; i < len; i++) {
          this.grid[row + i][col] = {
            letter: word.charAt(i),
            word: wordIdx
          };
        }
      }
    });

    // fill in rest of grid with random letters
    this.grid = this.grid.map(row => row.map((item) => {
      if (item.letter) {
        return item;
      }
      return {
        letter: letterList[Math.floor(Math.random() * letterList.length)],
        word: null
      };
    }));

    this.setupReadline();
    this.drawGrid();
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
        gridLetters += this.grid[row][col + i].letter || '';
      }
    } else {
      row = Math.floor(Math.random() * (this.gridSize - word.length));
      col = Math.floor(Math.random() * this.gridSize);
      for (let i = 0, len = word.length; i < len; i++) {
        gridLetters += this.grid[row + i][col].letter || '';
      }
    }

    // test whether word can fit in this slot
    if (gridLetters) {
      // already letters in these spots, try again
      return this.findWordPosition(word);
    }
    return { row, col, isHorizontal };
  }

  setupReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.cursorPos = { col: 0, row: this.gridSize };
    this.rl.input.on('keypress', this.onKeyPress);
  }

  drawGrid() {
    const { id, selected } = this.currentWord;

    clear();
    console.log(figlet.textSync('WORDSEARCH', { font: 'Mini' }));
    console.log('Find the words in the grid');
    console.log(chalk.grey('(Use the arrow keys to move around, and the space key to select a letter)\n'));

    this.grid.forEach((row, rowIdx) => {
      const rowData = [];
      row.forEach((item, itemIdx) => {
        if (this.guessedWords.indexOf(item.word) !== -1) {
          rowData.push(chalk.green(item.letter));
        } else if (item.word === id && selected.indexOf(`${rowIdx},${itemIdx}`) !== -1) {
          rowData.push(chalk.black.bgGreen(item.letter));
        } else {
          rowData.push(item.letter);
        }
      });
      let rowStr = rowData.join(' ');
      if (this.wordsearchWordList[rowIdx]) {
        rowStr += '       ';
        let word = this.wordsearchWordList[rowIdx];
        if (this.guessedWords.indexOf(rowIdx) !== -1) {
          word = chalk.green(word);
        }
        rowStr += word;
      }
      console.log(rowStr);
    });

    this.setCursorPos();
  }

  // allow user to move cursor around the grid
  // when they enter space key, detect if letter is part of a word and if so change colour
  // if any other key, do nothing
  onKeyPress(str, key) {
    switch (key.name) {
      case 'up':
        if (this.cursorPos.row > 0) {
          this.cursorPos.row--;
        }
        break;
      case 'down':
        if (this.cursorPos.row < this.gridSize - 1) {
          this.cursorPos.row++;
        }
        break;
      case 'left':
        if (this.cursorPos.col > 0) {
          this.cursorPos.col -= 2;
        }
        break;
      case 'right':
        if (this.cursorPos.col < (this.gridSize - 1) * 2) {
          this.cursorPos.col += 2;
        }
        break;
      case 'space': {
        this.onSpaceKeyPressed();
        break;
      }
      default:
        if (!(key.ctrl && key.name === 'c')) {
          this.drawGrid();
        }
    }

    this.setCursorPos();
  }

  onSpaceKeyPressed() {
    const { row } = this.cursorPos;
    const col = this.cursorPos.col * 0.5;
    const { id: currentWordId } = this.currentWord;

    if (this.grid[row]) {
      const item = this.grid[row][col];
      if (item && item.word != null) {
        if (currentWordId !== item.word) {
          this.currentWord = {
            id: item.word,
            letters: this.wordsearchWordList[item.word].split(''),
            selected: []
          };
        }

        const { selected, letters } = this.currentWord;
        const pos = `${row},${col}`;
        if (selected.indexOf(pos) === -1) {
          selected.push(pos);
          if (selected.length === letters.length) {
            this.guessedWords.push(currentWordId);
            if (this.guessedWords.length === this.wordsearchWordList.length) {
              this.cursorPos = { col: 0, row: this.gridSize + 2 };
              this.gameWon();
            }
          }
        }
      }
    }
    this.drawGrid();
  }

  setCursorPos() {
    readline.cursorTo(process.stdout, this.cursorPos.col, STARTING_LINE + this.cursorPos.row);
  }

  gameWon() {
    if (this.rl) {
      this.rl.input.removeListener('keypress', this.onKeyPress);
      this.rl.close();
    }
    super.gameWon();
  }
}

module.exports = WordsearchGame;
