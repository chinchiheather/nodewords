
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
  let word;
  let shuffled;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    // todo: centralise some of this mocking so other files can use them
    jest.mock('clear', () => clearSpy = jest.fn());
    jest.mock('figlet', () => ({
      textSync: text => text
    }));
    jest.mock('readline', () => ({
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
          }
        }
      }))
    }));
    jest.mock('clui', () => ({
      Gauge: gaugeSpy = jest.fn().mockReturnValue(gaugeString = '|||||')
    }));
    jest.mock('../../../helpers/logger', () =>
      function mockLogger() {
        return {
          log: logSpy = jest.fn(),
          write: writeSpy = jest.fn()
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
    jest.resetAllMocks();
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

    it('displays countdown progress bar', () => {
      expect(logSpy).toHaveBeenCalledWith(gaugeString);
    });

    it('displays prompt for user to input answer', () => {
      const question = promptSpy.mock.calls[0][0][0];
      expect(question.type).toBe('input');
      expect(question.message).toBe('Answer');
    });
  });

  describe('Counting down', () => {
    it('updates countdown progress bar', () => {

    });
  });
});
