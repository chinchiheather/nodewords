const figlet = require('figlet');
const clear = require('clear');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clui = require('clui');
const logUpdate = require('log-update');
const anagramList = require('../utils/anagram-list');
require('events').EventEmitter.defaultMaxListeners = 100; // todo: find a better solution to line

/**
 * Anagram game - displays shuffled 9 letter word to user and they have to guess what it is
 */
class AnagramGame {
  constructor(promptChooseGame) {
    this.promptChooseGame = promptChooseGame;
    this.answerPrompt = null;
    this.answer = null;
    this.countdownInterval = 0;
    this.incorrectGuess = false;
    this.total = 0;
    this.current = 0;
    this.words = [...anagramList];
  }

  /**
   * Play a new anagram game
   */
  play() {
    clear();

    const randomIdx = Math.floor(Math.random() * this.words.length);
    const [word] = this.words.splice(randomIdx, 1);
    const shuffledWord = Object.keys(word)[0];
    this.answer = word[shuffledWord];

    console.log('\n\n\n');
    console.log('Solve the anagram:');
    console.log(figlet.textSync(shuffledWord, { font: 'Cybermedium' }));

    this.startCountdown();
  }

  startCountdown() {
    this.total = 30;
    this.current = this.total;
    this.displayProgressAndPrompt();
    this.resumeCountdown();
  }

  resumeCountdown() {
    this.countdownInterval = setInterval(() => {
      if (--this.current < 0) {
        this.stopCountdown();
        this.onTimeUp();
      } else {
        this.displayProgressAndPrompt(this.current, this.total);
      }
    }, 1000);
  }

  stopCountdown() {
    clearInterval(this.countdownInterval);
  }

  /**
   * Display current timer status in gauge and prompt for user's answer
   */
  displayProgressAndPrompt() {
    logUpdate(clui.Gauge(this.current, this.total, this.total, this.total, `${this.current}s`));
    this.promptForAnswer();
  }

  /**
   * Display prompt for user's answer
   */
  promptForAnswer() {
    const question = {
      type: 'input',
      name: 'solution',
      message: 'Answer'
    };

    // If we have already generated the prompt, we don't want to create a new one again
    // If the user has made an incorrect guess, the prompt's readline will have been
    // closed, so we do need to make a new one
    if (this.answerPrompt && !this.incorrectGuess) {
      this.answerPrompt.ui.run([question]);
    } else {
      this.incorrectGuess = false;
      this.answerPrompt = inquirer.prompt([question]);
      this.answerPrompt.then((answer) => {
        if (answer.solution.trim().toLowerCase() === this.answer) {
          this.onGameWon();
        } else {
          this.incorrectGuess = true;
          this.stopCountdown();
          logUpdate(chalk.red('INCORRECT! Unlucky, guess again'));
          this.resumeCountdown();
        }
      });

      const { rl } = this.answerPrompt.ui;
      // close the prompt's readline when user hits enter key
      // this is needed to fix issue where multiple answers were shown
      rl.on('line', () => {
        rl.output.end();
        rl.pause();
        rl.close();
      });
    }
  }

  onGameWon() {
    this.stopCountdown();
    this.finishGame();
    this.showAnswer();

    let counter = 0;
    const starChar = '\u2605';
    const tripleStars = `${starChar}${starChar}${starChar}`;
    const winnerMessage = `${tripleStars} WINNER! ${tripleStars}\n`;
    const interval = setInterval(() => {
      if (counter > 4) {
        clearInterval(interval);
        logUpdate.done();
        this.promptNextGame();
      } else if (counter++ % 2 === 0) {
        logUpdate(chalk.black.bgGreen(winnerMessage));
      } else {
        logUpdate(chalk.green(winnerMessage));
      }
    }, 250);
  }

  onTimeUp() {
    this.finishGame();
    console.log(chalk.red('\nTIME\'S UP!\n'));

    setTimeout(() => {
      process.stdout.write('\nThe correct answer was');

      let count = 0;
      // animate adding ellipsis to end of line
      const interval = setInterval(() => {
        process.stdout.write('.');
        if (++count === 3) {
          clearInterval(interval);

          setTimeout(() => {
            process.stdout.write('\n');
            this.showAnswer();
            setTimeout(() => { this.promptNextGame(); }, 500);
          }, 500);
        }
      }, 250);
    }, 500);
  }

  finishGame() {
    logUpdate.clear();
    this.answerPrompt.ui.close();
    this.answerPrompt = null;
  }

  showAnswer() {
    console.log(chalk.green(figlet.textSync(this.answer, { font: 'Cybermedium' })));
  }

  /**
   * Display prompt to user asking them what they want to do next
   * This is shown after a game ends (win or lose)
   */
  promptNextGame() {
    inquirer.prompt([{
      type: 'list',
      name: 'nextGame',
      message: 'Play again?',
      choices: [
        { name: 'Play another anagram game', value: 'anagram' },
        { name: 'Play a different game', value: 'different' },
        { name: 'I\'m done for now, exit Nodewords', value: 'exit' }
      ]
    }]).then((answer) => {
      switch (answer.nextGame) {
        case 'anagram':
          this.play();
          break;

        case 'different':
          this.promptChooseGame();
          break;

        default: break;
      }
    });
  }
}

module.exports = AnagramGame;
