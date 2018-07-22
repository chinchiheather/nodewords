function generateWinnerMessage() {
  const starChar = '\u2605';
  const tripleStars = Array(3).fill(starChar).join(' ');
  return `${tripleStars} WINNER! ${tripleStars}\n`;
}

module.exports = {
  GAME_OVER_MSG: '\nGAME OVER!\n',
  STAR_CHAR: '\u2605',
  WINNER_MSG: generateWinnerMessage()
};
