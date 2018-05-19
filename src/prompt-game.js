const figlet = require('figlet');
const inquirer = require('inquirer');
const clear = require('clear');
const chalk = require('chalk');
const anagram = require('./anagram');

function promptGame() {
  // clear console
  clear();

  // display app title
  console.log(figlet.textSync('Nodewords', { font: 'Ogre' }));

  // prompt user to select game
  inquirer.prompt([{
    type: 'list',
    name: 'gameType',
    message: 'Which game would you like to play?',
    choices: [
      { name: 'Anagram', value: 'anagram' },
      { name: 'Hangman', value: 'hangman' }
    ]
  }]).then((answer) => {
    switch (answer.gameType) {
      case 'anagram':
        anagram.play();
        break;

      default:
        console.log(chalk.yellow('\nOops! That game isn\'t currently available\n'));
        promptChooseAnother();
    }
  });
}

function promptChooseAnother() {
  inquirer.prompt([{
    type: 'confirm',
    name: 'chooseAnother',
    message: 'Choose another game?',
    default: true
  }]).then((answer) => {
    if (answer.chooseAnother) {
      promptGame();
    }
  });
}

module.exports = promptGame;

