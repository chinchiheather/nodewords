const figlet = require('figlet');
const clear = require('clear');

function playAnagram() {
  // clear console
  clear();

  // display game title
  console.log(figlet.textSync('Anagram', { font: 'Ogre' }));
}

module.exports = {
  play: playAnagram
};
