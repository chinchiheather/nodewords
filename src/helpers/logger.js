/* eslint-disable no-console */

class Logger {
  log(...args) {
    console.log(...args);
  }

  write(message) {
    process.stdin.write(message);
  }
}

module.exports = Logger;
