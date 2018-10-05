const chalk = require('chalk');
const figlet = require('figlet');
const readline = require('readline');
const gameConstants = require('../games/base-game-constants');

class UIHelper {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Animates flashing 'WINNER' text
   */
  flashWinner(input) {
    return new Promise((resolve) => {
      this.logger.log('\n');

      let counter = 0;
      const interval = setInterval(() => {
        readline.moveCursor(input, -gameConstants.WINNER_MSG.length, -1);
        readline.clearLine(input, 0);
        if (counter > 4) {
          clearInterval(interval);
          this.logger.log('\n');
          resolve();
        } else if (counter++ % 2 === 0) {
          this.logger.write(input, chalk.black.bgGreen(gameConstants.WINNER_MSG));
        } else {
          this.logger.write(input, chalk.green(gameConstants.WINNER_MSG));
        }
      }, 250);
    });
  }

  /**
   * Animates revealing the answer
   * This is shown to users when they have lost a game
   */
  revealAnswer(input, answer) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.write(input, '\nThe correct answer was');

        this.animateEllipsis(input).then(() => {
          setTimeout(() => {
            this.logger.write(input, '\n');
            this.showAnswer(answer);
            setTimeout(() => { resolve(); }, 500);
          }, 500);
        });
      });
    });
  }

  /**
   * Animates adding three dots to end of current line
   */
  animateEllipsis(input) {
    return new Promise((resolve) => {
      let count = 0;
      const interval = setInterval(() => {
        this.logger.write(input, '.');
        if (++count === 3) {
          clearInterval(interval);
          resolve();
        }
      }, 250);
    });
  }

  showAnswer(answer) {
    this.logger.log(chalk.green(figlet.textSync(answer, { font: 'Cybermedium' })));
  }
}

module.exports = UIHelper;
