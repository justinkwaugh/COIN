import Game from './fallingsky/game.js';
import TheGreatRevolt from './fallingsky/scenarios/theGreatRevolt';
const game = new Game({scenario: TheGreatRevolt});
game.start();
game.state().logState();