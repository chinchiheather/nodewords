/* eslint-env jest */

/**
 * Helper class for unit testing async code using promises
 * Make it easy to call the success/error callbacks passing in whatever data you want
 *
 * If you have multiple .then()'s chained, call spy.onSuccess/spy.onError consecutive times
 * to fire the chained callbacks
 *
 */

const SUCCESS = 'success';
const ERROR = 'error';

class PromiseSpy {
  constructor() {
    this.successCallbacks = [];
    this.errorCallbacks = [];

    this.spy = jest.fn(() => ({
      then: (success, error) => this.mockThen(success, error)
    }));
    this.spy.onSuccess = (...params) => this.triggerCallback(SUCCESS, params);
    this.spy.onError = (...params) => this.triggerCallback(ERROR, params);
    return this.spy;
  }

  mockThen(success, error) {
    this.successCallbacks.push(success);
    this.errorCallbacks.push(error);
    return {
      then: (childSuccess, childError) =>
        this.mockThen(childSuccess, childError)
    };
  }

  triggerCallback(type, callbackParams) {
    const callbacks =
      type === SUCCESS ? this.successCallbacks : this.errorCallbacks;
    let callback = callbacks[0];
    if (callbacks.length > 1) {
      callback = callbacks.shift();
    }
    if (callback && typeof callback === 'function') {
      callback(...callbackParams);
    }
  }
}

module.exports = PromiseSpy;
