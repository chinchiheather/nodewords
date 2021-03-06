const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const Game = require('../base-game');
const hangmanStages = require('./hangman-stages');
const HangmanPrompts = require('./hangman-prompts');
const wordList = require('../word-list');
const hangmanConstants = require('./hangman-constants');

/**
 * Hangman game - displays letter placeholders to user and they guess
 * letter by letter to complete the word, or can also just go for it and
 * guess the full answer)
 */
class HangmanGame extends Game {
  constructor() {
    super();
    this.guessed = [];
    this.word = null;
    this.incorrectGuesses = 0;
    this.hangmanWordList = [...wordList];
  }

  /**
   * Start a new hangman game
   */
  startGame() {
    const randomIdx = Math.floor(Math.random() * this.hangmanWordList.length);
    [this.word] = this.hangmanWordList.splice(randomIdx, 1);

    this.letters = [];
    for (let i = 0, len = this.word.length; i < len; i++) {
      const letter = this.word.charAt(i);
      if (this.letters.indexOf(letter) === -1) {
        this.letters.push(letter);
      }
    }

    this.incorrectGuesses = 0;
    this.guessed = [];

    this.displayHangman();
  }

  /**
   * Shows the UI for the current stage in the game
   * Displays hangman image, current state of word, and guess prompt
   */
  displayHangman() {
    clear();
    this.logger.log(figlet.textSync(hangmanConstants.GAME_TITLE, { font: 'Mini' }));

    const hangmanImage = hangmanStages[this.incorrectGuesses];
    this.logger.log(hangmanImage);

    let display = '';
    let hasWon = true;
    for (let i = 0, len = this.word.length; i < len; i++) {
      const letter = this.word.charAt(i);
      if (letter === ' ') {
        display += '/';
      } else if (this.guessed.indexOf(letter) === -1) {
        display += '_';
        hasWon = false;
      } else {
        display += letter;
      }
    }

    if (hasWon) {
      this.gameWon(this.word);
    } else if (this.incorrectGuesses === hangmanConstants.TOTAL_GUESSES) {
      this.gameLost(this.word);
    } else {
      this.logger.log(hangmanConstants.GAME_INFO);
      this.logger.log(figlet.textSync(display, { font: 'Cybermedium' }));
      HangmanPrompts.promptForGuess().then((answer) => {
        switch (answer.guess) {
          case hangmanConstants.LETTER:
            this.guessLetter();
            break;

          case hangmanConstants.ANSWER:
            this.guessAnswer();
            break;

          default:
            this.logger.log(`${hangmanConstants.UNHANDLED_OPTION} ${answer.guessOption}`);
        }
      });
    }
  }

  guessLetter() {
    HangmanPrompts.promptForLetter(this.guessed).then((answer) => {
      this.guessed.push(answer.letter);
      if (this.letters.indexOf(answer.letter) === -1) {
        this.incorrectGuesses++;
      }
      this.displayHangman(answer.letter);
    });
  }

  guessAnswer() {
    HangmanPrompts.promptForAnswer().then((answer) => {
      if (answer.answer === this.word) {
        this.guessed = [...this.letters];
      } else {
        this.logger.log(chalk.red(hangmanConstants.INCORRECT_GUESS));
        this.incorrectGuesses++;
      }
      this.displayHangman();
    });
  }
}

module.exports = HangmanGame;
