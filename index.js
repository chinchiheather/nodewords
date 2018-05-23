const figlet = require('figlet');
const GameController = require('./src/game-controller');

(function start() {
  // display app title
  console.log(figlet.textSync('Nodewords', { font: 'Ogre' }));

  const gameController = new GameController();
  gameController.pickGame();
}());
