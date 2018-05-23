const logUpdate = require('log-update');
const chalk = require('chalk');
const figlet = require('figlet');

class UIHelper {
  static flashWinner() {
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

  static revealAnswer(answer) {
    return new Promise((resolve) => {
      setTimeout(() => {
        process.stdout.write('\nThe correct answer was');

        this.animateEllipsis().then(() => {
          setTimeout(() => {
            process.stdout.write('\n');
            this.showAnswer(answer);
            setTimeout(() => { resolve(); }, 500);
          }, 500);
        });
      });
    });
  }

  static animateEllipsis() {
    return new Promise((resolve) => {
      let count = 0;
      const interval = setInterval(() => {
        process.stdout.write('.');
        if (++count === 3) {
          clearInterval(interval);
          resolve();
        }
      }, 250);
    });
  }

  static showAnswer(answer) {
    console.log(chalk.green(figlet.textSync(answer, { font: 'Cybermedium' })));
  }
}

module.exports = UIHelper;
