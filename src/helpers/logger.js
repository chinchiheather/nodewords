/* eslint-disable no-console */

class Logger {
  log(...args) {
    console.log(...args);
  }

  write(input, message) {
    input.write(message);
  }
}

module.exports = Logger;
