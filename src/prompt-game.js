const figlet = require('figlet');
const inquirer = require('inquirer');
const clear = require('clear');
const chalk = require('chalk');
const AnagramGame = require('./games/anagram/anagram');
const HangmanGame = require('./games/hangman/hangman');

const anagramGame = new AnagramGame(promptChooseGame);
const hangmanGame = new HangmanGame(promptChooseGame);

function promptChooseGame() {
  clear();

  // display app title
  console.log(figlet.textSync('Nodewords', { font: 'Ogre' }));

  // prompt user to select game
  inquirer.prompt([{
    type: 'list',
    name: 'gameType',
    message: 'Which game would you like to play?',
    choices: [
      { name: 'Hangman', value: 'hangman' },
      { name: 'Anagram', value: 'anagram' }
    ]
  }]).then((answer) => {
    switch (answer.gameType) {
      case 'anagram':
        anagramGame.play();
        break;

      case 'hangman':
        hangmanGame.play();
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

