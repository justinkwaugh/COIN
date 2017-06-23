import _ from '../../../lib/lodash'
import FallingSkyGameState from '../../../fallingsky/state/fallingSkyGameState'
import FactionIDs from '../../../fallingsky/config/factionIds'
import RegionIDs from '../../../fallingsky/config/regionIds'
import TribeIDs from '../../../fallingsky/config/tribeIds'

import PlaceWarbands from '../../../fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from '../../../fallingsky/actions/placeAlliedTribe'
import PlaceLeader from '../../../fallingsky/actions/placeLeader'
import PlaceAuxilia from '../../../fallingsky/actions/placeAuxilia'
import RevealPieces from '../../../fallingsky/actions/revealPieces'
import BelgaeEnlist from '../../../fallingsky/bots/belgae/belgaeEnlist';
import CommandModifier from '../../../fallingsky/commands/commandModifiers';
import Battle from '../../commands/battle';

class TestEnlist {
    static run() {
        this.testEnlistForBattle();
        this.testEnlistForCommandBattle();
        this.testEnlistForCommandRally();
        this.testEnlistForMarch();
    }

    static testEnlistForBattle() {
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        // Should
        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceLeader.perform(state, {faction: belgae, region: biturigesRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: biturigesRegion, count: 2});
        PlaceAuxilia.perform(state, {faction: romans, region: biturigesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: germanic, region: biturigesRegion, count: 1});

        const battleResult = Battle.test(state, {
            region: biturigesRegion,
            attackingFactionId: FactionIDs.BELGAE,
            defendingFactionId: FactionIDs.ROMANS
        });

        BelgaeEnlist.enlist(
            state, new CommandModifier(
                {
                    commandSpecific: {
                        battles: [battleResult]
                    }
                }));

    }

    static testEnlistForCommandBattle() {
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceLeader.perform(state, {faction: belgae, region: biturigesRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: biturigesRegion, count: 0});
        PlaceAuxilia.perform(state, {faction: romans, region: biturigesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: germanic, region: biturigesRegion, count: 8});

        BelgaeEnlist.enlist(state, new CommandModifier());

    }

    static testEnlistForCommandRally() {
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceLeader.perform(state, {faction: belgae, region: biturigesRegion});
        PlaceWarbands.perform(state, {faction: germanic, region: biturigesRegion, count: 8});

        BelgaeEnlist.enlist(state, new CommandModifier());

    }

    static testEnlistForMarch() {
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        PlaceLeader.perform(state, {faction: belgae, region: nerviiRegion});

        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceAlliedTribe.perform(state, { faction: germanic, region: sugambriRegion, tribeId: TribeIDs.SUGAMBRI});
        PlaceAlliedTribe.perform(state, { faction: germanic, region: sugambriRegion, tribeId: TribeIDs.SUEBI_NORTH});
        PlaceWarbands.perform(state, {faction: germanic, region: sugambriRegion, count: 8});

        console.log('*** Should be no march ***');
        // Should not march in place
        BelgaeEnlist.enlist(state, new CommandModifier());

        RevealPieces.perform(state, {faction: germanic, region: sugambriRegion, count: 3});

        console.log('*** Should march in place ***');
        // Should march in place
        BelgaeEnlist.enlist(state, new CommandModifier());

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceAuxilia.perform(state, {faction: romans, region: treveriRegion, count: 2});

        console.log('*** Should march to treveri ***');
        // Should march to treveri place
        BelgaeEnlist.enlist(state, new CommandModifier());

    }
}

export default TestEnlist;