import Game from './fallingsky/game.js';
import TheGreatRevolt from './fallingsky/scenarios/theGreatRevolt';
import ko from './lib/knockout';

const game = new Game({scenario: TheGreatRevolt});
ko.applyBindings(game);