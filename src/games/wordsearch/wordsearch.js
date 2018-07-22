const clear = require('clear');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const Game = require('../base-game');
const wordList = require('../word-list');
const letterList = require('./wordsearch-letter-list');
const wordsearchConstants = require('./wordsearch-constants');

/**
 * Wordsearch game - displays grid of letters to user with a list of words to find,
 * they use arrow keys to traverse grid and hit space key to select a letter, the
 * game is over when all words in the list have been found
 */
class WordsearchGame extends Game {
  constructor() {
    super();
    this.gridSize = wordsearchConstants.GRID_SIZE;
    this.currentWord = {
      id: null,
      letters: [],
      selected: []
    };
    this.guessedWords = [];

    this.onKeyPress = this.onKeyPress.bind(this);
  }

  startGame() {
    // randomly select words from list
    this.wordsearchWordList = [];
    for (let i = 0; i < this.gridSize; i++) {
      const randomIdx = Math.floor(Math.random() * wordList.length);
      this.wordsearchWordList.push(wordList[randomIdx]);
    }

    this.buildGrid();
  }

  /**
   * Generates the wordsearch grid
   * Places the selected words in the grid, then fills in the spaces with random letters
   */
  buildGrid() {
    this.grid = Array(this.gridSize).fill(null);
    this.grid = this.grid.map(() => Array(this.gridSize).fill({
      letter: null,
      word: null
    }));

    this.wordsearchWordList.forEach((word, wordIdx) => {
      const { row, col, isHorizontal } = this.findWordPosition(word);
      for (let i = 0, len = word.length; i < len; i++) {
        const letterItem = {
          letter: word.charAt(i),
          word: wordIdx
        };
        if (isHorizontal) {
          this.grid[row][col + i] = letterItem;
        } else {
          this.grid[row + i][col] = letterItem;
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

  /**
   * Finds a place in the grid where the word will fit that isn't already used by
   * another word
   */
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

  /**
   * Creates the readline interface and adds keypress listener for process.stdin
   * This sets things up so we can use the cursor to move around board, and space key to
   * select a letter
   */
  setupReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.cursorPos = { col: 0, row: this.gridSize };
    this.rl.input.on('keypress', this.onKeyPress);
  }

  /**
   * Draws the current state of the wordsearch grid
   * Guessed words are marked with green text, words currently being guessed have green bg
   */
  drawGrid() {
    const { id, selected } = this.currentWord;

    clear();
    this.logger.log(figlet.textSync(wordsearchConstants.GAME_TITLE, { font: 'Mini' }));
    this.logger.log(wordsearchConstants.GAME_INFO);
    this.logger.log(chalk.grey(wordsearchConstants.GAME_INSTRUCTIONS));

    this.grid.forEach((row, rowIdx) => {
      // first add all letters in the row (with correct colours)
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

      // then add a word from the word list to the right of the grid
      if (this.wordsearchWordList[rowIdx]) {
        rowStr += '       ';
        let word = this.wordsearchWordList[rowIdx];
        if (this.guessedWords.indexOf(rowIdx) !== -1) {
          word = chalk.green(word);
        }
        rowStr += word;
      }

      this.logger.log(rowStr);
    });

    this.setCursorPos();
  }

  /**
   * Allow user to move cursor around the grid using arrow keys
   * If user hits space key, run logic to detect if it is part of a word and what to do
   * If user hits any other key (except ctrl + c) we redraw the grid
   */
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
        // if user enters any other key they will be writing over the grid so we need to redraw it
        if (!(key.ctrl && key.name === 'c')) {
          this.drawGrid();
        }
    }

    this.setCursorPos();
  }

  /**
   * Detects whether character at cursor position is part of a word
   * If it is then highlight the letter, if this was the last letter of the word currently
   * being guessed then add this word to the guessed words array and check if game has been won
   */
  onSpaceKeyPressed() {
    const { row } = this.cursorPos;
    const col = this.cursorPos.col * 0.5;
    const { id: currentWordId } = this.currentWord;

    const item = this.grid[row][col];
    if (item && item.word != null) {
      if (currentWordId !== item.word) {
        // first time the user has selected a letter in this word
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

    this.drawGrid();
  }

  /**
   * Sets the cursor position to where it was last
   * This is needed after redrawing the grid, we don't want the user to lose their position
   */
  setCursorPos() {
    readline.cursorTo(process.stdout, this.cursorPos.col, wordsearchConstants.STARTING_LINE + this.cursorPos.row);
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
