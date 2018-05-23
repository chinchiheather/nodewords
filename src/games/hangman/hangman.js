const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const UIHelper = require('../../helpers/ui-helper');
const PromptHelper = require('../../helpers/prompt-helper');
const hangmanStages = require('./hangman-stages');
const hangmanPrompts = require('./hangman-prompts');
const hangmanWords = require('./hangman-word-list');

// todo: use constants here and in anagram for magic strings
class HangmanGame {
  constructor(promptChooseGame) {
    this.promptChooseGame = promptChooseGame;
    this.guessed = [];
    this.word = null;
    this.incorrectGuesses = 0;
    this.maxIncorrectGuesses = 0;
  }

  play() {
    clear();
    console.log('\n');

    const randomIdx = Math.floor(Math.random() * hangmanWords.length);
    [this.word] = hangmanWords.splice(randomIdx, 1);

    this.incorrectGuesses = 0;
    this.maxIncorrectGuesses = 11;
    this.guessed = [];
    this.letters = [];
    for (let i = 0, len = this.word.length; i < len; i++) {
      const letter = this.word.charAt(i);
      if (this.letters.indexOf(letter) === -1) {
        this.letters.push(letter);
      }
    }

    this.displayHangman();
  }

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
      this.gameWon();
    } else if (this.incorrectGuesses === this.maxIncorrectGuesses) {
      this.gameLost();
    } else {
      console.log('Solve the hangman puzzle:\n');
      console.log(figlet.textSync(display, { font: 'Cybermedium' }));
      hangmanPrompts.promptForGuess().then((answer) => {
        switch (answer.guess) {
          case 'letter':
            this.promptForLetter();
            break;

          case 'answer':
            this.promptForAnswer();
            break;

          default:
            console.log(`Oops! Unhandled option ${answer.guessOption}`);
        }
      });
    }
  }

  promptForLetter() {
    hangmanPrompts.promptForLetter(this.guessed).then((answer) => {
      this.guessed.push(answer.letter);
      if (this.letters.indexOf(answer.letter) === -1) {
        this.incorrectGuesses++;
      }
      this.displayHangman(answer.letter);
    });
  }

  promptForAnswer() {
    hangmanPrompts.promptForAnswer().then((answer) => {
      if (answer.answer === this.word) {
        this.guessed = [...this.letters];
      } else {
        console.log(chalk.yellow('\nIncorrect!\n'));
        this.incorrectGuesses++;
      }
      this.displayHangman();
    });
  }

  gameWon() {
    UIHelper.showAnswer(this.word);
    UIHelper.flashWinner()
      .then(() => PromptHelper.promptNextGame('hangman', () => this.play(), this.promptChooseGame));
  }

  gameLost() {
    console.log(chalk.red('\nGAME OVER!\n'));
    UIHelper.revealAnswer(this.word)
      .then(() => PromptHelper.promptNextGame('hangman', () => this.play(), this.promptChooseGame));
  }
}

module.exports = HangmanGame;
