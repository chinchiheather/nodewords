const inquirer = require('inquirer');
const clear = require('clear');

class GamePrompts {
  static promptChooseGame() {
    clear();

    return inquirer.prompt([{
      type: 'list',
      name: 'gameType',
      message: 'Which game would you like to play?',
      choices: [
        { name: 'Hangman', value: 'hangman' },
        { name: 'Anagram', value: 'anagram' },
        { name: 'I\'m done for now, exit Nodewords', value: 'exit' }
      ]
    }]);
  }

  static promptChooseAnother() {
    return inquirer.prompt([{
      type: 'confirm',
      name: 'chooseAnother',
      message: 'Choose another game?',
      default: true
    }]);
  }

  static promptNextGame(currentGameType) {
    return inquirer.prompt([{
      type: 'list',
      name: 'nextGame',
      message: 'Play again?',
      choices: [
        { name: `Play another ${currentGameType} game`, value: currentGameType },
        { name: 'Play a different game', value: 'different' },
        { name: 'I\'m done for now, exit Nodewords', value: 'exit' }
      ]
    }]);
  }
}

module.exports = GamePrompts;
