
/* eslint-env jest */
/* eslint-disable no-return-assign, global-require, prefer-destructuring */

const anagramConstants = require('../anagram-constants');
const MockHelper = require('../../../../test/helpers/mock-helper');

describe('Anagram', () => {
  let anagramGame;

  let clearSpy;
  let mockReadline;
  let mockInquirer;
  let mockUi;
  let mockPrompt;
  let mockClui;
  let mockChalk;
  let mockLogger;
  let mockUiHelper;

  let gaugeString;
  let mockWordList;
  let word;
  let shuffled;
  let playResolved;

  beforeEach(() => {
    jest.useFakeTimers();

    MockHelper.mockFiglet();
    clearSpy = MockHelper.mockClear();
    mockReadline = MockHelper.mockReadline();
    mockClui = MockHelper.mockClui(gaugeString = '|||||');
    mockChalk = MockHelper.mockChalk();
    mockLogger = MockHelper.mockLogger();
    mockUiHelper = MockHelper.mockUiHelper();

    const inquirer = MockHelper.mockInquirer();
    mockInquirer = inquirer.inquirer;
    mockUi = inquirer.ui;
    mockPrompt = inquirer.prompt;

    jest.mock('../anagram-word-list', () => mockWordList =
      [{ slipper: 'ripples' }, { license: 'silence' }, { trainer: 'terrain' }]);

    jest.spyOn(Math, 'random').mockReturnValue(0);

    const AnagramGame = require('../anagram');
    anagramGame = new AnagramGame();
    anagramGame.play().then(() => { playResolved = true; });

    [word] = mockWordList;
    [shuffled] = Object.keys(word);
  });

  afterEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Starting the game', () => {
    it('clears the console', () => {
      expect(clearSpy).toHaveBeenCalled();
    });

    it('randomly picks a word', () => {
      const expected = word[shuffled];
      expect(anagramGame.answer).toBe(expected);
    });

    it('displays game title and info', () => {
      expect(mockLogger.log).toHaveBeenCalledWith(anagramConstants.GAME_TITLE);
      expect(mockLogger.log).toHaveBeenCalledWith(anagramConstants.GAME_INFO);
    });

    it('displays anagram to solve', () => {
      expect(mockLogger.log).toHaveBeenCalledWith(shuffled);
    });

    it('displays prompt for user to input answer', () => {
      const question = mockInquirer.prompt.mock.calls[0][0][0];
      expect(question.type).toBe('input');
      expect(question.message).toBe('Answer');
    });

    it('displays countdown progress bar', () => {
      expect(mockLogger.log).toHaveBeenCalledWith(gaugeString);
    });

    it('starts countdown', () => {
      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe('Countdown progress bar', () => {
    function checkProgressBar(current) {
      expect(mockClui.Gauge).toHaveBeenCalledWith(current, 30, 31, 30, `${current}s`);
    }

    it('starts at 30s', () => {
      checkProgressBar(30);
    });

    describe('on second countdown', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(1000);
      });

      it('updates progress bar', () => {
        checkProgressBar(29);

        jest.advanceTimersByTime(1000);
        checkProgressBar(28);
      });

      it('redisplays answer prompt', () => {
        expect(mockUi.run).toHaveBeenCalled();
      });
    });

    describe('on reaching 0s', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(29000);

        mockReadline.cursorTo.mockReset();
        mockReadline.clearLine.mockReset();
        jest.advanceTimersByTime(1000);
      });

      it('stops countdown', () => {
        expect(clearInterval).toHaveBeenCalled();
      });

      it('stops showing progress bar', () => {
        expect(mockReadline.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 10);
        expect(mockReadline.clearLine).toHaveBeenCalled();
      });

      it('stops showing answer prompt', () => {
        expect(mockReadline.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 11);
        expect(mockReadline.clearLine).toHaveBeenCalled();

        expect(mockUi.close).toHaveBeenCalled();
      });

      it('shows user losing message in red', () => {
        expect(mockChalk.red).toHaveBeenCalledWith(anagramConstants.GAME_OVER_MSG);
        expect(mockLogger.log).toHaveBeenCalledWith(anagramConstants.GAME_OVER_MSG);
        expect(mockUiHelper.revealAnswer).toHaveBeenCalled();
      });
    });
  });

  describe('User inputs an answer', () => {
    describe('and answer is incorrect', () => {
      beforeEach(() => {
        setInterval.mockReset();
        mockPrompt.onSuccess({ solution: 'incorrect guess' });
      });

      it('stops countdown temporarily', () => {
        expect(clearInterval).toHaveBeenCalled();
      });

      it('shows user incorrect guess message in red', () => {
        expect(mockChalk.red).toHaveBeenCalledWith(anagramConstants.INCORRECT_GUESS_MSG);
        expect(mockLogger.write).toHaveBeenCalledWith(anagramConstants.INCORRECT_GUESS_MSG);
      });

      it('resumes countdown after 1s', () => {
        jest.advanceTimersByTime(1000);
        expect(setInterval).toHaveBeenCalled();
      });

      it('removes incorrect guess message after 1s', () => {
        expect(mockReadline.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 10);
        expect(mockReadline.clearLine).toHaveBeenCalled();
      });
    });

    describe('and answer is correct', () => {
      beforeEach(() => {
        mockPrompt.onSuccess({ solution: 'ripples' });
      });

      it('stops countdown', () => {
        expect(clearInterval).toHaveBeenCalled();
      });

      it('stops showing progress bar', () => {
        expect(mockReadline.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 10);
        expect(mockReadline.clearLine).toHaveBeenCalled();
      });

      it('stops showing answer prompt', () => {
        expect(mockReadline.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 11);
        expect(mockReadline.clearLine).toHaveBeenCalled();

        expect(mockUi.close).toHaveBeenCalled();
      });

      it('shows user answer in green', () => {
        expect(mockUiHelper.showAnswer).toHaveBeenCalledWith('ripples');
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
});
