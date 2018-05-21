const logUpdate = require('log-update');
const clear = require('clear');
const inquirer = require('inquirer');
const figlet = require('figlet');
const chalk = require('chalk');
const UIHelper = require('../utils/ui-helper');
const PromptHelper = require('../utils/prompt-helper');

// todo: use constants here and in anagram for magic strings
class HangmanGame {
  constructor(promptChooseGame) {
    this.promptChooseGame = promptChooseGame;
    this.guessed = [];
    this.phrase = null;
    this.count = 0;
    this.max = 0;
  }

  play() {
    clear();
    console.log('\n');

    // todo: randomly select a word/phrase
    this.phrase = 'add';
    this.count = 0;
    this.max = 3;
    this.guessed = [];
    this.displayHangman();
  }

  displayHangman() {
    // todo: show a hangman image

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
    } else if (this.count++ === this.max) {
      this.gameLost();
    } else {
      // todo: use log update
      console.log(figlet.textSync(display, { font: 'Cybermedium' }));

      inquirer.prompt([{
        type: 'list',
        name: 'guessOption',
        message: 'What do you want to do?',
        choices: [
          { name: 'Choose a letter', value: 'letter' },
          { name: 'Guess the answer!', value: 'answer' }
        ]
      }]).then((answer) => {
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
    // todo: disallow multiple letters to be input
    inquirer.prompt([{
      type: 'input',
      name: 'letter',
      message: 'Letter'
    }]).then((answer) => {
      if (this.guessed.indexOf(answer.letter) !== -1) {
        console.log(chalk.yellow('\nOops! You already guessed this one, try a different letter\n'));
        this.promptForLetter();
      } else {
        this.guessed.push(answer.letter);
        this.displayHangman();
      }
    });
  }

  promptForAnswer() {
    // todo:
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
