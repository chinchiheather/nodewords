const figlet = require('figlet');
const clear = require('clear');
const inquirer = require('inquirer');
const chalk = require('chalk');

class Anagram {
  constructor(promptChooseGame) {
    this.promptChooseGame = promptChooseGame;

    // todo: get a list of words from somewhere
    this.words = [
      'unpuzzled',
      'blizzards',
      'objectify'
    ];
  }

  play() {
    // clear console
    clear();

    // display game title
    console.log(figlet.textSync('Anagram', { font: 'Ogre' }));

    const randomIdx = Math.floor(Math.random() * this.words.length);
    // todo: don't select words user has had before
    const word = this.words[randomIdx];
    const shuffledWord = this.shuffle(word);

    console.log('\n\n\n');
    console.log('Solve the anagram:');
    console.log(figlet.textSync(shuffledWord, { font: 'Cybermedium' }));

    this.promptForAnswer(word);
  }

  shuffle(word) {
    const shuffledIndices = [...Array(word.length).keys()];
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    let shuffled = '';
    shuffledIndices.forEach((shuffledIdx) => {
      shuffled += word.charAt(shuffledIdx);
    });
    return shuffled;
  }

  promptForAnswer(word) {
    inquirer.prompt([{
      type: 'input',
      name: 'solution',
      message: 'Answer'
    }]).then((answer) => {
      if (answer.solution.trim().toLowerCase() === word) {
        console.log(chalk.black.bgGreen('WINNER!'));
        this.promptNextGame();
      } else {
        console.log(chalk.red('INCORRECT! Unlucky, guess again'));
        this.promptForAnswer(word);
      }
    });
  }

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

module.exports = Anagram;
