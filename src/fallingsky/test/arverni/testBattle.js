import _ from '../../../lib/lodash'
import FallingSkyGameState from '../../../fallingsky/state/fallingSkyGameState'
import FactionIDs from '../../../fallingsky/config/factionIds'
import RegionIDs from '../../../fallingsky/config/regionIds'
import TribeIDs from '../../../fallingsky/config/tribeIds'

import PlaceWarbands from '../../../fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from '../../../fallingsky/actions/placeAlliedTribe'
import PlaceFort from '../../../fallingsky/actions/placeFort'
import PlaceLeader from '../../../fallingsky/actions/placeLeader'
import PlaceAuxilia from '../../../fallingsky/actions/placeAuxilia'
import PlaceLegions from '../../../fallingsky/actions/placeLegions'
import RevealPieces from '../../../fallingsky/actions/revealPieces'
import ArverniBattle from '../../../fallingsky/bots/arverni/arverniBattle';
import CommandModifier from '../../../fallingsky/commands/commandModifiers';


class TestBattle {
    static run() {
        this.testRomanVercingetorixBattle();
    }

    static testRomanVercingetorixBattle() {
        console.log("\n\n*** testRomanVercingetorixBattle ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        arverni.setResources(20);

        console.log('*** SHOULD BATTLE ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: arverni, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 8});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 5});
        ArverniBattle.battle(state, new CommandModifier());

        console.log('*** SHOULD MARCH ***');
        PlaceLeader.perform(state, {faction: romans, region: mandubiiRegion});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 6});
        ArverniBattle.battle(state, new CommandModifier());
    }
}

export default TestBattle;