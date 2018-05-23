const GameController = require('./src/game-controller');

(function start() {
  const gameController = new GameController();
  gameController.pickGame();
}());
