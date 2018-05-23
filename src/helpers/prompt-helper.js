const inquirer = require('inquirer');

class PromptHelper {
  /**
   * Display prompt to user asking them what they want to do next
   * This is shown after a game ends (win or lose)
   */
  static promptNextGame(currentGameType, playAnotherCallback, playDifferentCallback) {
    inquirer.prompt([{
      type: 'list',
      name: 'nextGame',
      message: 'Play again?',
      choices: [
        { name: `Play another ${currentGameType} game`, value: currentGameType },
        { name: 'Play a different game', value: 'different' },
        { name: 'I\'m done for now, exit Nodewords', value: 'exit' }
      ]
    }]).then((answer) => {
      switch (answer.nextGame) {
        case currentGameType:
          playAnotherCallback();
          break;

        case 'different':
          playDifferentCallback();
          break;

        default: break;
      }
    });
  }
}

module.exports = PromptHelper;
