
const inquirer = require('inquirer');

class HangmanPrompts {
  static promptForGuess() {
    return inquirer.prompt([{
      type: 'list',
      name: 'guess',
      message: 'What do you want to do?',
      choices: [
        { name: 'Choose a letter', value: 'letter' },
        { name: 'Guess the answer!', value: 'answer' }
      ]
    }]);
  }

  static promptForLetter(guessed) {
    return inquirer.prompt([{
      type: 'input',
      name: 'letter',
      message: 'Letter',
      validate: (input) => {
        if (input.length === 0) {
          return 'Please enter a letter';
        }
        if (input.length > 1) {
          return 'Please enter only one letter';
        }
        if (!/[a-zA-Z]/.test(input)) {
          return 'Please enter a letter a-z';
        }
        if (guessed.indexOf(input) !== -1) {
          return '\nOops! You already guessed this one, try a different letter';
        }
        return true;
      }
    }]);
  }

  static promptForAnswer() {
    return inquirer.prompt([{
      type: 'input',
      name: 'answer',
      message: 'Guess the answer!'
    }]);
  }
}

module.exports = HangmanPrompts;
