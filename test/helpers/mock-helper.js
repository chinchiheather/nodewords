/* eslint-env jest */
/* eslint-disable no-return-assign */

const PromiseSpy = require('./promise-spy');

/**
 * Mocks commonly used libraries and classes, providing spies on their methods
 */
class MockHelper {
  static mockModule(moduleName, mockModule) {
    jest.mock(moduleName, () => mockModule);
    return mockModule;
  }

  static mockClear() {
    const mock = jest.fn();
    return this.mockModule('clear', mock);
  }

  static mockFiglet() {
    const mock = {
      textSync: text => text
    };
    return this.mockModule('figlet', mock);
  }

  static mockReadline() {
    const mockInterface = {
      input: {
        on: jest.fn(),
        removeListener: jest.fn()
      },
      close: jest.fn()
    };

    const mock = {
      createInterface: jest.fn(() => mockInterface),
      clearLine: jest.fn(),
      cursorTo: jest.fn()
    };

    return {
      readline: this.mockModule('readline', mock),
      interface: mockInterface
    };
  }

  static mockInquirer() {
    const mockUi = {
      rl: { on: jest.fn() },
      run: jest.fn(),
      close: jest.fn()
    };

    const mockPrompt = new PromiseSpy();
    mockPrompt.ui = mockUi;
    mockPrompt.then = mockPrompt().then;

    const mock = {
      prompt: jest.fn(() => mockPrompt)
    };

    return {
      inquirer: this.mockModule('inquirer', mock),
      ui: mockUi,
      prompt: mockPrompt
    };
  }

  static mockClui(gaugeString) {
    const mock = {
      Gauge: jest.fn().mockReturnValue(gaugeString)
    };
    return this.mockModule('clui', mock);
  }

  static mockChalk() {
    // todo: add chaining
    const mock = {
      red: jest.fn(message => message),
      green: jest.fn(message => message),
      grey: jest.fn(message => message),
      black: { bgGreen: jest.fn(message => message) }
    };
    return this.mockModule('chalk', mock);
  }

  static mockLogger() {
    const mock = {
      log: jest.fn(),
      write: jest.fn()
    };

    function mockLogger() {
      return mock;
    }

    this.mockModule('../../src/helpers/logger', mockLogger);
    return mock;
  }

  static mockUiHelper() {
    const mock = {
      revealAnswer: new PromiseSpy(),
      showAnswer: jest.fn(),
      flashWinner: new PromiseSpy()
    };

    function mockUiHelper() {
      return mock;
    }

    this.mockModule('../../src/helpers/ui-helper', mockUiHelper);
    return mock;
  }
}

module.exports = MockHelper;
