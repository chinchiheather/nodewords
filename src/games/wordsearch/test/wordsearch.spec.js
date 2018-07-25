/* eslint-env jest */
/* eslint-disable no-return-assign, global-require, prefer-destructuring */

const wordsearchConstants = require('../wordsearch-constants');
const MockHelper = require('../../../../test/helpers/mock-helper');

describe('Wordsearch', () => {
  let wordsearchGame;

  let clearSpy;
  let mockReadline;
  let mockInterface;
  let mockChalk;
  let mockLogger;
  let mockUiHelper;

  let playResolved;
  let randomCallCount;
  let mockWordList;
  let randomReturnVals;

  jest.mock('../../word-list', () => mockWordList = [
    'apple',
    'banana',
    'cherry',
    'dragonfruit',
    'elderberry',
    'fig',
    'grape',
    'honeydew',
    'kiwi',
    'lemon',
    'mango',
    'nectarine',
    'orange',
    'pear',
    'quince'
  ]);

  function startGame() {
    const WordsearchGame = require('../wordsearch');
    wordsearchGame = new WordsearchGame();
    wordsearchGame.play().then(() => { playResolved = true; });
  }

  function mockMathRandom(returnVals) {
    let mockedRandom = jest.spyOn(Math, 'random');

    returnVals.forEach((val) => {
      mockedRandom = mockedRandom.mockReturnValueOnce(val);
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();

    MockHelper.mockFiglet();
    clearSpy = MockHelper.mockClear();
    mockReadline = MockHelper.mockReadline();
    mockChalk = MockHelper.mockChalk();
    mockLogger = MockHelper.mockLogger();
    mockUiHelper = MockHelper.mockUiHelper();

    const readline = MockHelper.mockReadline();
    mockReadline = readline.readline;
    mockInterface = readline.interface;

    randomReturnVals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(val => val / 15);
    mockMathRandom(randomReturnVals);

    startGame();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Starting the game', () => {
    it('clears the console', () => {
      expect(clearSpy).toHaveBeenCalled();
    });

    it('displays game title and info', () => {
      expect(mockLogger.log).toHaveBeenCalledWith(wordsearchConstants.GAME_TITLE);
      expect(mockLogger.log).toHaveBeenCalledWith(wordsearchConstants.GAME_INFO);
      expect(mockLogger.log).toHaveBeenCalledWith(wordsearchConstants.GAME_INSTRUCTIONS);
    });

    it('randomly picks word list', () => {
      expect(wordsearchGame.wordsearchWordList).toEqual(mockWordList);
    });

    it('selects unique words for wordlist', () => {
      randomReturnVals = [0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(val => val / 15);
      mockMathRandom(randomReturnVals);
      startGame();

      expect(wordsearchGame.wordsearchWordList).toEqual(mockWordList);
    });

    it('sorts list alphabetically', () => {
      randomReturnVals = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13].map(val => val / 15);
      mockMathRandom(randomReturnVals);
      startGame();

      expect(wordsearchGame.wordsearchWordList).toEqual(mockWordList);
    });

    it('randomly positions words in grid', () => {
      randomReturnVals = [
        ...randomReturnVals, // these are for selecting words
        0, // this causes first word to be positioned horizontally
        0.999999, // this causes first word to be placed on last row
        0 // this causes first word to start at first col of last row
      ];
      mockMathRandom(randomReturnVals);
      startGame();

      // first word is 'apple'
      const grid = wordsearchGame.grid;
      const expectedWord = [];
      for (let i = 0, len = 'apple'.length; i < len; i++) {
        expectedWord.push(grid[14][i].letter);
      }

      expect(expectedWord.join('')).toEqual('apple');
    });

    it('fills in empty spaces in grid with random letters', () => {});

    it('displays grid to user', () => {});

    it('displays word list to user', () => {});
  });

  describe('Pressing arrow keys', () => {
    it('moves cursor in direction pressed', () => {});
    it('does not move cursor outside of grid', () => {});
  });

  describe('Selecting letter', () => {
    it('highlights letter if part of word', () => {

    });

    it('does nothing if letter is not part of word', () => {});

    describe('and another letter was previously selected', () => {
      it('keeps previous selection if part of same word', () => {});
      it('deselects previous letter if not part of same word', () => {});
    });

    describe('and letter is last in word', () => {
      it('marks full word in grid as found', () => {});
      it('marks word in word list as found', () => {});

      it('keeps previously found words marked as found', () => {});

      describe('and word is last to find', () => {
        it('shows user winner message', () => {
          // expect(mockUiHelper.flashWinner).toHaveBeenCalled();
        });

        it('resolves promise from play() when finished showing winning message', (/* done */) => {
          // mockUiHelper.flashWinner.onSuccess();
          // jest.useRealTimers();
          // setTimeout(() => {
          //   expect(playResolved).toBe(true);
          //   done();
          // }, 10);
        });
      });
    });
  });
});
