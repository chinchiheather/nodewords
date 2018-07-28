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
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
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
  let keyPressHandler;

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
   * Mocks the building of the grid
   * Sets result of Math.random for selecting words, selecting position of
   * words, and then the letters to fill in the space between
   *
   * Grid will look like:
   *
   * a p p l e a b c d e f g h i j
   * b a n a n a a b c d e f g h i
   * c h e r r y a b c d e f g h i
   * d r a g o n f r u i t a b c d
   * e l d e r b e r r y a b c d e
   * f i g a b c d e f g h i j k l
   * g r a p e a b c d e f g h i j
   * h o n e y d e w a b c d e f g
   * k i w i a b c d e f g h i j k
   * l e m o n a b c d e f g h i j
   * m a n g o a b c d e f g h i j
   * n e c t a r i n e a b c d e f
   * o r a n g e a b c d e f g h i
   * p e a r a b c d e f g h i j k
   * q u i n c e a b c d e f g h i
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
    mockChalk = MockHelper.mockChalk();
    mockLogger = MockHelper.mockLogger();
    mockUiHelper = MockHelper.mockUiHelper();

    const readline = MockHelper.mockReadline();
    mockReadline = readline.readline;
    mockInterface = readline.interface;

    mockFullGrid();
    startGame();

    keyPressHandler = mockInterface.input.on.mock.calls[0][1];
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
    const startingRow = wordsearchConstants.STARTING_LINE + 15;
    const startingCol = 0;

    beforeEach(() => {
      mockReadline.cursorTo.mockReset();
    });

    it('moves cursor up when up key pressed', () => {
      keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      const expectedRow = startingRow - 1;
      expect(mockReadline.cursorTo)
        .toHaveBeenCalledWith(process.stdout, startingCol, expectedRow);
    });

    it('moves cursor down when down key pressed', () => {
      // need to move up a few times so can move down due to preventing users moving
      // cursor outside of grid
      keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      mockReadline.cursorTo.mockReset();
      keyPressHandler('', { name: wordsearchConstants.KEY_DOWN });
      const expectedRow = startingRow - 1;
      expect(mockReadline.cursorTo)
        .toHaveBeenCalledWith(process.stdout, startingCol, expectedRow);
    });

    it('moves cursor right 2 places when right key pressed', () => {
      keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
      const expectedCol = startingCol + 2;
      expect(mockReadline.cursorTo)
        .toHaveBeenCalledWith(process.stdout, expectedCol, startingRow);
    });

    it('moves cursor left 2 places when left key pressed', () => {
      // need to move right a few times so can move left due to preventing users moving
      // cursor outside of grid
      keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
      keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
      mockReadline.cursorTo.mockReset();
      keyPressHandler('', { name: wordsearchConstants.KEY_LEFT });
      const expectedCol = startingCol + 2;
      expect(mockReadline.cursorTo)
        .toHaveBeenCalledWith(process.stdout, expectedCol, startingRow);
    });

    it('does not move cursor outside of grid to the left', () => {
      keyPressHandler('', { name: wordsearchConstants.KEY_LEFT });
      expect(mockReadline.cursorTo).not.toHaveBeenCalled();
    });

    it('does not move cursor outside of grid to the right', () => {
      for (let i = 0; i < 14; i++) {
        keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
      }
      mockReadline.cursorTo.mockReset();
      keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
      expect(mockReadline.cursorTo).not.toHaveBeenCalled();
    });

    it('does not move cursor outside of grid to the top', () => {
      for (let i = 0; i < 15; i++) {
        keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      }
      mockReadline.cursorTo.mockReset();
      keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      expect(mockReadline.cursorTo).not.toHaveBeenCalled();
    });

    it('does not move cursor outside of grid to the bottom', () => {
      keyPressHandler('', { name: wordsearchConstants.KEY_DOWN });
      expect(mockReadline.cursorTo).not.toHaveBeenCalled();
    });
  });

  describe('Selecting letter', () => {
    it('highlights letter if part of word', () => {
      keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });

      expect(mockChalk.black.bgGreen).toHaveBeenCalledWith('q');
    });

    it('does nothing if letter is not part of word', () => {
      keyPressHandler('', { name: wordsearchConstants.KEY_UP });
      for (let i = 0; i < 6; i++) {
        keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
      }
      keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });

      expect(mockChalk.black.bgGreen).not.toHaveBeenCalled();
    });

    describe('and another letter was previously selected', () => {
      beforeEach(() => {
        keyPressHandler('', { name: wordsearchConstants.KEY_UP });
        keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        mockChalk.black.bgGreen.mockReset();
      });

      it('keeps previous selection if part of same word', () => {
        keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
        keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });

        expect(mockChalk.black.bgGreen).toHaveBeenCalledWith('q');
        expect(mockChalk.black.bgGreen).toHaveBeenCalledWith('u');
      });

      it('deselects previous letter if not part of same word', () => {
        keyPressHandler('', { name: wordsearchConstants.KEY_UP });
        keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });

        expect(mockChalk.black.bgGreen).toHaveBeenCalledWith('p');
        expect(mockChalk.black.bgGreen).not.toHaveBeenCalledWith('q');
      });
    });

    describe('and letter is last in word', () => {
      beforeEach(() => {
        keyPressHandler('', { name: wordsearchConstants.KEY_UP });
        keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        for (let i = 0; i < 5; i++) {
          keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
          keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        }
      });

      it('marks full word in grid as found', () => {
        expect(mockChalk.green).toHaveBeenCalledWith('q');
        expect(mockChalk.green).toHaveBeenCalledWith('u');
        expect(mockChalk.green).toHaveBeenCalledWith('i');
        expect(mockChalk.green).toHaveBeenCalledWith('n');
        expect(mockChalk.green).toHaveBeenCalledWith('c');
        expect(mockChalk.green).toHaveBeenCalledWith('e');
      });

      it('marks word in word list as found', () => {
        expect(mockChalk.green).toHaveBeenCalledWith('quince');
      });

      it('keeps previously found words marked as found', () => {
        for (let i = 0; i < 5; i++) {
          keyPressHandler('', { name: wordsearchConstants.KEY_LEFT });
        }
        keyPressHandler('', { name: wordsearchConstants.KEY_UP });
        keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        for (let i = 0; i < 5; i++) {
          keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
          keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        }

        expect(mockChalk.green).toHaveBeenCalledWith('quince');
        expect(mockChalk.green).toHaveBeenCalledWith('pear');
      });
    });
    describe('and word is last to find', () => {
      beforeEach(() => {
        wordsearchGame.guessedWords = Array(14).fill(null).map((item, idx) => idx);
        keyPressHandler('', { name: wordsearchConstants.KEY_UP });
        keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        for (let i = 0; i < 5; i++) {
          keyPressHandler('', { name: wordsearchConstants.KEY_RIGHT });
          keyPressHandler('', { name: wordsearchConstants.KEY_SPACE });
        }
      });

      it('shows user winner message', () => {
        expect(mockUiHelper.flashWinner).toHaveBeenCalled();
      });

      it('resolves promise from play() when finished showing winning message', (done) => {
        mockUiHelper.flashWinner.onSuccess();
        jest.useRealTimers();
        setTimeout(() => {
          expect(playResolved).toBe(true);
          done();
        }, 10);
      });
    });
  });
});
