
/* eslint-env jest */
/* eslint-disable no-return-assign, global-require */

describe('Anagram', () => {
  let anagramGame;

  let gaugeString;
  let clearSpy;
  let logSpy;
  let writeSpy;
  let gaugeSpy;
  let promptSpy;
  let mockWordList;
  let uiRunSpy;
  let uiCloseSpy;
  let revealAnswerSpy;
  let readlineMock;
  let chalkMock;
  let word;
  let shuffled;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    // todo: centralise some of this mocking so other files can use them
    // todo: use promise spy helper?
    jest.mock('clear', () => clearSpy = jest.fn());
    jest.mock('figlet', () => ({
      textSync: text => text
    }));
    jest.mock('readline', () => readlineMock = ({
      createInterface: jest.fn(),
      clearLine: jest.fn(),
      cursorTo: jest.fn()
    }));
    jest.mock('inquirer', () => ({
      prompt: promptSpy = jest.fn(() => ({
        then: () => null,
        ui: {
          rl: {
            on: () => null
          },
          run: uiRunSpy = jest.fn(),
          close: uiCloseSpy = jest.fn()
        }
      }))
    }));
    jest.mock('clui', () => ({
      Gauge: gaugeSpy = jest.fn().mockReturnValue(gaugeString = '|||||')
    }));
    // todo: improve this and add chaining
    jest.mock('chalk', () => chalkMock = ({
      red: jest.fn(message => message),
      green: jest.fn(message => message)
    }));
    jest.mock('../../../helpers/logger', () =>
      function mockLogger() {
        return {
          log: logSpy = jest.fn(),
          write: writeSpy = jest.fn()
        };
      });
    jest.mock('../../../helpers/ui-helper', () =>
      function mockUiHelper() {
        return {
          revealAnswer: revealAnswerSpy = jest.fn(() => ({
            then: () => null
          }))
        };
      });

    jest.mock('../anagram-word-list', () => mockWordList =
      [{ slipper: 'ripples' }, { license: 'silence' }, { trainer: 'terrain' }]);

    jest.spyOn(Math, 'random').mockReturnValue(0);

    const AnagramGame = require('../anagram');
    anagramGame = new AnagramGame();
    anagramGame.play();

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

    it('displays game title', () => {
      expect(logSpy).toHaveBeenCalledWith('ANAGRAM');
    });

    it('displays anagram to solve', () => {
      expect(logSpy).toHaveBeenCalledWith(shuffled);
    });

    it('displays prompt for user to input answer', () => {
      const question = promptSpy.mock.calls[0][0][0];
      expect(question.type).toBe('input');
      expect(question.message).toBe('Answer');
    });

    it('displays countdown progress bar', () => {
      expect(logSpy).toHaveBeenCalledWith(gaugeString);
    });

    it('starts countdown', () => {
      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe('Countdown progress bar', () => {
    function checkProgressBar(current) {
      // todo: check cursor pos
      expect(gaugeSpy).toHaveBeenCalledWith(current, 30, 31, 30, `${current}s`);
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
        expect(uiRunSpy).toHaveBeenCalled();
      });
    });

    describe('on reaching 0s', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(29000);

        readlineMock.cursorTo.mockReset();
        readlineMock.clearLine.mockReset();
        jest.advanceTimersByTime(1000);
      });

      it('stops countdown', () => {
        expect(clearInterval).toHaveBeenCalled();
      });

      it('stops showing progress bar', () => {
        expect(readlineMock.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 10);
        expect(readlineMock.clearLine).toHaveBeenCalled();
      });

      it('stops showing answer prompt', () => {
        expect(readlineMock.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 11);
        expect(readlineMock.clearLine).toHaveBeenCalled();

        expect(uiCloseSpy).toHaveBeenCalled();
      });

      it('shows user losing message', () => {
        expect(chalkMock.red).toHaveBeenCalledWith('\nTIME\'S UP!\n');
        expect(logSpy).toHaveBeenCalledWith('\nTIME\'S UP!\n');
        expect(revealAnswerSpy).toHaveBeenCalled();
      });
    });
  });
});
