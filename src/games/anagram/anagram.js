const figlet = require('figlet');
const clear = require('clear');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clui = require('clui');
const readline = require('readline');
const Game = require('../abstract-game');
const anagramWordList = require('./anagram-word-list');
require('events').EventEmitter.defaultMaxListeners = 100;

const TOTAL_SECONDS = 30;
const STARTING_LINE = 10;

/**
 * Anagram game - displays shuffled 9 letter word to user and they have to guess what it is
 */
class AnagramGame extends Game {
  constructor() {
    super();
    this.answerPrompt = null;
    this.answer = null;
    this.countdownInterval = 0;
    this.incorrectGuess = false;
    this.total = 0;
    this.current = 0;
    this.wordList = [...anagramWordList];
  }

  /**
   * Start a new anagram game
   */
  startGame() {
    clear();

    const randomIdx = Math.floor(Math.random() * this.wordList.length);
    const [word] = this.wordList.splice(randomIdx, 1);
    const shuffledWord = Object.keys(word)[0];
    this.answer = word[shuffledWord];

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.logger.log(figlet.textSync('ANAGRAM', { font: 'Mini' }));
    this.logger.log('Solve the anagram:');
    this.logger.log(figlet.textSync(shuffledWord, { font: 'Cybermedium' }));

    this.startCountdown();
  }

  startCountdown() {
    this.total = TOTAL_SECONDS;
    this.current = this.total;
    this.logger.log('\n');
    this.displayProgressAndPrompt();
    this.resumeCountdown();
  }

  resumeCountdown() {
    this.countdownInterval = setInterval(() => {
      if (--this.current === 0) {
        this.stopCountdown();
        this.gameLost();
      } else {
        this.displayProgressAndPrompt(this.current, this.total);
      }
    }, 1000);
  }

  stopCountdown() {
    clearInterval(this.countdownInterval);
    this.clearAll();
  }

  /**
   * Display current timer status in gauge and prompt for user's answer
   */
  displayProgressAndPrompt() {
    this.clearAll();
    this.logger.log(clui.Gauge(this.current, this.total, this.total + 1, this.total, `${this.current}s`));
    this.promptForAnswer();
  }

  /**
   * Display prompt for user's answer
   */
  promptForAnswer() {
    const question = {
      type: 'input',
      name: 'solution',
      message: 'Answer'
    };

    // If we have already generated the prompt, we don't want to create a new one again
    // If the user has made an incorrect guess, the prompt's readline will have been
    // closed, so we do need to make a new one
    if (this.answerPrompt && !this.incorrectGuess) {
      this.answerPrompt.ui.run([question]);
    } else {
      this.incorrectGuess = false;
      this.answerPrompt = inquirer.prompt([question]);
      this.answerPrompt.then((answer) => {
        if (answer.solution.trim().toLowerCase() === this.answer) {
          this.gameWon();
        } else {
          this.incorrectGuess = true;
          this.stopCountdown();
          this.logger.write(chalk.red('INCORRECT! Unlucky, guess again'));
          this.resumeCountdown();
        }
      });

      const { rl } = this.answerPrompt.ui;
      // close the prompt's readline when user hits enter key
      // this is needed to fix issue where multiple answers were shown
      rl.on('line', () => {
        rl.output.end();
        rl.pause();
        rl.close();
      });
    }
  }

  /**
   * Clear current line of console
   */
  clearLine() {
    readline.clearLine(process.stdin, 0);
  }

  /**
   * Clears answer prompt and progress bar lines
   * Cursor ends up at start of progress bar line
   */
  clearAll() {
    this.moveCursorToAnswerPrompt();
    this.clearLine();
    this.moveCursorToProgressBar();
    this.clearLine();
  }

  /**
   * Moves cursor to the start of the line that is displaying the progress bar timer
   */
  moveCursorToProgressBar() {
    readline.cursorTo(process.stdin, 0, STARTING_LINE);
  }

  /**
   * Moves cursor to the start of the line that is prompting user for answer
   */
  moveCursorToAnswerPrompt() {
    readline.cursorTo(process.stdin, 0, STARTING_LINE + 1);
  }

  gameWon() {
    this.stopCountdown();
    this.finishGame();
    super.gameWon(this.answer);
  }

  gameLost() {
    this.finishGame();
    super.gameLost(this.answer, '\nTIME\'S UP!\n');
  }

  finishGame() {
    this.answerPrompt.ui.close();
    this.answerPrompt = null;
  }
}

module.exports = AnagramGame;
