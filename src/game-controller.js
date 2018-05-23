const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const AnagramGame = require('./games/anagram/anagram');
const HangmanGame = require('./games/hangman/hangman');
const GamePrompts = require('./game-prompts');

class GameController {
  /**
   * Main menu to select game and play
   */
  pickGame() {
    clear();
    console.log(figlet.textSync('Nodewords', { font: 'Ogre' }));

    GamePrompts.promptChooseGame().then((answer) => {
      switch (answer.gameType) {
        case 'anagram':
          this.playAnagram();
          break;

        case 'hangman':
          this.playHangman();
          break;

        case 'exit': break;

        default:
          this.pickAnother();
      }
    });
  }

  /**
   * When a game ends, either play same game type again or show
   * game pick menu
   */
  pickNextGame(gameType, playAnotherCallback) {
    GamePrompts.promptNextGame(gameType).then((answer) => {
      switch (answer.nextGame) {
        case gameType:
          playAnotherCallback();
          break;

        case 'different':
          this.pickGame();
          break;

        default: break;
      }
    });
  }

  /**
   * When game selection was not available, choose another or exit
   */
  pickAnother() {
    console.log(chalk.yellow('\nOops! That game isn\'t currently available\n'));
    GamePrompts.promptChooseAnother().then((answer) => {
      if (answer.chooseAnother) {
        this.pickGame();
      }
    });
  }

  playAnagram() {
    const anagramGame = new AnagramGame();
    anagramGame.play().then(() => {
      this.pickNextGame('anagram', () => this.playAnagram());
    });
  }

  playHangman() {
    const hangmanGame = new HangmanGame();
    hangmanGame.play().then(() => {
      this.pickNextGame('hangman', () => this.playHangman());
    });
  }
}

module.exports = GameController;
