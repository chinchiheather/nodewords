const figlet = require('figlet');
const inquirer = require('inquirer');
const clear = require('clear');
const chalk = require('chalk');
const Anagram = require('./games/anagram');

const anagram = new Anagram(promptChooseGame);

function promptChooseGame() {
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
        anagram.play(promptChooseGame);
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
      promptChooseGame();
    }
  });
}

module.exports = promptChooseGame;

