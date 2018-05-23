const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const UIHelper = require('../../helpers/ui-helper');
const PromptHelper = require('../../helpers/prompt-helper');
const hangmanStages = require('./hangman-stages');
const hangmanPrompts = require('./hangman-prompts');

// todo: use constants here and in anagram for magic strings
class HangmanGame {
  constructor(promptChooseGame) {
    this.promptChooseGame = promptChooseGame;
    this.guessed = [];
    this.phrase = null;
    this.incorrectGuesses = 0;
    this.maxIncorrectGuesses = 0;
  }

  play() {
    clear();
    console.log('\n');

    // todo: randomly select a word`/phrase
    this.phrase = 'add';
    this.incorrectGuesses = 0;
    this.maxIncorrectGuesses = 11;
    this.guessed = [];
    this.letters = [];
    for (let i = 0, len = this.phrase.length; i < len; i++) {
      const letter = this.phrase.charAt(i);
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
    for (let i = 0, len = this.phrase.length; i < len; i++) {
      const letter = this.phrase.charAt(i);
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
        switch (answer.guessOption) {
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
      if (answer.answer === this.phrase) {
        this.gameWon();
      } else {
        console.log(chalk.yellow('\nIncorrect!\n'));
        this.incorrectGuesses++;
        this.displayHangman();
      }
    });
  }

  gameWon() {
    UIHelper.showAnswer(this.phrase);
    UIHelper.flashWinner()
      .then(() => PromptHelper.promptNextGame('hangman', () => this.play(), this.promptChooseGame));
  }

  gameLost() {
    console.log(chalk.red('\nGAME OVER!\n'));
    UIHelper.revealAnswer(this.phrase)
      .then(() => PromptHelper.promptNextGame('hangman', () => this.play(), this.promptChooseGame));
  }
}

module.exports = HangmanGame;
