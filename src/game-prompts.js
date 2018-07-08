const inquirer = require('inquirer');

class GamePrompts {
  static promptChooseGame() {
    return inquirer.prompt([{
      type: 'list',
      name: 'gameType',
      message: 'Which game would you like to play?',
      // todo: use constants for game types
      choices: [
        { name: 'Anagram', value: 'anagram' },
        { name: 'Hangman', value: 'hangman' },
        { name: 'Wordsearch', value: 'wordsearch' },
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
