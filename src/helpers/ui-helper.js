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
  flashWinner() {
    return new Promise((resolve) => {
      this.logger.log('\n');

      let counter = 0;
      const interval = setInterval(() => {
        readline.moveCursor(process.stdin, -gameConstants.WINNER_MSG.length, -1);
        readline.clearLine(process.stdin, 0);
        if (counter > 4) {
          clearInterval(interval);
          this.logger.log('\n');
          resolve();
        } else if (counter++ % 2 === 0) {
          this.logger.write(chalk.black.bgGreen(gameConstants.WINNER_MSG));
        } else {
          this.logger.write(chalk.green(gameConstants.WINNER_MSG));
        }
      }, 250);
    });
  }

  /**
   * Animates revealing the answer
   * This is shown to users when they have lost a game
   */
  revealAnswer(answer) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.write('\nThe correct answer was');

        this.animateEllipsis().then(() => {
          setTimeout(() => {
            this.logger.write('\n');
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
  animateEllipsis() {
    return new Promise((resolve) => {
      let count = 0;
      const interval = setInterval(() => {
        this.logger.write('.');
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
