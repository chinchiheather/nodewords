const chalk = require('chalk');
const UIHelper = require('../helpers/ui-helper');
const Logger = require('../helpers/logger');

class Game {
  constructor() {
    this.logger = new Logger();
    this.playPromise = new Promise((resolve) => {
      this.resolvePlay = resolve;
    });
  }

  play() {
    this.startGame();
    return this.playPromise;
  }

  startGame() {
    console.log('startGame method should be overridden in subclass');
  }

  gameWon(answer) {
    if (answer) {
      UIHelper.showAnswer(answer);
    }
    UIHelper.flashWinner().then(() => this.resolvePlay());
  }

  gameLost(answer, message = '\nGAME OVER!\n') {
    console.log(chalk.red(message));
    UIHelper.revealAnswer(answer).then(() => this.resolvePlay());
  }
}

module.exports = Game;
