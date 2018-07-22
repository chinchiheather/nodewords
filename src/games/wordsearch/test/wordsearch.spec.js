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

    const WordsearchGame = require('../wordsearch');
    wordsearchGame = new WordsearchGame();
    wordsearchGame.play().then(() => { playResolved = true; });
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
  });
});
