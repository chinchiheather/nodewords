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


    it('randomly picks word list', () => {
    });

    it('randomly positions words in grid', () => {});

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
