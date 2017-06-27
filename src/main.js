import Game from './fallingsky/game.js';
import TheGreatRevolt from './fallingsky/scenarios/theGreatRevolt';
import ko from './lib/knockout';
import TestMarch from './fallingsky/test/arverni/testMarch';

// while(true) {
    const game = new Game({scenario: TheGreatRevolt});
    ko.applyBindings(game);
    // game.start();
    //
    // while (!game.ended()) {
    //     game.nextTurn();
    // }

// }
// TestMarch.run();
//TestRampage.run();
// TestBattle.run();
// import _ from './lib/lodash';
// import Map from './fallingsky/util/map';
// import FallingSkyGameState from './fallingsky/state/fallingSkyGameState';
//
// const state = new FallingSkyGameState();
// const numRegions = 2;
// const regions = _.sampleSize(state.regions, numRegions);
// const paths = Map.findPathsToRegion(state, regions[0].id, regions[1].id, 2);

// const solutions = Map.findMinimumAdjacent(regions);
//
// console.log('Regions: ' + _(regions).map('name').join(','));
// console.log('Solutions: ');
// _.each(solutions, (solution) => {
//     console.log(_(solution).map('id').join('->'));
// });
//
// console.log('ran');