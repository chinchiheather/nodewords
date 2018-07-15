const logUpdate = require('log-update');
const chalk = require('chalk');
const figlet = require('figlet');

class UIHelper {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Animates flashing 'WINNER' text
   */
  flashWinner() {
    return new Promise((resolve) => {
      let counter = 0;
      const starChar = '\u2605';
      const tripleStars = Array(3).fill(starChar).join(' ');
      const winnerMessage = `${tripleStars} WINNER! ${tripleStars}\n`;
      const interval = setInterval(() => {
        if (counter > 4) {
          clearInterval(interval);
          logUpdate.done();
          resolve();
        } else if (counter++ % 2 === 0) {
          logUpdate(chalk.black.bgGreen(winnerMessage));
        } else {
          logUpdate(chalk.green(winnerMessage));
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
