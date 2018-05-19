const figlet = require('figlet');
const inquirer = require('inquirer');

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
}]);
