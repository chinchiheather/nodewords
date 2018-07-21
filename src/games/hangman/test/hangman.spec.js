/* eslint-env jest */
/* eslint-disable no-return-assign, global-require, prefer-destructuring */

const MockHelper = require('../../../../test/helpers/mock-helper');
const PromiseSpy = require('../../../../test/helpers/promise-spy');
const hangmanConstants = require('../hangman-constants');
const gameConstants = require('../../game-constants');
const hangmanStages = require('../hangman-stages');

describe('Hangman', () => {
  let hangmanGame;

  let clearSpy;
  let mockChalk;
  let mockLogger;
  let mockUiHelper;
  let mockPrompts;

  let mockWordList;
  let playResolved;

  beforeEach(() => {
    MockHelper.mockFiglet();
    clearSpy = MockHelper.mockClear();
    mockChalk = MockHelper.mockChalk();
    mockLogger = MockHelper.mockLogger();
    mockUiHelper = MockHelper.mockUiHelper();

    mockPrompts = {
      promptForGuess: new PromiseSpy(),
      promptForLetter: new PromiseSpy(),
      promptForAnswer: new PromiseSpy()
    };
    jest.mock('../hangman-prompts', () => mockPrompts);

    jest.mock('../../word-list', () => mockWordList = ['coconut', 'pebble', 'eye']);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const HangmanGame = require('../hangman');
    hangmanGame = new HangmanGame();
    hangmanGame.play().then(() => { playResolved = true; });
  });

  afterEach(() => {
    jest.resetModules();
  });

  function showLetterPrompt() {
    mockPrompts.promptForGuess.onSuccess({ guess: hangmanConstants.LETTER });
  }

  function showAnswerPrompt() {
    mockPrompts.promptForGuess.onSuccess({ guess: hangmanConstants.ANSWER });
  }

  function guessLetter(letter) {
    mockPrompts.promptForLetter.onSuccess({ letter });
  }

  function guessAnswer(answer) {
    mockPrompts.promptForAnswer.onSuccess({ answer });
  }

  describe('Starting the game', () => {
    it('clears the console', () => {
      expect(clearSpy).toHaveBeenCalled();
    });

    it('randomly picks a word', () => {
      const expected = mockWordList[0];
      expect(hangmanGame.word).toBe(expected);
    });

    it('displays game title and info', () => {
      expect(mockLogger.log).toHaveBeenCalledWith(hangmanConstants.GAME_TITLE);
      expect(mockLogger.log).toHaveBeenCalledWith(hangmanConstants.GAME_INFO);
    });

    it('displays placeholder per letter in word', () => {
      const expected = Array(mockWordList[0].length).fill('_').join('');
      expect(mockLogger.log).toHaveBeenCalledWith(expected);
    });

    it('displays prompt asking user what to do', () => {
      expect(mockPrompts.promptForGuess).toHaveBeenCalled();
    });
  });

  describe('Select to guess a letter', () => {
    beforeEach(() => {
      showLetterPrompt();
    });

    it('prompts user for letter', () => {
      expect(mockPrompts.promptForLetter).toHaveBeenCalled();
    });

    describe('and letter is correct', () => {
      it('displays guessed letter in correct place in word', () => {
        guessLetter('t');
        expect(mockLogger.log).toHaveBeenCalledWith('______t');
      });

      it('displays multiple guessed letters in correct place if more than one occurence', () => {
        guessLetter('c');
        expect(mockLogger.log).toHaveBeenCalledWith('c_c____');
      });

      it('still displays previously correctly guessed letters', () => {
        guessLetter('t');
        guessLetter('c');
        expect(mockLogger.log).toHaveBeenCalledWith('c_c___t');
      });

      it('displays prompt asking user what to do', () => {
        mockPrompts.promptForGuess = new PromiseSpy();
        guessLetter('t');
        expect(mockPrompts.promptForGuess).toHaveBeenCalled();
      });

      describe('and user has guessed last letter', () => {
        beforeEach(() => {
          guessLetter('c');
          guessLetter('o');
          guessLetter('n');
          guessLetter('u');
          guessLetter('t');
        });

        it('shows user answer in green', () => {
          expect(mockUiHelper.showAnswer).toHaveBeenCalledWith('coconut');
        });

        it('shows user winner message', () => {
          expect(mockUiHelper.flashWinner).toHaveBeenCalled();
        });

        it('resolves promise from play() finished showing winning message', (done) => {
          mockUiHelper.flashWinner.onSuccess();
          jest.useRealTimers();
          setTimeout(() => {
            expect(playResolved).toBe(true);
            done();
          }, 10);
        });
      });
    });

    describe('and letter is incorrect', () => {
      function checkIncorrectGuess(letter, stage) {
        guessLetter(letter);
        expect(mockLogger.log).toHaveBeenCalledWith(hangmanStages[stage]);
      }

      it('draws a line of the hangman image', () => {
        const incorrectGuesses = ['z', 'q', 'w', 'e', 'r', 'y', 'i', 'p', 'a', 's'];
        incorrectGuesses.forEach((letter, idx) => {
          checkIncorrectGuess(letter, idx + 1);
        });
      });

      it('still displays previously correctly guessed letters', () => {
        guessLetter('n');
        guessLetter('x');
        expect(mockLogger.log).toHaveBeenCalledWith('____n__');
      });

      it('displays prompt asking user what to do', () => {
        mockPrompts.promptForGuess = new PromiseSpy();
        guessLetter('x');
        expect(mockPrompts.promptForGuess).toHaveBeenCalled();
      });

      describe('and user is on last turn', () => {
        beforeEach(() => {
          const incorrectGuesses = ['z', 'q', 'w', 'e', 'r', 'y', 'i', 'p', 'a', 's'];
          incorrectGuesses.forEach((letter) => {
            guessLetter(letter);
          });
        });

        it('stops showing prompt asking user what to do', () => {
          mockPrompts.promptForGuess = new PromiseSpy();
          guessLetter('d');
          expect(mockPrompts.promptForGuess).not.toHaveBeenCalled();
        });

        it('shows user losing message in red', () => {
          guessLetter('d');
          expect(mockChalk.red).toHaveBeenCalledWith(gameConstants.GAME_OVER_MSG);
          expect(mockLogger.log).toHaveBeenCalledWith(gameConstants.GAME_OVER_MSG);
          expect(mockUiHelper.revealAnswer).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Select to guess answer', () => {
    beforeEach(() => {
      showAnswerPrompt();
    });

    it('prompts user for answer', () => {
      expect(mockPrompts.promptForAnswer).toHaveBeenCalled();
    });

    describe('and answer is correct', () => {
      beforeEach(() => {
        guessAnswer('coconut');
      });

      it('shows user answer in green', () => {
        expect(mockUiHelper.showAnswer).toHaveBeenCalledWith('coconut');
      });

      it('shows user winner message', () => {
        expect(mockUiHelper.flashWinner).toHaveBeenCalled();
      });

      it('resolves promise from play() finished showing winning message', (done) => {
        mockUiHelper.flashWinner.onSuccess();
        jest.useRealTimers();
        setTimeout(() => {
          expect(playResolved).toBe(true);
          done();
        }, 10);
      });
    });

    describe('and answer is incorrect', () => {
      it('displays incorrect guess message in red', () => {
        guessAnswer('banana');
        expect(mockChalk.red).toHaveBeenCalledWith(hangmanConstants.INCORRECT_GUESS);
        expect(mockLogger.log).toHaveBeenCalledWith(hangmanConstants.INCORRECT_GUESS);
      });

      it('draws a line of the hangman image', () => {
        guessAnswer('kumquat');
        expect(mockLogger.log).toHaveBeenCalledWith(hangmanStages[1]);
      });

      it('still displays previously correctly guessed letters', () => {
        showLetterPrompt();
        guessLetter('c');
        showAnswerPrompt();
        guessAnswer('pineapple');
        expect(mockLogger.log).toHaveBeenCalledWith('c_c____');
      });

      it('displays prompt asking user what to do', () => {
        mockPrompts.promptForGuess = new PromiseSpy();
        guessAnswer('pomegranate');
        expect(mockPrompts.promptForGuess).toHaveBeenCalled();
      });

      describe('and user is on last turn', () => {
        beforeEach(() => {
          showLetterPrompt();
          const incorrectGuesses = ['z', 'q', 'w', 'e', 'r', 'y', 'i', 'p', 'a', 's '];
          incorrectGuesses.forEach((letter) => {
            guessLetter(letter);
          });
          showAnswerPrompt();
        });

        it('stops showing prompt asking user what to do', () => {
          mockPrompts.promptForGuess = new PromiseSpy();
          guessAnswer('orange');
          expect(mockPrompts.promptForGuess).not.toHaveBeenCalled();
        });

        it('shows user losing message in red', () => {
          guessAnswer('orange');
          expect(mockChalk.red).toHaveBeenCalledWith(gameConstants.GAME_OVER_MSG);
          expect(mockLogger.log).toHaveBeenCalledWith(gameConstants.GAME_OVER_MSG);
          expect(mockUiHelper.revealAnswer).toHaveBeenCalled();
        });
      });
    });
  });
});
