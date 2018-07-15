const chalk = require('chalk');
const UIHelper = require('../helpers/ui-helper');
const Logger = require('../helpers/logger');

class Game {
  constructor() {
    this.logger = new Logger();
    this.uiHelper = new UIHelper(this.logger);

    this.playPromise = new Promise((resolve) => {
      this.resolvePlay = resolve;
    });
  }

  play() {
    this.startGame();
    return this.playPromise;
  }

  startGame() {
    throw Error('startGame method should be overridden in subclass');
  }

  gameWon(answer) {
    if (answer) {
      this.uiHelper.showAnswer(answer);
    }
    this.uiHelper.flashWinner().then(() => this.resolvePlay());
  }

  gameLost(answer, message = '\nGAME OVER!\n') {
    this.logger.log(chalk.red(message));
    this.uiHelper.revealAnswer(answer).then(() => this.resolvePlay());
  }
}

module.exports = Game;
