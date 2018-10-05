const chalk = require('chalk');
const readline = require('readline');
const UIHelper = require('../helpers/ui-helper');
const Logger = require('../helpers/logger');
const gameConstants = require('./base-game-constants');

class Game {
  constructor() {
    this.logger = new Logger();
    this.uiHelper = new UIHelper(this.logger);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

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
    this.uiHelper.flashWinner(this.rl.input).then(() => this.resolvePlay());
  }

  gameLost(answer, message = gameConstants.GAME_OVER_MSG) {
    this.logger.log(chalk.red(message));
    this.uiHelper.revealAnswer(this.rl.input, answer).then(() => this.resolvePlay());
  }
}

module.exports = Game;
