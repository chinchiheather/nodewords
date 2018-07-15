
/* eslint-env jest */
/* eslint-disable no-return-assign, global-require */

const anagramConstants = require('../anagram-constants');

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
  let promptCallback;
  let word;
  let shuffled;
  let showAnswerSpy;
  let flashWinnerSpy;
  let flashWinnerCallback;
  let playResolved;

  beforeEach(() => {
    jest.useFakeTimers();

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
        then: jest.fn((callback) => { promptCallback = callback; }),
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
          })),
          showAnswer: showAnswerSpy = jest.fn(),
          flashWinner: flashWinnerSpy = jest.fn(() => ({
            then: (callback) => { flashWinnerCallback = callback; }
          }))
        };
      });

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
      expect(logSpy).toHaveBeenCalledWith(anagramConstants.GAME_TITLE);
      expect(logSpy).toHaveBeenCalledWith(anagramConstants.GAME_INFO);
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

      it('shows user losing message in red', () => {
        expect(chalkMock.red).toHaveBeenCalledWith(anagramConstants.GAME_OVER_MSG);
        expect(logSpy).toHaveBeenCalledWith(anagramConstants.GAME_OVER_MSG);
        expect(revealAnswerSpy).toHaveBeenCalled();
      });
    });
  });

  describe('User inputs an answer', () => {
    describe('and answer is incorrect', () => {
      beforeEach(() => {
        setInterval.mockReset();
        promptCallback({ solution: 'incorrect guess' });
      });

      it('stops countdown temporarily', () => {
        expect(clearInterval).toHaveBeenCalled();
      });

      it('shows user incorrect guess message in red', () => {
        expect(chalkMock.red).toHaveBeenCalledWith(anagramConstants.INCORRECT_GUESS_MSG);
        expect(writeSpy).toHaveBeenCalledWith(anagramConstants.INCORRECT_GUESS_MSG);
      });

      it('resumes countdown after 1s', () => {
        jest.advanceTimersByTime(1000);
        expect(setInterval).toHaveBeenCalled();
      });

      it('removes incorrect guess message after 1s', () => {
        expect(readlineMock.cursorTo).toHaveBeenCalledWith(process.stdin, 0, 10);
        expect(readlineMock.clearLine).toHaveBeenCalled();
      });
    });

    describe('and answer is correct', () => {
      beforeEach(() => {
        promptCallback({ solution: 'ripples' });
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

      it('shows user answer in green', () => {
        expect(showAnswerSpy).toHaveBeenCalledWith('ripples');
      });

      it('shows user winner message', () => {
        expect(flashWinnerSpy).toHaveBeenCalled();
      });

      it('resolves promise from play() finished showing winning message', (done) => {
        flashWinnerCallback();
        jest.useRealTimers();
        setTimeout(() => {
          expect(playResolved).toBe(true);
          done();
        }, 10);
      });
    });
  });
});
