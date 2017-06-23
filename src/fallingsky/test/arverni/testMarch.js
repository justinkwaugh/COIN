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
import ArverniMarch from '../../../fallingsky/bots/arverni/arverniMarch';
import CommandModifier from '../../../fallingsky/commands/commandModifiers';


class TestBattle {
    static run() {
        this.testMarchToSpreadFromControlWithHarassment();
        this.testMarchToSpreadFromControl();
        this.testMarchToSpreadFromExactControl();
        this.testMarchToSpreadFromNoControl();
    }

    static testMarchToSpreadFromControlWithHarassment() {
        console.log("\n\n*** testMarchToSpreadFromControlWithHarassment ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 6});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: belgae, region: atrebatesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: aedui, region: atrebatesRegion, count: 4});

        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        treveriRegion.logState();
    }

    static testMarchToSpreadFromControl() {
        console.log("\n\n*** testMarchToSpreadFromControl ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceAuxilia.perform(state, {faction: romans, region: treveriRegion, count: 2});


        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        treveriRegion.logState();
    }

    static testMarchToSpreadFromNoControl() {
        console.log("\n\n*** testMarchToSpreadFromNoControl ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: carnutesRegion, count: 6});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 6});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: belgae, region: atrebatesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: aedui, region: atrebatesRegion, count: 4});

        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        carnutesRegion.logState();
    }

    static testMarchToSpreadFromExactControl() {
        console.log("\n\n*** testMarchToSpreadFromExactControl ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: carnutesRegion, count: 5});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 6});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: belgae, region: atrebatesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: aedui, region: atrebatesRegion, count: 4});

        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        carnutesRegion.logState();
    }
}

export default TestBattle;