const clear = require('clear');
const logUpdate = require('log-update');
const Game = require('../abstract-game');
const wordList = require('./wordsearch-word-list');
const letterList = require('./wordsearch-letter-list');
const utils = require('readline-utils');
const readline = require('readline');
const chalk = require('chalk');

class WordsearchGame extends Game {
  constructor() {
    super();
    this.wordList = [...wordList];
    this.gridSize = 15;
    this.currentWord = null;  // todo: what format should this take?
  }

  play() {
    this.buildGrid();
    return this.playPromise;
  }

  buildGrid() {
    this.grid = Array(this.gridSize).fill(null);
    this.grid = this.grid.map(() => Array(this.gridSize).fill({
      letter: null,
      word: null
    }));

    // todo: handle updating other letters if other words push them out
    this.wordList.forEach((word, wordIdx) => {
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

    // allow user to move cursor around the grid
    // when they enter space key, detect if letter is part of a word and if so change colour
    // if any other key, do nothing
    const cursorPos = [15, 0];
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.rl.input.on('keypress', (str, key) => {
      switch (key.name) {
        case 'up':
          utils.move(this.rl, key);
          cursorPos[0]--;
          break;
        case 'down':
          utils.move(this.rl, key);
          cursorPos[0]++;
          break;
        case 'left':
          utils.move(this.rl, key);
          cursorPos[1]--;
          break;
        case 'right':
          utils.move(this.rl, key);
          cursorPos[1]++;
          break;
        case 'space': {
          const row = cursorPos[0];
          const col = cursorPos[1] * 0.5;
          this.cursorPos = { col: col * 2, row };
          if (this.grid[row]) {
            const item = this.grid[row][col];
            if (item) {
              if (item.word) {
                if (!this.currentWord) {
                  this.currentWord = {
                    id: item.word,
                    current: [],
                    letters: [] // todo: fill with word letter idxs
                  };
                }
                this.currentWord.current.push(`${row},${col}`);
              }
            }
          }
          this.drawGrid();
          break;
        }

        default:
          // this.drawGrid();
      }
    });

    this.drawGrid();
  }

  drawGrid() {
    clear();
    console.log('\n');
    console.log('Find the words in the grid:\n');
    console.log(this.currentWord);
    console.log(this.cursorPos);
    // console.log(this.currentWord.current);

    this.grid.forEach((row, rowIdx) => {
      const rowData = [];
      row.forEach((item, itemIdx) => {
        if (this.currentWord && item.word === this.currentWord.id && this.currentWord.current && this.currentWord.current.indexOf(`${rowIdx},${itemIdx}`) !== -1) {
          rowData.push(chalk.green(item.letter));
        } else {
          rowData.push(item.letter);
        }
      });
      let rowStr = rowData.join(' ');
      if (this.wordList[rowIdx]) {
        rowStr += '       ';
        rowStr += this.wordList[rowIdx];
      }
      console.log(rowStr);
    });
    if (this.cursorPos) {
      // utils.right(this.rl, this.cursorPos.cols);
      // utils.up(this.rl, this.cursorPos.rows);
      // setInterval(() => {
      //   console.log('moving up')
      //   utils.move(this.rl, 'up');
      // }, 100)
      // utils.move(this.rl, 'up');
      // utils.move(this.rl, 'up');
      readline.moveCursor(process.stdout, this.cursorPos.col, -(this.gridSize - this.cursorPos.row));
    }

    // todo: need a separate draw function to run after each go
    // need an array just for letter order?
    // need to store words, their idxs and whether user has guessed them in another array

    // const this.rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // this.rl.input.on('keypress', function(s, key) {
    //   if( key.name === "up") {
    //     readline.moveCursor(process.stdin, 0, 0);
    //   } else if( key.name === "down"){
    //   } else if (key.name !== 'a') {
    //     return; // don't render if nothing changed
    //   }
    // })
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
}

module.exports = WordsearchGame;
