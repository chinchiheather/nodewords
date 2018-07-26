/* eslint-env jest */
/* eslint-disable no-return-assign, global-require, prefer-destructuring */

const wordsearchConstants = require('../wordsearch-constants');
const MockHelper = require('../../../../test/helpers/mock-helper');

const mockWordList = [
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
];
const mockLetterList = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'
];

jest.mock('../../word-list', () => mockWordList);
jest.mock('../wordsearch-letter-list', () => mockLetterList);

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
  let randomReturnVals;

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

  /**
   * Sets result of Math.random for selecting words, selecting position of
   * words, and then the letters to fill in the space between
   */
  function mockFullGrid() {
    const selectWordRandomReturnVals = Array(15).fill(null).map((val, idx) => idx / 15);

    const wordPosRandomReturnVals = Array(15).fill(null).map((item, idx) => [
      0, idx / 15, 0
    ]).reduce((prev, curr) => [...prev, ...curr], []);

    const letterRandomReturnVals = mockWordList
      .map(word => Array(15 - word.length).fill(null)
        .map((item, idx) => idx / 12)).reduce((prev, curr) => [...prev, ...curr], []);

    randomReturnVals = [
      ...selectWordRandomReturnVals,
      ...wordPosRandomReturnVals,
      ...letterRandomReturnVals
    ];

    mockMathRandom(randomReturnVals);
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

    mockFullGrid();
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
      const grid = wordsearchGame.grid;
      const expectedWord = [];
      for (let i = 0, len = mockWordList[0].length; i < len; i++) {
        expectedWord.push(grid[0][i].letter);
      }

      expect(expectedWord.join('')).toEqual(mockWordList[0]);
    });

    it('fills in empty spaces in grid with random letters', () => {
      const grid = wordsearchGame.grid;
      const firstLine = grid[0].map(item => item.letter)
        .join('');
      const expected = mockWordList[0] + mockLetterList.slice(0, 15 - mockWordList[0].length).join('');

      expect(firstLine).toBe(expected);
    });

    it('displays grid and word list to user', () => {
      const expectedLines = mockWordList.map((word) => {
        const gridLetters = word + mockLetterList.slice(0, 15 - word.length).join('');
        return gridLetters.split('').join(' ') + wordsearchConstants.WORD_SPACING + word;
      });
      expectedLines.forEach(((expected) => {
        expect(mockLogger.log).toHaveBeenCalledWith(expected);
      }));
    });
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
