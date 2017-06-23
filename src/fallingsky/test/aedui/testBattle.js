import _ from '../../../lib/lodash'
import FallingSkyGameState from '../../../fallingsky/state/fallingSkyGameState'
import FactionIDs from '../../../fallingsky/config/factionIds'
import RegionIDs from '../../../fallingsky/config/regionIds'
import TribeIDs from '../../../fallingsky/config/tribeIds'

import PlaceWarbands from '../../../fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from '../../../fallingsky/actions/placeAlliedTribe'
import PlaceCitadel from '../../../fallingsky/actions/placeCitadel'
import PlaceLeader from '../../../fallingsky/actions/placeLeader'
import PlaceAuxilia from '../../../fallingsky/actions/placeAuxilia'
import PlaceFort from '../../../fallingsky/actions/placeFort'
import PlaceLegions from '../../../fallingsky/actions/placeLegions'

import Battle from '../../../fallingsky/commands/battle'

import AeduiBot from '../../../fallingsky/bots/aedui/aeduiBot';
import AeduiBattle from '../../../fallingsky/bots/aedui/aeduiBattle';
import CommandModifier from '../../../fallingsky/commands/commandModifiers';

class TestBattle {
    static run() {
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        aedui.setResources(20);

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceAlliedTribe.perform(state, {faction: aedui, region: aeduiRegion, tribeId: TribeIDs.AEDUI});
        PlaceWarbands.perform(state, {faction: aedui, region: aeduiRegion, count: 4});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceCitadel.perform(
            state, {
                faction: aedui,
                region: mandubiiRegion,
                tribeId: TribeIDs.MANDUBII
            }, true);
        PlaceAlliedTribe.perform(state, {faction: arverni, region: mandubiiRegion, tribeId: TribeIDs.SENONES});
        PlaceAlliedTribe.perform(state, {faction: aedui, region: mandubiiRegion, tribeId: TribeIDs.LINGONES});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 3});
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 6});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceWarbands.perform(state, {faction: arverni, region: sequaniRegion, count: 1});

        state.logState();
        const aeduiBot = new AeduiBot();
        AeduiBattle.battle(state, new CommandModifier(), aeduiBot, aedui);
    }
}

export default TestBattle;