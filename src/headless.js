import _ from 'lib/lodash';
import FallingSkyVassalGameState from 'fallingsky/vassal/fallingSkyVassalGameState';
import CommandIDs from 'fallingsky/config/commandIDs';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import FactionActions from 'common/factionActions';
import TribeIDs from 'fallingsky/config/tribeIds';
import HumanPlayer from 'fallingsky/player/humanPlayer';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceFort from 'fallingsky/actions/placeFort';
import PlaceLeader from 'fallingsky/actions/placeLeader';
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia';
import PlaceLegions from 'fallingsky/actions/placeLegions';
import RevealPieces from 'fallingsky/actions/revealPieces';
import AeduiBattle from 'fallingsky/bots/aedui/aeduiBattle';
import TurnContext from 'common/turnContext';

import * as fs from 'fs';

module.exports = {
  start: function(gameStateFile) {
    console.log('Hello world: ' + gameStateFile);

    fs.readFile(gameStateFile, function (err, data) {
      if (err) {
        throw err; 
      }

      var json = JSON.parse(data.toString());
      const game = new FallingSkyVassalGameState(json);
      game.logState();
    });
  }
};

console.log('bot script file loaded');

//const game = new Game({scenario: TheGreatRevolt});
//game.start();
//game.state().logState();