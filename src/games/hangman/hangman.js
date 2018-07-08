const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const Game = require('../abstract-game');
const hangmanStages = require('./hangman-stages');
const HangmanPrompts = require('./hangman-prompts');
const wordList = require('../word-list');

/**
 * Hangman game - displays letter placeholders to user and they guess
 * letter by letter to complete the word, or can also just go for it and
 * guess the full answer)
 */

// todo: use constants here and in anagram for magic strings
class HangmanGame extends Game {
  constructor() {
    super();
    this.guessed = [];
    this.word = null;
    this.incorrectGuesses = 0;
    this.maxIncorrectGuesses = 0;
    this.hangmanWordList = [...wordList];
  }

  /**
   * Start a new hangman game
   */
  startGame() {
    clear();
    console.log('\n');

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
    this.maxIncorrectGuesses = 11;
    this.guessed = [];

    this.displayHangman();
  }

  /**
   * Shows the UI for the current stage in the game
   * Displays hangman image, current state of word, and guess prompt
   */
  displayHangman() {
    clear();

    const hangmanImage = hangmanStages[this.incorrectGuesses];
    console.log(hangmanImage);

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
    } else if (this.incorrectGuesses === this.maxIncorrectGuesses) {
      this.gameLost(this.word);
    } else {
      console.log('Solve the hangman puzzle:\n');
      console.log(figlet.textSync(display, { font: 'Cybermedium' }));
      HangmanPrompts.promptForGuess().then((answer) => {
        switch (answer.guess) {
          case 'letter':
            this.guessLetter();
            break;

          case 'answer':
            this.guessAnswer();
            break;

          default:
            console.log(`Oops! Unhandled option ${answer.guessOption}`);
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
        console.log(chalk.red('\nINCORRECT! Unlucky, keep going\n'));
        this.incorrectGuesses++;
      }
      this.displayHangman();
    });
  }
}

module.exports = HangmanGame;
